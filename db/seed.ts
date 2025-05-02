import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    console.log("Starting database seeding...");

    // Check if users table exists and has data
    const usersExist = await db.select().from(schema.users).limit(1);
    
    if (usersExist.length === 0) {
      console.log("Seeding users...");
      
      // Create cafe owner
      const ownerPassword = await hashPassword("password");
      const [owner] = await db.insert(schema.users).values({
        username: "owner",
        password: ownerPassword,
        role: "owner",
        name: "Cafe Owner",
        email: "owner@example.com",
        phone: "+91987654321"
      }).returning();
      
      console.log("Created owner:", owner.id);
      
      // Create cafe
      const [cafe] = await db.insert(schema.cafes).values({
        name: "Coffee Haven",
        address: "123 Main Street, Bangalore",
        phone: "+91987654321",
        email: "info@coffeehaven.com",
        logo: "https://placehold.co/200x200/orange/white?text=CH",
        whatsappEnabled: true,
        whatsappNumber: "+91987654321",
        plan: "professional",
        ownerId: owner.id
      }).returning();
      
      console.log("Created cafe:", cafe.id);
      
      // Create customer user
      const customerPassword = await hashPassword("password");
      const [customerUser] = await db.insert(schema.users).values({
        username: "customer",
        password: customerPassword,
        role: "customer",
        name: "Regular Customer",
        email: "customer@example.com",
        phone: "+91876543210"
      }).returning();
      
      console.log("Created customer user:", customerUser.id);
      
      // Create customer profile
      const [customer] = await db.insert(schema.customers).values({
        userId: customerUser.id,
        cafeId: cafe.id,
        name: "Regular Customer",
        email: "customer@example.com",
        phone: "+91876543210",
        points: 150,
        totalOrders: 5,
        totalSpent: "2500"
      }).returning();
      
      console.log("Created customer profile:", customer.id);
      
      // Create rewards
      const rewards = [
        {
          name: "Free Coffee",
          description: "Enjoy a free coffee of your choice",
          points: 100,
          type: "free_item" as const,
          value: 150,
          cafeId: cafe.id,
          isActive: true,
          expiryDays: 30
        },
        {
          name: "10% Discount",
          description: "Get 10% off on your next purchase",
          points: 50,
          type: "discount" as const,
          value: 10,
          cafeId: cafe.id,
          isActive: true,
          expiryDays: 30
        },
        {
          name: "Free Dessert",
          description: "Treat yourself to a free dessert with any order",
          points: 80,
          type: "free_item" as const,
          value: 100,
          cafeId: cafe.id,
          isActive: true,
          expiryDays: 30
        }
      ];
      
      for (const reward of rewards) {
        await db.insert(schema.rewards).values(reward);
      }
      
      console.log("Created rewards");
      
      // Create games
      const games = [
        {
          name: "Spin & Win",
          description: "Spin the wheel to win exciting rewards!",
          type: "spin_wheel" as const,
          cafeId: cafe.id,
          isActive: true,
          maxPlaysPerDay: 1
        },
        {
          name: "Scratch Card",
          description: "Scratch and reveal your prize!",
          type: "scratch_card" as const,
          cafeId: cafe.id,
          isActive: true,
          maxPlaysPerDay: 1
        },
        {
          name: "Coffee Quiz",
          description: "Test your coffee knowledge and win points!",
          type: "quiz" as const,
          cafeId: cafe.id,
          isActive: true,
          maxPlaysPerDay: 1
        },
        {
          name: "Memory Match",
          description: "Match food & drink pairs to win rewards!",
          type: "memory_card" as const,
          cafeId: cafe.id,
          isActive: true,
          maxPlaysPerDay: 1
        },
        {
          name: "Word Scramble",
          description: "Unscramble coffee-related words to earn points!",
          type: "word_scramble" as const,
          cafeId: cafe.id,
          isActive: true,
          maxPlaysPerDay: 1
        }
      ];
      
      for (const game of games) {
        await db.insert(schema.games).values(game);
      }
      
      console.log("Created games");
      
      console.log("Seeding completed successfully");
    } else {
      console.log("Database already has users, skipping seeding");
    }
  } catch (error) {
    console.error("Error during seeding:", error);
  }
}

seed();
