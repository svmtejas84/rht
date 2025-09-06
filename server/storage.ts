import { 
  type User, 
  type InsertUser, 
  type Seller, 
  type InsertSeller,
  type Product, 
  type InsertProduct,
  type ProductWithSeller,
  type CartItem,
  type InsertCartItem,
  type CartItemWithProduct,
  type Order,
  type InsertOrder,
  type OrderWithItems,
  type OrderItem,
  type InsertOrderItem,
  type LoyaltyTransaction,
  type InsertLoyaltyTransaction,
  type EnvironmentalAction,
  type InsertEnvironmentalAction,
  type Payout,
  type InsertPayout,
  type UserWithStats
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  getUserWithStats(id: string): Promise<UserWithStats | undefined>;
  
  // Seller management
  getSeller(id: string): Promise<Seller | undefined>;
  getSellerByUserId(userId: string): Promise<Seller | undefined>;
  createSeller(seller: InsertSeller): Promise<Seller>;
  updateSeller(id: string, updates: Partial<Seller>): Promise<Seller | undefined>;
  getSellerApplications(): Promise<Seller[]>;
  
  // Product management
  getProduct(id: string): Promise<Product | undefined>;
  getProductWithSeller(id: string): Promise<ProductWithSeller | undefined>;
  getProducts(filters?: { category?: string; sellerId?: string; search?: string }): Promise<ProductWithSeller[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Cart management
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(userId: string): Promise<boolean>;
  
  // Order management
  getOrder(id: string): Promise<Order | undefined>;
  getOrderWithItems(id: string): Promise<OrderWithItems | undefined>;
  getOrders(filters?: { buyerId?: string; sellerId?: string; status?: string }): Promise<OrderWithItems[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Loyalty system
  getLoyaltyTransactions(userId: string): Promise<LoyaltyTransaction[]>;
  createLoyaltyTransaction(transaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction>;
  
  // Environmental tracking
  getEnvironmentalActions(userId: string): Promise<EnvironmentalAction[]>;
  createEnvironmentalAction(action: InsertEnvironmentalAction): Promise<EnvironmentalAction>;
  getTotalEnvironmentalImpact(): Promise<{ treesPlanted: number; carbonOffset: number; plasticReduced: number; wasteReduced: number }>;
  
  // Payout management
  getPayouts(sellerId?: string): Promise<Payout[]>;
  createPayout(payout: InsertPayout): Promise<Payout>;
  updatePayout(id: string, updates: Partial<Payout>): Promise<Payout | undefined>;
  
  // Admin functions
  getDisputedOrders(): Promise<OrderWithItems[]>;
  getHeldOrders(): Promise<OrderWithItems[]>;
  getPlatformStats(): Promise<{
    totalRevenue: number;
    heldFunds: number;
    platformFee: number;
    activeOrders: number;
    activeSellers: number;
    disputeCount: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private sellers: Map<string, Seller> = new Map();
  private products: Map<string, Product> = new Map();
  private cartItems: Map<string, CartItem> = new Map();
  private orders: Map<string, Order> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();
  private loyaltyTransactions: Map<string, LoyaltyTransaction> = new Map();
  private environmentalActions: Map<string, EnvironmentalAction> = new Map();
  private payouts: Map<string, Payout> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const user1: User = {
      id: "user1",
      username: "sarah_eco",
      email: "sarah@example.com",
      password: "hashedpassword",
      fullName: "Sarah Johnson",
      role: "buyer",
      loyaltyPoints: 2450,
      loyaltyTier: "gold",
      totalSpent: "15640.00",
      treesPlanted: 12,
      carbonOffset: "2.40",
      createdAt: new Date("2024-01-15"),
    };

    const user2: User = {
      id: "user2",
      username: "eco_seller",
      email: "seller@ecocompany.com",
      password: "hashedpassword",
      fullName: "Green Business Owner",
      role: "seller",
      loyaltyPoints: 500,
      loyaltyTier: "bronze",
      totalSpent: "0.00",
      treesPlanted: 0,
      carbonOffset: "0.00",
      createdAt: new Date("2024-02-01"),
    };

    const admin: User = {
      id: "admin1",
      username: "admin",
      email: "admin@ecomarket.com",
      password: "hashedpassword",
      fullName: "Platform Admin",
      role: "admin",
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
      totalSpent: "0.00",
      treesPlanted: 0,
      carbonOffset: "0.00",
      createdAt: new Date("2024-01-01"),
    };

    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);
    this.users.set(admin.id, admin);

    // Create sample seller
    const seller1: Seller = {
      id: "seller1",
      userId: "user2",
      businessName: "EcoClothing Co.",
      kycStatus: "verified",
      taxId: "TAX123456",
      bankDetails: { accountNumber: "****1234", bankName: "Green Bank" },
      sustainabilityScore: 85,
      totalSales: "45670.00",
      pendingBalance: "8450.00",
      availableBalance: "12350.00",
      rating: "4.80",
      reviewCount: 127,
      createdAt: new Date("2024-02-01"),
    };

    this.sellers.set(seller1.id, seller1);

    // Create sample products
    const products = [
      {
        id: "prod1",
        sellerId: "seller1",
        name: "Organic Cotton T-Shirt",
        description: "Made from 100% organic cotton with natural dyes",
        price: "899.00",
        category: "Clothing",
        tags: ["organic", "cotton", "eco-friendly"],
        images: ["https://images.unsplash.com/photo-1523381210434-271e8be1f52b"],
        sustainabilityFeatures: ["Organic materials", "Natural dyes", "Fair trade"],
        stockQuantity: 50,
        isActive: true,
        carbonFootprint: "2.50",
        recycledContent: 0,
        biodegradable: true,
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-03-01"),
      },
      {
        id: "prod2",
        sellerId: "seller1",
        name: "Bamboo Water Bottle",
        description: "Sustainable bamboo fiber with leak-proof design",
        price: "1299.00",
        category: "Home & Garden",
        tags: ["bamboo", "reusable", "zero-waste"],
        images: ["https://images.unsplash.com/photo-1602143407151-7111542de6e8"],
        sustainabilityFeatures: ["Bamboo fiber", "Reusable", "BPA-free"],
        stockQuantity: 30,
        isActive: true,
        carbonFootprint: "1.80",
        recycledContent: 0,
        biodegradable: true,
        createdAt: new Date("2024-03-02"),
        updatedAt: new Date("2024-03-02"),
      },
      {
        id: "prod3",
        sellerId: "seller1",
        name: "Solar Garden Lights",
        description: "Eco-friendly outdoor lighting with automatic sensors",
        price: "2499.00",
        category: "Electronics",
        tags: ["solar", "energy-efficient", "outdoor"],
        images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64"],
        sustainabilityFeatures: ["Solar powered", "Energy efficient", "Long lasting"],
        stockQuantity: 20,
        isActive: true,
        carbonFootprint: "5.20",
        recycledContent: 25,
        biodegradable: false,
        createdAt: new Date("2024-03-03"),
        updatedAt: new Date("2024-03-03"),
      },
    ];

    products.forEach(product => this.products.set(product.id, product as Product));

    // Create sample orders
    const order1: Order = {
      id: "order1",
      buyerId: "user1",
      sellerId: "seller1",
      status: "delivered",
      paymentStatus: "released",
      totalAmount: "3497.00",
      platformFee: "174.85",
      loyaltyPointsEarned: 175,
      loyaltyPointsUsed: 0,
      shippingAddress: {
        street: "123 Green Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India"
      },
      paymentIntentId: "pi_test123",
      escrowReleaseDate: new Date("2024-03-20"),
      disputeReason: null,
      adminNotes: null,
      environmentalImpact: { treesPlanted: 2, carbonOffset: 0.5 },
      createdAt: new Date("2024-03-15"),
      updatedAt: new Date("2024-03-20"),
    };

    this.orders.set(order1.id, order1);
  }

  // User management
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      role: "buyer",
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
      totalSpent: "0",
      treesPlanted: 0,
      carbonOffset: "0",
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserWithStats(id: string): Promise<UserWithStats | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const userOrders = Array.from(this.orders.values()).filter(order => order.buyerId === id);
    const currentYear = new Date().getFullYear();
    const currentYearActions = Array.from(this.environmentalActions.values())
      .filter(action => action.userId === id && action.createdAt.getFullYear() === currentYear);

    return {
      ...user,
      orderCount: userOrders.length,
      totalOrders: userOrders.length,
      currentYearImpact: {
        treesPlanted: currentYearActions
          .filter(action => action.actionType === "tree_planted")
          .reduce((sum, action) => sum + Number(action.quantity), 0),
        carbonOffset: currentYearActions
          .filter(action => action.actionType === "carbon_offset")
          .reduce((sum, action) => sum + Number(action.quantity), 0),
      }
    };
  }

  // Seller management
  async getSeller(id: string): Promise<Seller | undefined> {
    return this.sellers.get(id);
  }

  async getSellerByUserId(userId: string): Promise<Seller | undefined> {
    return Array.from(this.sellers.values()).find(seller => seller.userId === userId);
  }

  async createSeller(insertSeller: InsertSeller): Promise<Seller> {
    const id = randomUUID();
    const seller: Seller = {
      ...insertSeller,
      id,
      createdAt: new Date(),
    };
    this.sellers.set(id, seller);
    return seller;
  }

  async updateSeller(id: string, updates: Partial<Seller>): Promise<Seller | undefined> {
    const seller = this.sellers.get(id);
    if (!seller) return undefined;
    
    const updatedSeller = { ...seller, ...updates };
    this.sellers.set(id, updatedSeller);
    return updatedSeller;
  }

  async getSellerApplications(): Promise<Seller[]> {
    return Array.from(this.sellers.values()).filter(seller => seller.kycStatus === "pending");
  }

  // Product management
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductWithSeller(id: string): Promise<ProductWithSeller | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const seller = this.sellers.get(product.sellerId);
    if (!seller) return undefined;
    
    return { ...product, seller };
  }

  async getProducts(filters?: { category?: string; sellerId?: string; search?: string }): Promise<ProductWithSeller[]> {
    let products = Array.from(this.products.values()).filter(product => product.isActive);
    
    if (filters?.category) {
      products = products.filter(product => product.category === filters.category);
    }
    
    if (filters?.sellerId) {
      products = products.filter(product => product.sellerId === filters.sellerId);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    const productsWithSeller: ProductWithSeller[] = [];
    for (const product of products) {
      const seller = this.sellers.get(product.sellerId);
      if (seller) {
        productsWithSeller.push({ ...product, seller });
      }
    }
    
    return productsWithSeller;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Cart management
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const userCartItems = Array.from(this.cartItems.values()).filter(item => item.userId === userId);
    
    const cartItemsWithProduct: CartItemWithProduct[] = [];
    for (const cartItem of userCartItems) {
      const productWithSeller = await this.getProductWithSeller(cartItem.productId);
      if (productWithSeller) {
        cartItemsWithProduct.push({ ...cartItem, product: productWithSeller });
      }
    }
    
    return cartItemsWithProduct;
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values())
      .find(item => item.userId === insertCartItem.userId && item.productId === insertCartItem.productId);
    
    if (existingItem) {
      // Update quantity
      const updatedItem = { ...existingItem, quantity: existingItem.quantity + insertCartItem.quantity };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }
    
    const id = randomUUID();
    const cartItem: CartItem = {
      ...insertCartItem,
      id,
      createdAt: new Date(),
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    if (quantity <= 0) {
      this.cartItems.delete(id);
      return cartItem;
    }
    
    const updatedItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: string): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.userId === userId);
    
    userCartItems.forEach(([id, _]) => this.cartItems.delete(id));
    return true;
  }

  // Order management
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderWithItems(id: string): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const buyer = this.users.get(order.buyerId);
    const seller = this.sellers.get(order.sellerId);
    if (!buyer || !seller) return undefined;
    
    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => {
        const product = this.products.get(item.productId);
        return product ? { ...item, product } : null;
      })
      .filter(Boolean) as (OrderItem & { product: Product })[];
    
    return { ...order, items, buyer, seller };
  }

  async getOrders(filters?: { buyerId?: string; sellerId?: string; status?: string }): Promise<OrderWithItems[]> {
    let orders = Array.from(this.orders.values());
    
    if (filters?.buyerId) {
      orders = orders.filter(order => order.buyerId === filters.buyerId);
    }
    
    if (filters?.sellerId) {
      orders = orders.filter(order => order.sellerId === filters.sellerId);
    }
    
    if (filters?.status) {
      orders = orders.filter(order => order.status === filters.status);
    }
    
    const ordersWithItems: OrderWithItems[] = [];
    for (const order of orders) {
      const orderWithItems = await this.getOrderWithItems(order.id);
      if (orderWithItems) {
        ordersWithItems.push(orderWithItems);
      }
    }
    
    return ordersWithItems;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Loyalty system
  async getLoyaltyTransactions(userId: string): Promise<LoyaltyTransaction[]> {
    return Array.from(this.loyaltyTransactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createLoyaltyTransaction(insertTransaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction> {
    const id = randomUUID();
    const transaction: LoyaltyTransaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    this.loyaltyTransactions.set(id, transaction);
    
    // Update user's loyalty points
    const user = this.users.get(insertTransaction.userId);
    if (user) {
      const newPoints = user.loyaltyPoints + insertTransaction.points;
      await this.updateUser(user.id, { loyaltyPoints: Math.max(0, newPoints) });
    }
    
    return transaction;
  }

  // Environmental tracking
  async getEnvironmentalActions(userId: string): Promise<EnvironmentalAction[]> {
    return Array.from(this.environmentalActions.values())
      .filter(action => action.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createEnvironmentalAction(insertAction: InsertEnvironmentalAction): Promise<EnvironmentalAction> {
    const id = randomUUID();
    const action: EnvironmentalAction = {
      ...insertAction,
      id,
      createdAt: new Date(),
    };
    this.environmentalActions.set(id, action);
    return action;
  }

  async getTotalEnvironmentalImpact(): Promise<{ treesPlanted: number; carbonOffset: number; plasticReduced: number; wasteReduced: number }> {
    const actions = Array.from(this.environmentalActions.values());
    
    return {
      treesPlanted: actions
        .filter(action => action.actionType === "tree_planted")
        .reduce((sum, action) => sum + Number(action.quantity), 2847),
      carbonOffset: actions
        .filter(action => action.actionType === "carbon_offset")
        .reduce((sum, action) => sum + Number(action.quantity), 156),
      plasticReduced: 89, // percentage
      wasteReduced: 1200, // kg
    };
  }

  // Payout management
  async getPayouts(sellerId?: string): Promise<Payout[]> {
    let payouts = Array.from(this.payouts.values());
    
    if (sellerId) {
      payouts = payouts.filter(payout => payout.sellerId === sellerId);
    }
    
    return payouts.sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime());
  }

  async createPayout(insertPayout: InsertPayout): Promise<Payout> {
    const id = randomUUID();
    const payout: Payout = {
      ...insertPayout,
      id,
      requestedAt: new Date(),
      processedAt: null,
    };
    this.payouts.set(id, payout);
    return payout;
  }

  async updatePayout(id: string, updates: Partial<Payout>): Promise<Payout | undefined> {
    const payout = this.payouts.get(id);
    if (!payout) return undefined;
    
    const updatedPayout = { ...payout, ...updates };
    if (updates.status === "completed" || updates.status === "failed") {
      updatedPayout.processedAt = new Date();
    }
    
    this.payouts.set(id, updatedPayout);
    return updatedPayout;
  }

  // Admin functions
  async getDisputedOrders(): Promise<OrderWithItems[]> {
    return this.getOrders({ status: "disputed" });
  }

  async getHeldOrders(): Promise<OrderWithItems[]> {
    const orders = Array.from(this.orders.values()).filter(order => 
      order.paymentStatus === "held" || order.status === "disputed"
    );
    
    const ordersWithItems: OrderWithItems[] = [];
    for (const order of orders) {
      const orderWithItems = await this.getOrderWithItems(order.id);
      if (orderWithItems) {
        ordersWithItems.push(orderWithItems);
      }
    }
    
    return ordersWithItems;
  }

  async getPlatformStats(): Promise<{
    totalRevenue: number;
    heldFunds: number;
    platformFee: number;
    activeOrders: number;
    activeSellers: number;
    disputeCount: number;
  }> {
    const orders = Array.from(this.orders.values());
    const sellers = Array.from(this.sellers.values());
    
    return {
      totalRevenue: orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
      heldFunds: orders
        .filter(order => order.paymentStatus === "held")
        .reduce((sum, order) => sum + Number(order.totalAmount), 0),
      platformFee: orders.reduce((sum, order) => sum + Number(order.platformFee), 0),
      activeOrders: orders.filter(order => 
        order.status === "pending" || order.status === "paid" || order.status === "shipped"
      ).length,
      activeSellers: sellers.filter(seller => seller.kycStatus === "verified").length,
      disputeCount: orders.filter(order => order.status === "disputed").length,
    };
  }
}

export const storage = new MemStorage();
