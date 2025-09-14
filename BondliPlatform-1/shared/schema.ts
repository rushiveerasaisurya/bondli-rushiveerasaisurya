import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  timestamp,
  boolean,
  pgEnum,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  kycStatus: varchar("kyc_status").default("pending"), // pending, approved, rejected
  userType: varchar("user_type").default("retail"), // retail, institutional, market_maker, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User accounts for cash balances
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  cashBalance: decimal("cash_balance", { precision: 15, scale: 2 }).default("0"),
  reservedBalance: decimal("reserved_balance", { precision: 15, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bond definitions
export const bonds = pgTable("bonds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  isin: varchar("isin").unique().notNull(),
  issuer: varchar("issuer").notNull(),
  bondName: varchar("bond_name").notNull(),
  couponRate: decimal("coupon_rate", { precision: 5, scale: 2 }).notNull(),
  faceValue: decimal("face_value", { precision: 15, scale: 2 }).notNull(),
  maturityDate: timestamp("maturity_date").notNull(),
  rating: varchar("rating").notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }),
  currentYield: decimal("current_yield", { precision: 5, scale: 2 }),
  minInvestment: decimal("min_investment", { precision: 15, scale: 2 }).default("10000"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bond fractions for fractional ownership
export const bondFractions = pgTable("bond_fractions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bondId: varchar("bond_id").references(() => bonds.id).notNull(),
  fractionSize: decimal("fraction_size", { precision: 15, scale: 2 }).default("10000"),
  totalFractions: integer("total_fractions").notNull(),
  availableFractions: integer("available_fractions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Order types
export const orderTypeEnum = pgEnum("order_type", ["limit", "market"]);
export const orderSideEnum = pgEnum("order_side", ["buy", "sell"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "partial", "filled", "cancelled"]);

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bondId: varchar("bond_id").references(() => bonds.id).notNull(),
  orderType: orderTypeEnum("order_type").notNull(),
  orderSide: orderSideEnum("order_side").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  filledQuantity: integer("filled_quantity").default(0),
  status: orderStatusEnum("status").default("pending"),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trades
export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyOrderId: varchar("buy_order_id").references(() => orders.id).notNull(),
  sellOrderId: varchar("sell_order_id").references(() => orders.id).notNull(),
  bondId: varchar("bond_id").references(() => bonds.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).notNull(),
  buyerId: varchar("buyer_id").references(() => users.id).notNull(),
  sellerId: varchar("seller_id").references(() => users.id).notNull(),
  settlementStatus: varchar("settlement_status").default("pending"), // pending, settled
  createdAt: timestamp("created_at").defaultNow(),
  settledAt: timestamp("settled_at"),
});

// Portfolio holdings
export const holdings = pgTable("holdings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bondId: varchar("bond_id").references(() => bonds.id).notNull(),
  quantity: integer("quantity").notNull(),
  averagePrice: decimal("average_price", { precision: 10, scale: 2 }).notNull(),
  totalCost: decimal("total_cost", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }),
  unrealizedPnl: decimal("unrealized_pnl", { precision: 15, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Market maker quotes
export const marketMakerQuotes = pgTable("market_maker_quotes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  bondId: varchar("bond_id").references(() => bonds.id).notNull(),
  bidPrice: decimal("bid_price", { precision: 10, scale: 2 }),
  askPrice: decimal("ask_price", { precision: 10, scale: 2 }),
  bidSize: integer("bid_size"),
  askSize: integer("ask_size"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  account: one(accounts, {
    fields: [users.id],
    references: [accounts.userId],
  }),
  orders: many(orders),
  holdings: many(holdings),
  buyTrades: many(trades, { relationName: "buyer" }),
  sellTrades: many(trades, { relationName: "seller" }),
  marketMakerQuotes: many(marketMakerQuotes),
}));

export const bondsRelations = relations(bonds, ({ many }) => ({
  fractions: many(bondFractions),
  orders: many(orders),
  trades: many(trades),
  holdings: many(holdings),
  marketMakerQuotes: many(marketMakerQuotes),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  bond: one(bonds, {
    fields: [orders.bondId],
    references: [bonds.id],
  }),
  buyTrades: many(trades, { relationName: "buyOrder" }),
  sellTrades: many(trades, { relationName: "sellOrder" }),
}));

export const tradesRelations = relations(trades, ({ one }) => ({
  buyOrder: one(orders, {
    fields: [trades.buyOrderId],
    references: [orders.id],
    relationName: "buyOrder",
  }),
  sellOrder: one(orders, {
    fields: [trades.sellOrderId],
    references: [orders.id],
    relationName: "sellOrder",
  }),
  bond: one(bonds, {
    fields: [trades.bondId],
    references: [bonds.id],
  }),
  buyer: one(users, {
    fields: [trades.buyerId],
    references: [users.id],
    relationName: "buyer",
  }),
  seller: one(users, {
    fields: [trades.sellerId],
    references: [users.id],
    relationName: "seller",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  kycStatus: true,
  userType: true,
});

export const insertBondSchema = createInsertSchema(bonds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  filledQuantity: true,
  status: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  createdAt: true,
  settledAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Bond = typeof bonds.$inferSelect;
export type BondFraction = typeof bondFractions.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Trade = typeof trades.$inferSelect;
export type Holding = typeof holdings.$inferSelect;
export type MarketMakerQuote = typeof marketMakerQuotes.$inferSelect;
export type InsertBond = z.infer<typeof insertBondSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
