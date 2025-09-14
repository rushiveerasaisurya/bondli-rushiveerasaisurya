import {
  users,
  bonds,
  orders,
  trades,
  holdings,
  accounts,
  bondFractions,
  marketMakerQuotes,
  type User,
  type UpsertUser,
  type Bond,
  type InsertBond,
  type Order,
  type InsertOrder,
  type Trade,
  type InsertTrade,
  type Holding,
  type Account,
  type BondFraction,
  type MarketMakerQuote,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gt, lt } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserAccount(userId: string): Promise<Account | undefined>;
  
  // Bond operations
  getBonds(): Promise<Bond[]>;
  getBond(id: string): Promise<Bond | undefined>;
  getBondByIsin(isin: string): Promise<Bond | undefined>;
  createBond(bond: InsertBond): Promise<Bond>;
  updateBondPrice(bondId: string, price: number, currentYield: number): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderBook(bondId: string): Promise<{ buyOrders: Order[]; sellOrders: Order[] }>;
  getUserOrders(userId: string): Promise<Order[]>;
  updateOrderStatus(orderId: string, status: string, filledQuantity?: number): Promise<void>;
  
  // Trade operations
  createTrade(trade: InsertTrade): Promise<Trade>;
  getRecentTrades(bondId?: string): Promise<Trade[]>;
  getUserTrades(userId: string): Promise<Trade[]>;
  
  // Portfolio operations
  getUserHoldings(userId: string): Promise<Holding[]>;
  updateHolding(userId: string, bondId: string, quantity: number, averagePrice: number): Promise<void>;
  
  // Market maker operations
  getMarketMakerQuotes(bondId: string): Promise<MarketMakerQuote[]>;
  upsertMarketMakerQuote(userId: string, bondId: string, bidPrice?: number, askPrice?: number, bidSize?: number, askSize?: number): Promise<MarketMakerQuote>;
  
  // Account operations
  updateAccountBalance(userId: string, cashDelta: number, reservedDelta?: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Create account if user is new
    await db
      .insert(accounts)
      .values({
        userId: user.id,
        cashBalance: "1000000", // Initial demo balance
      })
      .onConflictDoNothing();
    
    return user;
  }

  async getUserAccount(userId: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.userId, userId));
    return account;
  }

  // Bond operations
  async getBonds(): Promise<Bond[]> {
    return await db.select().from(bonds).where(eq(bonds.isActive, true)).orderBy(bonds.issuer);
  }

  async getBond(id: string): Promise<Bond | undefined> {
    const [bond] = await db.select().from(bonds).where(eq(bonds.id, id));
    return bond;
  }

  async getBondByIsin(isin: string): Promise<Bond | undefined> {
    const [bond] = await db.select().from(bonds).where(eq(bonds.isin, isin));
    return bond;
  }

  async createBond(bondData: InsertBond): Promise<Bond> {
    const [bond] = await db.insert(bonds).values(bondData).returning();
    
    // Create bond fractions
    const totalFractions = Math.floor(Number(bond.faceValue) / 10000); // ₹10,000 per fraction
    await db.insert(bondFractions).values({
      bondId: bond.id,
      fractionSize: "10000",
      totalFractions,
      availableFractions: totalFractions,
    });
    
    return bond;
  }

  async updateBondPrice(bondId: string, price: number, currentYield: number): Promise<void> {
    await db
      .update(bonds)
      .set({
        currentPrice: price.toString(),
        currentYield: currentYield.toString(),
        updatedAt: new Date(),
      })
      .where(eq(bonds.id, bondId));
  }

  // Order operations
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }

  async getOrderBook(bondId: string): Promise<{ buyOrders: Order[]; sellOrders: Order[] }> {
    const buyOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.bondId, bondId),
          eq(orders.orderSide, "buy"),
          eq(orders.status, "pending")
        )
      )
      .orderBy(desc(orders.price), orders.createdAt);

    const sellOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.bondId, bondId),
          eq(orders.orderSide, "sell"),
          eq(orders.status, "pending")
        )
      )
      .orderBy(orders.price, orders.createdAt);

    return { buyOrders, sellOrders };
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(orderId: string, status: string, filledQuantity?: number): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (filledQuantity !== undefined) {
      updateData.filledQuantity = filledQuantity;
    }
    await db.update(orders).set(updateData).where(eq(orders.id, orderId));
  }

  // Trade operations
  async createTrade(tradeData: InsertTrade): Promise<Trade> {
    const [trade] = await db.insert(trades).values(tradeData).returning();
    return trade;
  }

  async getRecentTrades(bondId?: string): Promise<Trade[]> {
    const query = db.select().from(trades);
    if (bondId) {
      query.where(eq(trades.bondId, bondId));
    }
    return await query.orderBy(desc(trades.createdAt)).limit(50);
  }

  async getUserTrades(userId: string): Promise<Trade[]> {
    return await db
      .select()
      .from(trades)
      .where(sql`${trades.buyerId} = ${userId} OR ${trades.sellerId} = ${userId}`)
      .orderBy(desc(trades.createdAt));
  }

  // Portfolio operations
  async getUserHoldings(userId: string): Promise<Holding[]> {
    return await db
      .select()
      .from(holdings)
      .where(and(eq(holdings.userId, userId), gt(holdings.quantity, 0)))
      .orderBy(holdings.bondId);
  }

  async updateHolding(userId: string, bondId: string, quantity: number, averagePrice: number): Promise<void> {
    const totalCost = quantity * averagePrice;
    
    await db
      .insert(holdings)
      .values({
        userId,
        bondId,
        quantity,
        averagePrice: averagePrice.toString(),
        totalCost: totalCost.toString(),
      })
      .onConflictDoUpdate({
        target: [holdings.userId, holdings.bondId],
        set: {
          quantity: sql`${holdings.quantity} + ${quantity}`,
          totalCost: sql`${holdings.totalCost} + ${totalCost}`,
          averagePrice: sql`(${holdings.totalCost} + ${totalCost}) / (${holdings.quantity} + ${quantity})`,
          updatedAt: new Date(),
        },
      });
  }

  // Market maker operations
  async getMarketMakerQuotes(bondId: string): Promise<MarketMakerQuote[]> {
    return await db
      .select()
      .from(marketMakerQuotes)
      .where(and(eq(marketMakerQuotes.bondId, bondId), eq(marketMakerQuotes.isActive, true)));
  }

  async upsertMarketMakerQuote(
    userId: string,
    bondId: string,
    bidPrice?: number,
    askPrice?: number,
    bidSize?: number,
    askSize?: number
  ): Promise<MarketMakerQuote> {
    const [quote] = await db
      .insert(marketMakerQuotes)
      .values({
        userId,
        bondId,
        bidPrice: bidPrice?.toString(),
        askPrice: askPrice?.toString(),
        bidSize,
        askSize,
      })
      .onConflictDoUpdate({
        target: [marketMakerQuotes.userId, marketMakerQuotes.bondId],
        set: {
          bidPrice: bidPrice?.toString(),
          askPrice: askPrice?.toString(),
          bidSize,
          askSize,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    return quote;
  }

  // Account operations
  async updateAccountBalance(userId: string, cashDelta: number, reservedDelta = 0): Promise<void> {
    await db
      .update(accounts)
      .set({
        cashBalance: sql`${accounts.cashBalance} + ${cashDelta}`,
        reservedBalance: sql`${accounts.reservedBalance} + ${reservedDelta}`,
        updatedAt: new Date(),
      })
      .where(eq(accounts.userId, userId));
  }
}

export const storage = new DatabaseStorage();
