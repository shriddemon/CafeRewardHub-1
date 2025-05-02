import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupWhatsAppNotifications, sendWhatsAppNotification } from "./whatsapp";

// Middleware to check if user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is a cafe owner
const ensureOwner = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user.role === "owner") {
    return next();
  }
  res.status(403).json({ message: "Access denied. Only cafe owners can access this resource." });
};

// Middleware to check if user is a customer
const ensureCustomer = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user.role === "customer") {
    return next();
  }
  res.status(403).json({ message: "Access denied. Only customers can access this resource." });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);
  
  // Setup WhatsApp notifications
  setupWhatsAppNotifications();

  // OWNER ROUTES
  
  // Cafe profile
  app.get("/api/owner/cafe", ensureOwner, async (req, res) => {
    try {
      const cafe = await storage.getCafe(req.user.id);
      res.json(cafe);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Endpoint to get the customer registration URL for a cafe
  app.get("/api/owner/customer-registration-url", ensureOwner, async (req, res) => {
    try {
      const cafe = await storage.getCafe(req.user.id);
      if (!cafe) {
        return res.status(404).json({ message: "Cafe not found" });
      }
      
      // Generate a registration URL with the cafe ID
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const registrationUrl = `${baseUrl}/register/customer/${cafe.id}`;
      
      res.json({ registrationUrl });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.patch("/api/owner/cafe", ensureOwner, async (req, res) => {
    try {
      const cafe = await storage.getCafe(req.user.id);
      if (!cafe) {
        return res.status(404).json({ message: "Cafe not found" });
      }
      
      const updatedCafe = await storage.updateCafe(cafe.id, req.body);
      res.json(updatedCafe);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.patch("/api/owner/cafe/whatsapp", ensureOwner, async (req, res) => {
    try {
      const cafe = await storage.getCafe(req.user.id);
      if (!cafe) {
        return res.status(404).json({ message: "Cafe not found" });
      }
      
      const updatedCafe = await storage.updateCafe(cafe.id, {
        whatsappEnabled: req.body.whatsappEnabled,
        whatsappNumber: req.body.whatsappNumber,
      });
      
      res.json(updatedCafe);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Owner statistics
  app.get("/api/owner/stats", ensureOwner, async (req, res) => {
    try {
      const stats = await storage.getOwnerStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/owner/customers/top", ensureOwner, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const customers = await storage.getCustomerTopList(req.user.id, limit);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/owner/orders/recent", ensureOwner, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const orders = await storage.getRecentOrders(req.user.id, limit);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/owner/revenue/daily", ensureOwner, async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const revenue = await storage.getRevenueByDay(req.user.id, days);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Rewards management
  app.get("/api/owner/rewards", ensureOwner, async (req, res) => {
    try {
      const rewards = await storage.getRewardsByOwner(req.user.id);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/owner/rewards", ensureOwner, async (req, res) => {
    try {
      const cafe = await storage.getCafe(req.user.id);
      if (!cafe) {
        return res.status(404).json({ message: "Cafe not found" });
      }
      
      const reward = await storage.createReward({
        ...req.body,
        cafeId: cafe.id,
      });
      
      res.status(201).json(reward);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.patch("/api/owner/rewards/:id", ensureOwner, async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      const reward = await storage.getReward(rewardId);
      
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      // Verify ownership
      const cafe = await storage.getCafe(req.user.id);
      if (!cafe || reward.cafeId !== cafe.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedReward = await storage.updateReward(rewardId, req.body);
      res.json(updatedReward);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.patch("/api/owner/rewards/:id/toggle", ensureOwner, async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      const reward = await storage.getReward(rewardId);
      
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      // Verify ownership
      const cafe = await storage.getCafe(req.user.id);
      if (!cafe || reward.cafeId !== cafe.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedReward = await storage.updateReward(rewardId, {
        isActive: req.body.isActive,
      });
      
      res.json(updatedReward);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.delete("/api/owner/rewards/:id", ensureOwner, async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      const reward = await storage.getReward(rewardId);
      
      if (!reward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      // Verify ownership
      const cafe = await storage.getCafe(req.user.id);
      if (!cafe || reward.cafeId !== cafe.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteReward(rewardId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Customer management
  app.get("/api/owner/customers", ensureOwner, async (req, res) => {
    try {
      const customers = await storage.getCustomersByOwner(req.user.id);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Order management
  app.get("/api/owner/orders", ensureOwner, async (req, res) => {
    try {
      const orders = await storage.getOrdersByOwner(req.user.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.patch("/api/owner/orders/:id/status", ensureOwner, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Verify ownership
      const cafe = await storage.getCafe(req.user.id);
      if (!cafe || order.cafeId !== cafe.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, req.body.status);
      
      // Send WhatsApp notification if order is completed
      if (req.body.status === "completed") {
        // Get customer details
        const customerResult = await storage.getCustomerProfile(order.customerId);
        if (customerResult && customerResult.phone) {
          sendWhatsAppNotification(
            customerResult.phone,
            "order_completed",
            {
              order_id: orderId.toString(),
              cafe_name: cafe.name,
              points_earned: order.pointsEarned.toString(),
            }
          );
        }
      }
      
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // PUBLIC ROUTES (no authentication required)
  
  // Get cafe info for customer registration
  app.get("/api/cafes/:id", async (req, res) => {
    try {
      const cafeId = parseInt(req.params.id);
      const cafe = await storage.getCafeById(cafeId);
      
      if (!cafe) {
        return res.status(404).json({ message: "Cafe not found" });
      }
      
      // Return only necessary information (avoid exposing sensitive info)
      res.json({
        id: cafe.id,
        name: cafe.name,
        logo: cafe.logo,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // CUSTOMER ROUTES
  
  // Customer profile
  app.get("/api/customer/profile", ensureCustomer, async (req, res) => {
    try {
      const profile = await storage.getCustomerProfile(req.user.id);
      
      // Calculate points needed for next reward
      const nextRewardPoints = 100; // Fixed value for demo
      
      res.json({
        ...profile,
        nextRewardPoints,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.patch("/api/customer/profile", ensureCustomer, async (req, res) => {
    try {
      const profile = await storage.getCustomerProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const updatedProfile = await storage.updateCustomerProfile(profile.id, req.body);
      res.json(updatedProfile);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.patch("/api/customer/notifications", ensureCustomer, async (req, res) => {
    try {
      const profile = await storage.getCustomerProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // In a real app, we would update notification settings in the database
      res.json({
        ...profile,
        notificationSettings: req.body,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Customer rewards
  app.get("/api/customer/rewards", ensureCustomer, async (req, res) => {
    try {
      const profile = await storage.getCustomerProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const rewards = await storage.getCustomerRewards(profile.id);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/customer/rewards/:id/redeem", ensureCustomer, async (req, res) => {
    try {
      const rewardId = parseInt(req.params.id);
      const customerReward = await storage.getCustomerReward(rewardId);
      
      if (!customerReward) {
        return res.status(404).json({ message: "Reward not found" });
      }
      
      const profile = await storage.getCustomerProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Verify ownership
      if (customerReward.customerId !== profile.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Check if already redeemed
      if (customerReward.isRedeemed) {
        return res.status(400).json({ message: "Reward already redeemed" });
      }
      
      // Check if expired
      if (customerReward.expiresAt && new Date(customerReward.expiresAt) < new Date()) {
        return res.status(400).json({ message: "Reward expired" });
      }
      
      // Redeem the reward
      const updatedReward = await storage.updateCustomerReward(rewardId, {
        isRedeemed: true,
        redeemedAt: new Date().toISOString(),
      });
      
      res.json(updatedReward);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Customer orders
  app.get("/api/customer/orders", ensureCustomer, async (req, res) => {
    try {
      const profile = await storage.getCustomerProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const orders = await storage.getOrdersByCustomer(profile.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.get("/api/customer/orders/recent", ensureCustomer, async (req, res) => {
    try {
      const profile = await storage.getCustomerProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const orders = await storage.getOrdersByCustomer(profile.id);
      
      // Sort by date descending and limit
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
      
      res.json(recentOrders);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/customer/orders", ensureCustomer, async (req, res) => {
    try {
      const profile = await storage.getCustomerProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Calculate points earned (10% of order amount)
      const pointsEarned = Math.floor((req.body.amount || 0) * 0.1);
      
      const order = await storage.createOrder({
        ...req.body,
        customerId: profile.id,
        pointsEarned,
        status: "pending",
      });
      
      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  // Customer games
  app.get("/api/customer/games", ensureCustomer, async (req, res) => {
    try {
      const profile = await storage.getCustomerProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // Get all active games for the customer's cafe
      const games = [];
      
      // Add sample games for demo
      games.push({
        id: 1,
        name: "Spin & Win",
        description: "Spin the wheel to win exciting rewards!",
        type: "spin_wheel",
        cafeId: profile.cafeId,
        isActive: true,
        maxPlaysPerDay: 1,
        createdAt: new Date().toISOString(),
      });
      
      games.push({
        id: 2,
        name: "Scratch Card",
        description: "Scratch and reveal your prize!",
        type: "scratch_card",
        cafeId: profile.cafeId,
        isActive: true,
        maxPlaysPerDay: 1,
        createdAt: new Date().toISOString(),
      });
      
      games.push({
        id: 3,
        name: "Coffee Quiz",
        description: "Test your coffee knowledge and win points!",
        type: "quiz",
        cafeId: profile.cafeId,
        isActive: true,
        maxPlaysPerDay: 1,
        createdAt: new Date().toISOString(),
      });
      
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.post("/api/customer/games/:id/play", ensureCustomer, async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const profile = await storage.getCustomerProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      // In a real app, we would validate game play and determine outcome
      // based on game logic. For demo, we'll simulate a game play
      
      // Simulate playing the game with a random outcome
      const result = Math.random() < 0.7 ? "win" : "lose";
      const pointsWon = result === "win" ? Math.floor(Math.random() * 50) + 10 : 0;
      
      // Update customer points
      await storage.updateCustomerProfile(profile.id, {
        points: (profile.points || 0) + pointsWon,
      });
      
      // Return the result
      res.json({
        result,
        pointsWon,
        gameId,
        customerId: profile.id,
        createdAt: new Date().toISOString(),
      });
      
      // If points are won, send WhatsApp notification
      if (pointsWon > 0 && profile.phone) {
        // Get cafe details
        const cafe = await storage.getCafe(profile.cafeId);
        if (cafe && cafe.whatsappEnabled) {
          sendWhatsAppNotification(
            profile.phone,
            "points_earned",
            {
              customer_name: profile.name || "Customer",
              points: pointsWon.toString(),
              cafe_name: cafe.name,
              total_points: ((profile.points || 0) + pointsWon).toString(),
            }
          );
        }
      }
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
