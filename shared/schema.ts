import { pgTable, text, serial, integer, boolean, timestamp, decimal, foreignKey } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['owner', 'customer'] }).notNull().default('customer'),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Cafes table
export const cafes = pgTable('cafes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  logo: text('logo'),
  whatsappEnabled: boolean('whatsapp_enabled').default(false),
  whatsappNumber: text('whatsapp_number'),
  plan: text('plan', { enum: ['trial', 'starter', 'professional', 'enterprise'] }).default('trial'),
  ownerId: integer('owner_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertCafeSchema = createInsertSchema(cafes);
export type InsertCafe = z.infer<typeof insertCafeSchema>;
export type Cafe = typeof cafes.$inferSelect;

// Customers table
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  cafeId: integer('cafe_id').references(() => cafes.id),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  points: integer('points').default(0),
  totalOrders: integer('total_orders').default(0),
  totalSpent: decimal('total_spent', { precision: 10, scale: 2 }).default('0'),
  lastVisit: timestamp('last_visit'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertCustomerSchema = createInsertSchema(customers);
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Rewards table
export const rewards = pgTable('rewards', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  points: integer('points').notNull(),
  type: text('type', { enum: ['discount', 'free_item', 'coupon'] }).notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  cafeId: integer('cafe_id').references(() => cafes.id).notNull(),
  isActive: boolean('is_active').default(true),
  expiryDays: integer('expiry_days'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertRewardSchema = createInsertSchema(rewards);
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;

// Customer Rewards table
export const customerRewards = pgTable('customer_rewards', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  rewardId: integer('reward_id').references(() => rewards.id).notNull(),
  isRedeemed: boolean('is_redeemed').default(false),
  redeemedAt: timestamp('redeemed_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertCustomerRewardSchema = createInsertSchema(customerRewards);
export type InsertCustomerReward = z.infer<typeof insertCustomerRewardSchema>;
export type CustomerReward = typeof customerRewards.$inferSelect;

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  cafeId: integer('cafe_id').references(() => cafes.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status', { enum: ['pending', 'completed', 'cancelled'] }).notNull().default('pending'),
  type: text('type', { enum: ['dine_in', 'online'] }).notNull(),
  pointsEarned: integer('points_earned').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders);
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull().default(1),
});

export const insertOrderItemSchema = createInsertSchema(orderItems);
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Games table
export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: text('type', { enum: ['spin_wheel', 'scratch_card', 'quiz'] }).notNull(),
  cafeId: integer('cafe_id').references(() => cafes.id).notNull(),
  isActive: boolean('is_active').default(true),
  maxPlaysPerDay: integer('max_plays_per_day').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertGameSchema = createInsertSchema(games);
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;

// Game Prizes table
export const gamePrizes = pgTable('game_prizes', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').references(() => games.id).notNull(),
  name: text('name').notNull(),
  type: text('type', { enum: ['points', 'reward'] }).notNull(),
  value: integer('value').notNull(),
  probability: integer('probability').notNull(), // 0-100
  rewardId: integer('reward_id').references(() => rewards.id),
});

export const insertGamePrizeSchema = createInsertSchema(gamePrizes);
export type InsertGamePrize = z.infer<typeof insertGamePrizeSchema>;
export type GamePrize = typeof gamePrizes.$inferSelect;

// Game Plays table
export const gamePlays = pgTable('game_plays', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').references(() => games.id).notNull(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  result: text('result', { enum: ['win', 'lose'] }).notNull(),
  pointsWon: integer('points_won').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const insertGamePlaySchema = createInsertSchema(gamePlays);
export type InsertGamePlay = z.infer<typeof insertGamePlaySchema>;
export type GamePlay = typeof gamePlays.$inferSelect;

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  cafe: one(cafes, {
    fields: [users.id],
    references: [cafes.ownerId],
  }),
  customer: one(customers, {
    fields: [users.id],
    references: [customers.userId],
  }),
}));

export const cafesRelations = relations(cafes, ({ one, many }) => ({
  owner: one(users, {
    fields: [cafes.ownerId],
    references: [users.id],
  }),
  customers: many(customers),
  rewards: many(rewards),
  orders: many(orders),
  games: many(games),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  cafe: one(cafes, {
    fields: [customers.cafeId],
    references: [cafes.id],
  }),
  rewards: many(customerRewards),
  orders: many(orders),
  gamePlays: many(gamePlays),
}));

export const rewardsRelations = relations(rewards, ({ one, many }) => ({
  cafe: one(cafes, {
    fields: [rewards.cafeId],
    references: [cafes.id],
  }),
  customerRewards: many(customerRewards),
  gamePrizes: many(gamePrizes),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  cafe: one(cafes, {
    fields: [orders.cafeId],
    references: [cafes.id],
  }),
  items: many(orderItems),
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  cafe: one(cafes, {
    fields: [games.cafeId],
    references: [cafes.id],
  }),
  prizes: many(gamePrizes),
  plays: many(gamePlays),
}));
