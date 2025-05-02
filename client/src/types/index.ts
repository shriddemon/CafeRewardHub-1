export interface Cafe {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  whatsappEnabled: boolean;
  whatsappNumber?: string;
  plan: "starter" | "professional" | "enterprise" | "trial";
  ownerId: number;
  createdAt: string;
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  points: number;
  type: "discount" | "free_item" | "coupon";
  value: number; // Discount percentage or item value
  cafeId: number;
  isActive: boolean;
  expiryDays?: number;
  createdAt: string;
}

export interface Customer {
  id: number;
  userId: number;
  cafeId: number;
  points: number;
  totalOrders: number;
  totalSpent: number;
  lastVisit?: string;
  createdAt: string;
  phone?: string;
}

export interface CustomerReward {
  id: number;
  customerId: number;
  rewardId: number;
  isRedeemed: boolean;
  redeemedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Order {
  id: number;
  customerId: number;
  cafeId: number;
  amount: number;
  status: "pending" | "completed" | "cancelled";
  type: "dine_in" | "online";
  pointsEarned: number;
  createdAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Game {
  id: number;
  name: string;
  description: string;
  type: "spin_wheel" | "scratch_card" | "quiz" | "memory_card" | "word_scramble" | "coffee_quiz";
  cafeId: number;
  isActive: boolean;
  maxPlaysPerDay: number;
  createdAt: string;
  prizes?: GamePrize[];
}

export interface GamePlay {
  id: number;
  gameId: number;
  customerId: number;
  result: "win" | "lose";
  pointsWon: number;
  createdAt: string;
}

export interface GamePrize {
  id: number;
  gameId: number;
  name: string;
  type: "points" | "reward";
  value: number;
  probability: number; // 0-100
  rewardId?: number;
}

export interface Stats {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  activeRewards: number;
  avgOrderValue: number;
  customerRetentionRate: number;
}
