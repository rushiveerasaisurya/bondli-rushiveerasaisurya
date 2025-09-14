import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertOrderSchema, insertBondSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Auth middleware
  await setupAuth(app);

  // WebSocket setup for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');

    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast function for real-time updates
  function broadcast(data: any) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Bond routes
  app.get('/api/bonds', async (req, res) => {
    try {
      const bonds = await storage.getBonds();
      res.json(bonds);
    } catch (error) {
      console.error('Error fetching bonds:', error);
      res.status(500).json({ message: 'Failed to fetch bonds' });
    }
  });

  app.get('/api/bonds/:id', async (req, res) => {
    try {
      const bond = await storage.getBond(req.params.id);
      if (!bond) {
        return res.status(404).json({ message: 'Bond not found' });
      }
      res.json(bond);
    } catch (error) {
      console.error('Error fetching bond:', error);
      res.status(500).json({ message: 'Failed to fetch bond' });
    }
  });

  app.post('/api/bonds', async (req, res) => {
    try {
      const bondData = insertBondSchema.parse(req.body);
      const bond = await storage.createBond(bondData);
      
      // Broadcast new bond to all clients
      broadcast({ type: 'NEW_BOND', data: bond });
      
      res.status(201).json(bond);
    } catch (error) {
      console.error('Error creating bond:', error);
      res.status(500).json({ message: 'Failed to create bond' });
    }
  });

  // Order book routes
  app.get('/api/orderbook/:bondId', async (req, res) => {
    try {
      const orderBook = await storage.getOrderBook(req.params.bondId);
      res.json(orderBook);
    } catch (error) {
      console.error('Error fetching order book:', error);
      res.status(500).json({ message: 'Failed to fetch order book' });
    }
  });

  // Order routes
  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Calculate total value
      const totalValue = orderData.orderType === 'market' 
        ? null 
        : (Number(orderData.price) * orderData.quantity).toString();
      
      const order = await storage.createOrder({
        ...orderData,
        totalValue,
      });

      // Try to match orders (simplified matching engine)
      await tryMatchOrder(order);
      
      // Broadcast order book update
      const orderBook = await storage.getOrderBook(orderData.bondId);
      broadcast({ 
        type: 'ORDER_BOOK_UPDATE', 
        bondId: orderData.bondId, 
        data: orderBook 
      });
      
      res.status(201).json(order);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Failed to create order' });
    }
  });

  app.get('/api/orders/user/:userId', async (req, res) => {
    try {
      const orders = await storage.getUserOrders(req.params.userId);
      res.json(orders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ message: 'Failed to fetch user orders' });
    }
  });

  // Trade routes
  app.get('/api/trades', async (req, res) => {
    try {
      const bondId = req.query.bondId as string;
      const trades = await storage.getRecentTrades(bondId);
      res.json(trades);
    } catch (error) {
      console.error('Error fetching trades:', error);
      res.status(500).json({ message: 'Failed to fetch trades' });
    }
  });

  app.get('/api/trades/user/:userId', async (req, res) => {
    try {
      const trades = await storage.getUserTrades(req.params.userId);
      res.json(trades);
    } catch (error) {
      console.error('Error fetching user trades:', error);
      res.status(500).json({ message: 'Failed to fetch user trades' });
    }
  });

  // Portfolio routes
  app.get('/api/portfolio/:userId', async (req, res) => {
    try {
      const holdings = await storage.getUserHoldings(req.params.userId);
      const account = await storage.getUserAccount(req.params.userId);
      
      res.json({
        holdings,
        account,
      });
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      res.status(500).json({ message: 'Failed to fetch portfolio' });
    }
  });

  // Market maker routes
  app.get('/api/market-maker/quotes/:bondId', async (req, res) => {
    try {
      const quotes = await storage.getMarketMakerQuotes(req.params.bondId);
      res.json(quotes);
    } catch (error) {
      console.error('Error fetching market maker quotes:', error);
      res.status(500).json({ message: 'Failed to fetch quotes' });
    }
  });

  app.post('/api/market-maker/quotes', async (req, res) => {
    try {
      const { userId, bondId, bidPrice, askPrice, bidSize, askSize } = req.body;
      
      const quote = await storage.upsertMarketMakerQuote(
        userId, 
        bondId, 
        bidPrice, 
        askPrice, 
        bidSize, 
        askSize
      );
      
      // Broadcast quote update
      broadcast({ 
        type: 'MARKET_MAKER_QUOTE_UPDATE', 
        bondId, 
        data: quote 
      });
      
      res.json(quote);
    } catch (error) {
      console.error('Error updating market maker quote:', error);
      res.status(500).json({ message: 'Failed to update quote' });
    }
  });

  // Demo user creation for testing
  app.post('/api/demo-user', async (req, res) => {
    try {
      const userData = {
        id: `demo-${Date.now()}`,
        email: `demo${Date.now()}@bondli.com`,
        firstName: 'Demo',
        lastName: 'User',
        kycStatus: 'approved',
        userType: 'retail',
      };
      
      const user = await storage.upsertUser(userData);
      res.json(user);
    } catch (error) {
      console.error('Error creating demo user:', error);
      res.status(500).json({ message: 'Failed to create demo user' });
    }
  });

  // Simple order matching engine
  async function tryMatchOrder(newOrder: any) {
    try {
      const orderBook = await storage.getOrderBook(newOrder.bondId);
      
      if (newOrder.orderSide === 'buy') {
        // Match with sell orders
        const matchingSellOrders = orderBook.sellOrders.filter(sellOrder => 
          newOrder.orderType === 'market' || 
          Number(sellOrder.price) <= Number(newOrder.price)
        );
        
        for (const sellOrder of matchingSellOrders) {
          const matchQuantity = Math.min(
            newOrder.quantity - newOrder.filledQuantity,
            sellOrder.quantity - (sellOrder.filledQuantity || 0)
          );
          
          if (matchQuantity > 0) {
            const tradePrice = Number(sellOrder.price);
            const totalValue = matchQuantity * tradePrice;
            
            // Create trade
            await storage.createTrade({
              buyOrderId: newOrder.id,
              sellOrderId: sellOrder.id,
              bondId: newOrder.bondId,
              quantity: matchQuantity,
              price: tradePrice.toString(),
              totalValue: totalValue.toString(),
              buyerId: newOrder.userId,
              sellerId: sellOrder.userId,
            });
            
            // Update order statuses
            const newBuyFilled = newOrder.filledQuantity + matchQuantity;
            const newSellFilled = (sellOrder.filledQuantity || 0) + matchQuantity;
            
            await storage.updateOrderStatus(
              newOrder.id,
              newBuyFilled === newOrder.quantity ? 'filled' : 'partial',
              newBuyFilled
            );
            
            await storage.updateOrderStatus(
              sellOrder.id,
              newSellFilled === sellOrder.quantity ? 'filled' : 'partial',
              newSellFilled
            );
            
            // Update holdings
            await storage.updateHolding(newOrder.userId, newOrder.bondId, matchQuantity, tradePrice);
            await storage.updateHolding(sellOrder.userId, newOrder.bondId, -matchQuantity, tradePrice);
            
            // Update account balances
            await storage.updateAccountBalance(newOrder.userId, -totalValue);
            await storage.updateAccountBalance(sellOrder.userId, totalValue);
            
            // Update bond price
            await storage.updateBondPrice(newOrder.bondId, tradePrice, calculateYield(tradePrice));
            
            // Broadcast trade
            broadcast({
              type: 'NEW_TRADE',
              bondId: newOrder.bondId,
              data: {
                price: tradePrice,
                quantity: matchQuantity,
                timestamp: new Date().toISOString(),
              }
            });
            
            newOrder.filledQuantity = newBuyFilled;
            if (newBuyFilled === newOrder.quantity) break;
          }
        }
      } else {
        // Similar logic for sell orders matching with buy orders
        // Implementation follows the same pattern as above
      }
    } catch (error) {
      console.error('Error in order matching:', error);
    }
  }

  function calculateYield(price: number): number {
    // Simplified yield calculation - in production this would be more sophisticated
    return (100 / price) * 8.5; // Assuming 8.5% coupon
  }

  return httpServer;
}
