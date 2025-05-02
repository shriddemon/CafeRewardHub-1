import { pool, db } from "@db";
import * as schema from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { Cafe, Customer, Game, GamePlay, GamePrize, Order, OrderItem, Reward, CustomerReward } from "@/types";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User related methods
  getUser: (id: number) => Promise<schema.User>;
  getUserByUsername: (username: string) => Promise<schema.User | null>;
  createUser: (user: any) => Promise<schema.User>;
  
  // Cafe related methods
  getCafe: (ownerId: number) => Promise<Cafe | null>;
  getCafeById: (id: number) => Promise<Cafe | null>;
  createCafe: (cafe: Partial<Cafe>) => Promise<Cafe>;
  updateCafe: (id: number, cafeData: Partial<Cafe>) => Promise<Cafe>;
  
  // Customer related methods
  getCustomerProfile: (userId: number) => Promise<Customer | null>;
  createCustomerProfile: (customer: Partial<Customer>) => Promise<Customer>;
  updateCustomerProfile: (id: number, customerData: Partial<Customer>) => Promise<Customer>;
  getCustomersByOwner: (ownerId: number) => Promise<Customer[]>;
  
  // Reward related methods
  getRewardsByOwner: (ownerId: number) => Promise<Reward[]>;
  getReward: (id: number) => Promise<Reward | null>;
  createReward: (reward: Partial<Reward>) => Promise<Reward>;
  updateReward: (id: number, rewardData: Partial<Reward>) => Promise<Reward>;
  deleteReward: (id: number) => Promise<void>;
  
  // Customer reward related methods
  getCustomerRewards: (customerId: number) => Promise<CustomerReward[]>;
  getCustomerReward: (id: number) => Promise<CustomerReward | null>;
  createCustomerReward: (customerReward: Partial<CustomerReward>) => Promise<CustomerReward>;
  updateCustomerReward: (id: number, customerRewardData: Partial<CustomerReward>) => Promise<CustomerReward>;
  
  // Order related methods
  getOrdersByOwner: (ownerId: number) => Promise<Order[]>;
  getOrdersByCustomer: (customerId: number) => Promise<Order[]>;
  getOrder: (id: number) => Promise<Order | null>;
  createOrder: (order: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (id: number, status: string) => Promise<Order>;
  
  // Game related methods
  getGamesByOwner: (ownerId: number) => Promise<Game[]>;
  getGame: (id: number) => Promise<Game | null>;
  createGame: (game: Partial<Game>) => Promise<Game>;
  updateGame: (id: number, gameData: Partial<Game>) => Promise<Game>;
  playGame: (customerId: number, gameId: number) => Promise<GamePlay>;
  getGamePrizes: (gameId: number) => Promise<GamePrize[]>;
  
  // Analytics methods
  getOwnerStats: (ownerId: number) => Promise<any>;
  getCustomerTopList: (ownerId: number, limit?: number) => Promise<any[]>;
  getRecentOrders: (ownerId: number, limit?: number) => Promise<any[]>;
  getRevenueByDay: (ownerId: number, days?: number) => Promise<any[]>;
  
  // Session store
  sessionStore: session.Store;
}

