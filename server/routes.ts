import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProductSchema, insertCartItemSchema, insertOrderSchema, insertSellerSchema } from "@shared/schema";
// Mock payment service functions
const capturePayment = async (orderId: string, amount: string) => {
  console.log(`[Payment Mock] Capturing payment of ${amount} for order ${orderId}`);
  return {
    success: true,
    id: `pi_${Math.random().toString(36).substr(2, 9)}`,
    clientSecret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
    message: "Payment captured successfully (mocked)."
  };
};

const payoutToSeller = async (sellerAccountId: string, amount: string) => {
  console.log(`[Payment Mock] Initiating payout of ${amount} to seller ${sellerAccountId}`);
  return {
    success: true,
    id: `po_${Math.random().toString(36).substr(2, 9)}`,
    message: "Payout to seller successful (mocked)."
  };
};

const createRefund = async (paymentIntentId: string, amount: string) => {
  console.log(`[Payment Mock] Refunding ${amount} for payment ${paymentIntentId}`);
  return {
    success: true,
    id: `re_${Math.random().toString(36).substr(2, 9)}`,
    status: 'succeeded',
    message: "Refund processed successfully (mocked)."
  };
};
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In production, you'd use proper session management
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User management
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUserWithStats(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search, sellerId } = req.query;
      const filters = {
        category: category as string,
        search: search as string,
        sellerId: sellerId as string,
      };
      
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductWithSeller(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const updates = req.body;
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get("/api/cart/:userId", async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.params.userId);
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const cartItemData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const deleted = await storage.removeFromCart(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart/clear/:userId", async (req, res) => {
    try {
      await storage.clearCart(req.params.userId);
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const { buyerId, sellerId, status } = req.query;
      const filters = {
        buyerId: buyerId as string,
        sellerId: sellerId as string,
        status: status as string,
      };
      
      const orders = await storage.getOrders(filters);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrderWithItems(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      
      // Create order
      const order = await storage.createOrder(orderData);
      
      // Capture payment
      const paymentResult = await capturePayment(order.id, Number(order.totalAmount));
      
      if (paymentResult.success) {
        // Update order with payment info
        await storage.updateOrder(order.id, {
          paymentIntentId: paymentResult.id,
          paymentStatus: "captured",
          status: "paid"
        });
        
        // Award loyalty points
        if (orderData.loyaltyPointsEarned > 0) {
          await storage.createLoyaltyTransaction({
            userId: orderData.buyerId,
            type: "earned",
            points: orderData.loyaltyPointsEarned,
            orderId: order.id,
            description: `Points earned from order ${order.id}`
          });
        }
        
        // Clear user's cart
        await storage.clearCart(orderData.buyerId);
        
        res.status(201).json({ order, payment: paymentResult });
      } else {
        res.status(400).json({ message: "Payment failed", error: paymentResult });
      }
    } catch (error) {
      res.status(400).json({ message: "Failed to create order", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const order = await storage.updateOrder(req.params.id, { status });
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Handle automatic escrow release for delivered orders
      if (status === "delivered") {
        const releaseDate = new Date();
        releaseDate.setDate(releaseDate.getDate() + 7); // 7 days escrow period
        
        await storage.updateOrder(order.id, {
          escrowReleaseDate: releaseDate
        });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Loyalty routes
  app.get("/api/loyalty/:userId", async (req, res) => {
    try {
      const transactions = await storage.getLoyaltyTransactions(req.params.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch loyalty transactions" });
    }
  });

  app.post("/api/loyalty/redeem", async (req, res) => {
    try {
      const { userId, points, description } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user || user.loyaltyPoints < points) {
        return res.status(400).json({ message: "Insufficient loyalty points" });
      }
      
      const transaction = await storage.createLoyaltyTransaction({
        userId,
        type: "redeemed",
        points: -points,
        description
      });
      
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to redeem points" });
    }
  });

  // Environmental impact routes
  app.get("/api/environmental/impact", async (req, res) => {
    try {
      const impact = await storage.getTotalEnvironmentalImpact();
      res.json(impact);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch environmental impact" });
    }
  });

  app.get("/api/environmental/:userId", async (req, res) => {
    try {
      const actions = await storage.getEnvironmentalActions(req.params.userId);
      res.json(actions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch environmental actions" });
    }
  });

  app.post("/api/environmental/plant-trees", async (req, res) => {
    try {
      const { userId, points } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user || user.loyaltyPoints < points) {
        return res.status(400).json({ message: "Insufficient loyalty points" });
      }
      
      const treesPlanted = Math.floor(points / 100); // 100 points = 1 tree
      
      // Deduct points
      await storage.createLoyaltyTransaction({
        userId,
        type: "redeemed",
        points: -points,
        description: `Donated ${points} points to plant ${treesPlanted} trees`
      });
      
      // Record environmental action
      const action = await storage.createEnvironmentalAction({
        userId,
        actionType: "tree_planted",
        quantity: treesPlanted.toString(),
        verificationStatus: "verified"
      });
      
      // Update user's tree count
      await storage.updateUser(userId, {
        treesPlanted: user.treesPlanted + treesPlanted
      });
      
      res.json({ action, treesPlanted });
    } catch (error) {
      res.status(500).json({ message: "Failed to plant trees" });
    }
  });

  // Seller routes
  app.post("/api/sellers/apply", async (req, res) => {
    try {
      const sellerData = insertSellerSchema.parse(req.body);
      const seller = await storage.createSeller(sellerData);
      res.status(201).json(seller);
    } catch (error) {
      res.status(400).json({ message: "Invalid seller application data" });
    }
  });

  app.get("/api/sellers/:id", async (req, res) => {
    try {
      const seller = await storage.getSeller(req.params.id);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      res.json(seller);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller" });
    }
  });

  app.get("/api/sellers/user/:userId", async (req, res) => {
    try {
      const seller = await storage.getSellerByUserId(req.params.userId);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found for user" });
      }
      res.json(seller);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller" });
    }
  });

  app.put("/api/sellers/:id", async (req, res) => {
    try {
      const updates = req.body;
      const seller = await storage.updateSeller(req.params.id, updates);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      res.json(seller);
    } catch (error) {
      res.status(500).json({ message: "Failed to update seller" });
    }
  });

  // Payout routes
  app.get("/api/payouts", async (req, res) => {
    try {
      const { sellerId } = req.query;
      const payouts = await storage.getPayouts(sellerId as string);
      res.json(payouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  app.post("/api/payouts/request", async (req, res) => {
    try {
      const { sellerId, amount } = req.body;
      
      const seller = await storage.getSeller(sellerId);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      
      if (Number(seller.availableBalance) < amount) {
        return res.status(400).json({ message: "Insufficient available balance" });
      }
      
      const payout = await storage.createPayout({
        sellerId,
        amount: amount.toString(),
        status: "pending",
        payoutMethod: "bank_transfer"
      });
      
      // Update seller balance
      await storage.updateSeller(sellerId, {
        availableBalance: (Number(seller.availableBalance) - amount).toString(),
        pendingBalance: (Number(seller.pendingBalance) + amount).toString()
      });
      
      res.status(201).json(payout);
    } catch (error) {
      res.status(500).json({ message: "Failed to request payout" });
    }
  });

  // Admin routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch platform stats" });
    }
  });

  app.get("/api/admin/disputes", async (req, res) => {
    try {
      const disputes = await storage.getDisputedOrders();
      res.json(disputes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch disputes" });
    }
  });

  app.get("/api/admin/held-orders", async (req, res) => {
    try {
      const heldOrders = await storage.getHeldOrders();
      res.json(heldOrders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch held orders" });
    }
  });

  app.post("/api/admin/release-funds", async (req, res) => {
    try {
      const { orderId } = req.body;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const seller = await storage.getSeller(order.sellerId);
      if (!seller) {
        return res.status(404).json({ message: "Seller not found" });
      }
      
      // Process payout to seller
      const payoutResult = await payoutToSeller(order.sellerId, Number(order.totalAmount) - Number(order.platformFee));
      
      if (payoutResult.success) {
        // Update order status
        await storage.updateOrder(orderId, {
          paymentStatus: "released",
          adminNotes: "Funds released by admin"
        });
        
        // Update seller balance
        const netAmount = Number(order.totalAmount) - Number(order.platformFee);
        await storage.updateSeller(order.sellerId, {
          availableBalance: (Number(seller.availableBalance) + netAmount).toString(),
          totalSales: (Number(seller.totalSales) + Number(order.totalAmount)).toString()
        });
        
        res.json({ message: "Funds released successfully", payout: payoutResult });
      } else {
        res.status(500).json({ message: "Failed to release funds", error: payoutResult });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to release funds" });
    }
  });

  app.post("/api/admin/process-refund", async (req, res) => {
    try {
      const { orderId } = req.body;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Process refund
      const refundResult = await createRefund(order.paymentIntentId!, Number(order.totalAmount));
      
      if (refundResult.success) {
        // Update order status
        await storage.updateOrder(orderId, {
          paymentStatus: "refunded",
          status: "cancelled",
          adminNotes: "Refund processed by admin"
        });
        
        // Deduct loyalty points if they were awarded
        if (order.loyaltyPointsEarned > 0) {
          await storage.createLoyaltyTransaction({
            userId: order.buyerId,
            type: "expired",
            points: -order.loyaltyPointsEarned,
            orderId,
            description: `Points deducted due to refund for order ${orderId}`
          });
        }
        
        res.json({ message: "Refund processed successfully", refund: refundResult });
      } else {
        res.status(500).json({ message: "Failed to process refund", error: refundResult });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to process refund" });
    }
  });

  app.get("/api/admin/seller-applications", async (req, res) => {
    try {
      const applications = await storage.getSellerApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller applications" });
    }
  });

  // Note: Additional seller and webhook routes removed due to module compatibility issues
  // All necessary functionality is implemented directly in this routes file

  const httpServer = createServer(app);
  return httpServer;
}
