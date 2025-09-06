import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("buyer"), // buyer, seller, admin
  loyaltyPoints: integer("loyalty_points").notNull().default(0),
  loyaltyTier: text("loyalty_tier").notNull().default("bronze"), // bronze, silver, gold, platinum
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).notNull().default("0"),
  treesPlanted: integer("trees_planted").notNull().default(0),
  carbonOffset: decimal("carbon_offset", { precision: 8, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sellers = pgTable("sellers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  kycStatus: text("kyc_status").notNull().default("pending"), // pending, verified, rejected
  taxId: text("tax_id"),
  bankDetails: jsonb("bank_details"), // encrypted bank account info
  sustainabilityScore: integer("sustainability_score").notNull().default(0),
  totalSales: decimal("total_sales", { precision: 12, scale: 2 }).notNull().default("0"),
  pendingBalance: decimal("pending_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  availableBalance: decimal("available_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  rating: decimal("rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => sellers.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  tags: jsonb("tags").notNull().default("[]"),
  images: jsonb("images").notNull().default("[]"),
  sustainabilityFeatures: jsonb("sustainability_features").notNull().default("[]"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  carbonFootprint: decimal("carbon_footprint", { precision: 8, scale: 2 }),
  recycledContent: integer("recycled_content"), // percentage
  biodegradable: boolean("biodegradable").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  buyerId: varchar("buyer_id").notNull().references(() => users.id),
  sellerId: varchar("seller_id").notNull().references(() => sellers.id),
  status: text("status").notNull().default("pending"), // pending, paid, shipped, delivered, disputed, cancelled
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, captured, held, released, refunded
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  platformFee: decimal("platform_fee", { precision: 10, scale: 2 }).notNull().default("0"),
  loyaltyPointsEarned: integer("loyalty_points_earned").notNull().default(0),
  loyaltyPointsUsed: integer("loyalty_points_used").notNull().default(0),
  shippingAddress: jsonb("shipping_address").notNull(),
  paymentIntentId: text("payment_intent_id"),
  escrowReleaseDate: timestamp("escrow_release_date"),
  disputeReason: text("dispute_reason"),
  adminNotes: text("admin_notes"),
  environmentalImpact: jsonb("environmental_impact"), // trees planted, carbon offset
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  productSnapshot: jsonb("product_snapshot").notNull(), // store product details at time of order
});

export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // earned, redeemed, expired
  points: integer("points").notNull(),
  orderId: varchar("order_id").references(() => orders.id),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const environmentalActions = pgTable("environmental_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  actionType: text("action_type").notNull(), // tree_planted, carbon_offset, plastic_reduced
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  orderId: varchar("order_id").references(() => orders.id),
  verificationStatus: text("verification_status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payouts = pgTable("payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: varchar("seller_id").notNull().references(() => sellers.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  payoutMethod: text("payout_method").notNull().default("bank_transfer"),
  externalPayoutId: text("external_payout_id"),
  failureReason: text("failure_reason"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSellerSchema = createInsertSchema(sellers).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertEnvironmentalActionSchema = createInsertSchema(environmentalActions).omit({
  id: true,
  createdAt: true,
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  requestedAt: true,
  processedAt: true,
});

// Select types
export type User = typeof users.$inferSelect;
export type Seller = typeof sellers.$inferSelect;
export type Product = typeof products.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type EnvironmentalAction = typeof environmentalActions.$inferSelect;
export type Payout = typeof payouts.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSeller = z.infer<typeof insertSellerSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertLoyaltyTransaction = z.infer<typeof insertLoyaltyTransactionSchema>;
export type InsertEnvironmentalAction = z.infer<typeof insertEnvironmentalActionSchema>;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;

// Extended types for API responses
export type ProductWithSeller = Product & {
  seller: Seller;
};

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
  buyer: User;
  seller: Seller;
};

export type CartItemWithProduct = CartItem & {
  product: ProductWithSeller;
};

export type UserWithStats = User & {
  orderCount: number;
  totalOrders: number;
  currentYearImpact: {
    treesPlanted: number;
    carbonOffset: number;
  };
};