export const storage: IStorage = {
  // User related methods
  getUser: async (id: number) => {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    if (result.length === 0) {
      throw new Error(`User with id ${id} not found`);
    }
    return result[0];
  },
  
  getUserByUsername: async (username: string) => {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return result.length > 0 ? result[0] : null;
  },
  
  createUser: async (user: any) => {
    const insertData = await schema.insertUserSchema.parse(user);
    const result = await db.insert(schema.users).values(insertData).returning();
    return result[0];
  },
  
  // Cafe related methods
  getCafe: async (ownerId: number) => {
    const result = await db.select().from(schema.cafes).where(eq(schema.cafes.ownerId, ownerId)).limit(1);
    return result.length > 0 ? result[0] : null;
  },
  
  getCafeById: async (id: number) => {
    const result = await db.select().from(schema.cafes).where(eq(schema.cafes.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  },
  
  createCafe: async (cafe: Partial<Cafe>) => {
    const result = await db.insert(schema.cafes).values(cafe).returning();
    return result[0];
  },
  
  updateCafe: async (id: number, cafeData: Partial<Cafe>) => {
    const result = await db.update(schema.cafes)
      .set(cafeData)
      .where(eq(schema.cafes.id, id))
      .returning();
    return result[0];
  },
  
  // Customer related methods
  getCustomerProfile: async (userId: number) => {
    const result = await db.select().from(schema.customers).where(eq(schema.customers.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  },
  
  createCustomerProfile: async (customer: Partial<Customer>) => {
    const result = await db.insert(schema.customers).values(customer).returning();
    return result[0];
  },
  
  updateCustomerProfile: async (id: number, customerData: Partial<Customer>) => {
    const result = await db.update(schema.customers)
      .set(customerData)
      .where(eq(schema.customers.id, id))
      .returning();
    return result[0];
  },
  
  getCustomersByOwner: async (ownerId: number) => {
    const cafe = await storage.getCafe(ownerId);
    if (!cafe) return [];
    
    const result = await db.select()
      .from(schema.customers)
      .where(eq(schema.customers.cafeId, cafe.id))
      .orderBy(desc(schema.customers.createdAt));
    
    return result;
  },
  
  // Reward related methods
  getRewardsByOwner: async (ownerId: number) => {
    const cafe = await storage.getCafe(ownerId);
    if (!cafe) return [];
    
    const result = await db.select()
      .from(schema.rewards)
      .where(eq(schema.rewards.cafeId, cafe.id))
      .orderBy(desc(schema.rewards.createdAt));
    
    return result;
  },
  
  getReward: async (id: number) => {
    const result = await db.select().from(schema.rewards).where(eq(schema.rewards.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  },
  
  createReward: async (reward: Partial<Reward>) => {
    const result = await db.insert(schema.rewards).values(reward).returning();
    return result[0];
  },
  
  updateReward: async (id: number, rewardData: Partial<Reward>) => {
    const result = await db.update(schema.rewards)
      .set(rewardData)
      .where(eq(schema.rewards.id, id))
      .returning();
    return result[0];
  },
  
  deleteReward: async (id: number) => {
    await db.delete(schema.rewards).where(eq(schema.rewards.id, id));
  },
  
  // Customer reward related methods
  getCustomerRewards: async (customerId: number) => {
    const result = await db.select({
      id: schema.customerRewards.id,
      customerId: schema.customerRewards.customerId,
      rewardId: schema.customerRewards.rewardId,
      isRedeemed: schema.customerRewards.isRedeemed,
      redeemedAt: schema.customerRewards.redeemedAt,
      expiresAt: schema.customerRewards.expiresAt,
      createdAt: schema.customerRewards.createdAt,
      name: schema.rewards.name,
      description: schema.rewards.description,
      type: schema.rewards.type,
      value: schema.rewards.value,
    })
    .from(schema.customerRewards)
    .innerJoin(schema.rewards, eq(schema.customerRewards.rewardId, schema.rewards.id))
    .where(eq(schema.customerRewards.customerId, customerId))
    .orderBy(desc(schema.customerRewards.createdAt));
    
    return result;
  },
  
  getCustomerReward: async (id: number) => {
    const result = await db.select({
      id: schema.customerRewards.id,
      customerId: schema.customerRewards.customerId,
      rewardId: schema.customerRewards.rewardId,
      isRedeemed: schema.customerRewards.isRedeemed,
      redeemedAt: schema.customerRewards.redeemedAt,
      expiresAt: schema.customerRewards.expiresAt,
      createdAt: schema.customerRewards.createdAt,
      name: schema.rewards.name,
      description: schema.rewards.description,
      type: schema.rewards.type,
      value: schema.rewards.value,
    })
    .from(schema.customerRewards)
    .innerJoin(schema.rewards, eq(schema.customerRewards.rewardId, schema.rewards.id))
    .where(eq(schema.customerRewards.id, id))
    .limit(1);
    
    return result.length > 0 ? result[0] : null;
  },
  
  createCustomerReward: async (customerReward: Partial<CustomerReward>) => {
    const result = await db.insert(schema.customerRewards).values(customerReward).returning();
    return result[0];
  },
  
  updateCustomerReward: async (id: number, customerRewardData: Partial<CustomerReward>) => {
    const result = await db.update(schema.customerRewards)
      .set(customerRewardData)
      .where(eq(schema.customerRewards.id, id))
      .returning();
    return result[0];
  },
  
  // Order related methods
  getOrdersByOwner: async (ownerId: number) => {
    const cafe = await storage.getCafe(ownerId);
    if (!cafe) return [];
    
    const result = await db.select({
      id: schema.orders.id,
      customerId: schema.orders.customerId,
      cafeId: schema.orders.cafeId,
      amount: schema.orders.amount,
      status: schema.orders.status,
      type: schema.orders.type,
      pointsEarned: schema.orders.pointsEarned,
      createdAt: schema.orders.createdAt,
      customerName: schema.customers.name,
    })
    .from(schema.orders)
    .leftJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .where(eq(schema.orders.cafeId, cafe.id))
    .orderBy(desc(schema.orders.createdAt));
    
    return result;
  },
  
  getOrdersByCustomer: async (customerId: number) => {
    const result = await db.select()
      .from(schema.orders)
      .where(eq(schema.orders.customerId, customerId))
      .orderBy(desc(schema.orders.createdAt));
    
    return result;
  },
  
  getOrder: async (id: number) => {
    const result = await db.select().from(schema.orders).where(eq(schema.orders.id, id)).limit(1);
    
    if (result.length === 0) return null;
    
    // Get order items
    const items = await db.select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, id));
    
    return { ...result[0], items };
  },
  
  createOrder: async (order: Partial<Order>) => {
    const result = await db.insert(schema.orders).values(order).returning();
    
    // Add order items if provided
    if (order.items && order.items.length > 0) {
      const orderItems = order.items.map(item => ({
        ...item,
        orderId: result[0].id
      }));
      
      await db.insert(schema.orderItems).values(orderItems);
    }
    
    // Update customer stats
    if (order.customerId) {
      const customer = await db.select().from(schema.customers).where(eq(schema.customers.id, order.customerId)).limit(1);
      
      if (customer.length > 0) {
        await db.update(schema.customers)
          .set({
            totalOrders: (customer[0].totalOrders || 0) + 1,
            totalSpent: (customer[0].totalSpent || 0) + (order.amount || 0),
            points: (customer[0].points || 0) + (order.pointsEarned || 0),
            lastVisit: new Date().toISOString(),
          })
          .where(eq(schema.customers.id, order.customerId));
      }
    }
    
    return result[0];
  },
  
  updateOrderStatus: async (id: number, status: string) => {
    const result = await db.update(schema.orders)
      .set({ status })
      .where(eq(schema.orders.id, id))
      .returning();
    
    return result[0];
  },
  
  // Game related methods
  getGamesByOwner: async (ownerId: number) => {
    const cafe = await storage.getCafe(ownerId);
    if (!cafe) return [];
    
    const result = await db.select()
      .from(schema.games)
      .where(eq(schema.games.cafeId, cafe.id))
      .orderBy(desc(schema.games.createdAt));
    
    return result;
  },
  
  getGame: async (id: number) => {
    const result = await db.select().from(schema.games).where(eq(schema.games.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  },
  
  createGame: async (game: Partial<Game>) => {
    const result = await db.insert(schema.games).values(game).returning();
    return result[0];
  },
  
  updateGame: async (id: number, gameData: Partial<Game>) => {
    const result = await db.update(schema.games)
      .set(gameData)
      .where(eq(schema.games.id, id))
      .returning();
    return result[0];
  },
  
  playGame: async (customerId: number, gameId: number) => {
    // Get game details
    const game = await storage.getGame(gameId);
    if (!game) throw new Error("Game not found");
    
    // Check if customer exists
    const customerResult = await db.select().from(schema.customers).where(eq(schema.customers.id, customerId)).limit(1);
    if (customerResult.length === 0) throw new Error("Customer not found");
    
    const customer = customerResult[0];
    
    // Check if customer has already played the game today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const playsToday = await db.select()
      .from(schema.gamePlays)
      .where(
        and(
          eq(schema.gamePlays.customerId, customerId),
          eq(schema.gamePlays.gameId, gameId),
          sql`DATE(${schema.gamePlays.createdAt}) = CURRENT_DATE`
        )
      );
    
    if (playsToday.length >= game.maxPlaysPerDay) {
      throw new Error("You have reached the maximum number of plays for today");
    }
    
    // Determine the outcome (win/lose)
    const result = Math.random() < 0.7 ? "win" : "lose"; // 70% chance to win
    
    // Determine points won (0-100 if win, 0 if lose)
    const pointsWon = result === "win" ? Math.floor(Math.random() * 100) + 1 : 0;
    
    // Record the game play
    const gamePlay = await db.insert(schema.gamePlays).values({
      gameId,
      customerId,
      result,
      pointsWon,
    }).returning();
    
    // Update customer points
    await db.update(schema.customers)
      .set({
        points: customer.points + pointsWon,
      })
      .where(eq(schema.customers.id, customerId));
    
    return gamePlay[0];
  },
  
  // Analytics methods
  getOwnerStats: async (ownerId: number) => {
    const cafe = await storage.getCafe(ownerId);
    if (!cafe) {
      return {
        totalCustomers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeRewards: 0,
        avgOrderValue: 0,
        customerRetentionRate: 0,
      };
    }
    
    // Get total customers
    const customersResult = await db.select({ count: sql<number>`count(*)` })
      .from(schema.customers)
      .where(eq(schema.customers.cafeId, cafe.id));
    
    const totalCustomers = customersResult[0]?.count || 0;
    
    // Get total orders and revenue
    const ordersResult = await db.select({
      count: sql<number>`count(*)`,
      revenue: sql<number>`COALESCE(sum(${schema.orders.amount}), 0)`,
    })
    .from(schema.orders)
    .where(eq(schema.orders.cafeId, cafe.id));
    
    const totalOrders = ordersResult[0]?.count || 0;
    const totalRevenue = ordersResult[0]?.revenue || 0;
    
    // Get active rewards
    const rewardsResult = await db.select({ count: sql<number>`count(*)` })
      .from(schema.rewards)
      .where(
        and(
          eq(schema.rewards.cafeId, cafe.id),
          eq(schema.rewards.isActive, true)
        )
      );
    
    const activeRewards = rewardsResult[0]?.count || 0;
    
    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
    // Calculate customer retention rate (customers who ordered more than once / total customers)
    const repeatedCustomersResult = await db.select({ count: sql<number>`count(DISTINCT ${schema.orders.customerId})` })
      .from(schema.orders)
      .where(
        and(
          eq(schema.orders.cafeId, cafe.id),
          sql`(SELECT COUNT(*) FROM ${schema.orders} o2 WHERE o2.customer_id = ${schema.orders.customerId}) > 1`
        )
      );
    
    const repeatedCustomers = repeatedCustomersResult[0]?.count || 0;
    const customerRetentionRate = totalCustomers > 0 ? Math.round((repeatedCustomers / totalCustomers) * 100) : 0;
    
    return {
      totalCustomers,
      totalOrders,
      totalRevenue,
      activeRewards,
      avgOrderValue,
      customerRetentionRate,
    };
  },
  
  getCustomerTopList: async (ownerId: number, limit = 5) => {
    const cafe = await storage.getCafe(ownerId);
    if (!cafe) return [];
    
    const result = await db.select({
      id: schema.customers.id,
      name: schema.customers.name,
      points: schema.customers.points,
      totalOrders: schema.customers.totalOrders,
      totalSpent: schema.customers.totalSpent,
      lastVisit: schema.customers.lastVisit,
    })
    .from(schema.customers)
    .where(eq(schema.customers.cafeId, cafe.id))
    .orderBy(desc(schema.customers.totalSpent))
    .limit(limit);
    
    return result;
  },
  
  getRecentOrders: async (ownerId: number, limit = 5) => {
    const cafe = await storage.getCafe(ownerId);
    if (!cafe) return [];
    
    const result = await db.select({
      id: schema.orders.id,
      customerId: schema.orders.customerId,
      amount: schema.orders.amount,
      status: schema.orders.status,
      type: schema.orders.type,
      pointsEarned: schema.orders.pointsEarned,
      createdAt: schema.orders.createdAt,
      customerName: schema.customers.name,
    })
    .from(schema.orders)
    .leftJoin(schema.customers, eq(schema.orders.customerId, schema.customers.id))
    .where(eq(schema.orders.cafeId, cafe.id))
    .orderBy(desc(schema.orders.createdAt))
    .limit(limit);
    
    return result;
  },
  
  getRevenueByDay: async (ownerId: number, days = 7) => {
    const cafe = await storage.getCafe(ownerId);
    if (!cafe) return [];
    
    const result = await db.select({
      date: sql<string>`DATE(${schema.orders.createdAt})`,
      revenue: sql<number>`COALESCE(sum(${schema.orders.amount}), 0)`,
    })
    .from(schema.orders)
    .where(
      and(
        eq(schema.orders.cafeId, cafe.id),
        sql`${schema.orders.createdAt} >= CURRENT_DATE - INTERVAL '${days} days'`
      )
    )
    .groupBy(sql`DATE(${schema.orders.createdAt})`)
    .orderBy(sql`DATE(${schema.orders.createdAt})`);
    
    // Fill in missing dates
    const today = new Date();
    const dailyData: { date: string; revenue: number }[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const existingData = result.find(item => item.date === dateStr);
      dailyData.push({
        date: dateStr,
        revenue: existingData ? existingData.revenue : 0,
      });
    }
    
    return dailyData;
  },
  
  // Session store
  sessionStore: new PostgresSessionStore({
    pool,
    createTableIfMissing: true,
  }),
};
