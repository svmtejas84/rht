import { apiRequest } from "./queryClient";

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Auth API
export const authApi = {
  register: async (userData: { username: string; email: string; password: string; fullName: string }) => {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    return response.json();
  },
  
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },
};

// User API
export const userApi = {
  getUser: async (id: string) => {
    const response = await apiRequest("GET", `/api/users/${id}`);
    return response.json();
  },
  
  updateUser: async (id: string, updates: any) => {
    const response = await apiRequest("PUT", `/api/users/${id}`, updates);
    return response.json();
  },
};

// Product API
export const productApi = {
  getProducts: async (filters?: { category?: string; search?: string; sellerId?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.sellerId) params.append("sellerId", filters.sellerId);
    
    const response = await fetch(`/api/products?${params}`);
    if (!response.ok) throw new Error("Failed to fetch products");
    return response.json();
  },
  
  getProduct: async (id: string) => {
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) throw new Error("Product not found");
    return response.json();
  },
  
  createProduct: async (productData: any) => {
    const response = await apiRequest("POST", "/api/products", productData);
    return response.json();
  },
  
  updateProduct: async (id: string, updates: any) => {
    const response = await apiRequest("PUT", `/api/products/${id}`, updates);
    return response.json();
  },
  
  deleteProduct: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/products/${id}`);
    return response.json();
  },
};

// Cart API
export const cartApi = {
  getCartItems: async (userId: string) => {
    const response = await fetch(`/api/cart/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch cart");
    return response.json();
  },
  
  addToCart: async (cartItem: { userId: string; productId: string; quantity: number }) => {
    const response = await apiRequest("POST", "/api/cart", cartItem);
    return response.json();
  },
  
  updateCartItem: async (id: string, quantity: number) => {
    const response = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
    return response.json();
  },
  
  removeFromCart: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/cart/${id}`);
    return response.json();
  },
  
  clearCart: async (userId: string) => {
    const response = await apiRequest("DELETE", `/api/cart/clear/${userId}`);
    return response.json();
  },
};

// Order API
export const orderApi = {
  getOrders: async (filters?: { buyerId?: string; sellerId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.buyerId) params.append("buyerId", filters.buyerId);
    if (filters?.sellerId) params.append("sellerId", filters.sellerId);
    if (filters?.status) params.append("status", filters.status);
    
    const response = await fetch(`/api/orders?${params}`);
    if (!response.ok) throw new Error("Failed to fetch orders");
    return response.json();
  },
  
  getOrder: async (id: string) => {
    const response = await fetch(`/api/orders/${id}`);
    if (!response.ok) throw new Error("Order not found");
    return response.json();
  },
  
  createOrder: async (orderData: any) => {
    const response = await apiRequest("POST", "/api/orders", orderData);
    return response.json();
  },
  
  updateOrderStatus: async (id: string, status: string) => {
    const response = await apiRequest("PUT", `/api/orders/${id}/status`, { status });
    return response.json();
  },
};

// Loyalty API
export const loyaltyApi = {
  getTransactions: async (userId: string) => {
    const response = await fetch(`/api/loyalty/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch loyalty transactions");
    return response.json();
  },
  
  redeemPoints: async (userId: string, points: number, description: string) => {
    const response = await apiRequest("POST", "/api/loyalty/redeem", { userId, points, description });
    return response.json();
  },
};

// Environmental API
export const environmentalApi = {
  getTotalImpact: async () => {
    const response = await fetch("/api/environmental/impact");
    if (!response.ok) throw new Error("Failed to fetch environmental impact");
    return response.json();
  },
  
  getUserActions: async (userId: string) => {
    const response = await fetch(`/api/environmental/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch environmental actions");
    return response.json();
  },
  
  plantTrees: async (userId: string, points: number) => {
    const response = await apiRequest("POST", "/api/environmental/plant-trees", { userId, points });
    return response.json();
  },
};

// Seller API
export const sellerApi = {
  apply: async (sellerData: any) => {
    const response = await apiRequest("POST", "/api/sellers/apply", sellerData);
    return response.json();
  },
  
  getSeller: async (id: string) => {
    const response = await fetch(`/api/sellers/${id}`);
    if (!response.ok) throw new Error("Seller not found");
    return response.json();
  },
  
  getSellerByUserId: async (userId: string) => {
    const response = await fetch(`/api/sellers/user/${userId}`);
    if (!response.ok) throw new Error("Seller not found");
    return response.json();
  },
  
  updateSeller: async (id: string, updates: any) => {
    const response = await apiRequest("PUT", `/api/sellers/${id}`, updates);
    return response.json();
  },
};

// Payout API
export const payoutApi = {
  getPayouts: async (sellerId?: string) => {
    const params = sellerId ? `?sellerId=${sellerId}` : "";
    const response = await fetch(`/api/payouts${params}`);
    if (!response.ok) throw new Error("Failed to fetch payouts");
    return response.json();
  },
  
  requestPayout: async (sellerId: string, amount: number) => {
    const response = await apiRequest("POST", "/api/payouts/request", { sellerId, amount });
    return response.json();
  },
};

// Admin API
export const adminApi = {
  getStats: async () => {
    const response = await fetch("/api/admin/stats");
    if (!response.ok) throw new Error("Failed to fetch admin stats");
    return response.json();
  },
  
  getDisputes: async () => {
    const response = await fetch("/api/admin/disputes");
    if (!response.ok) throw new Error("Failed to fetch disputes");
    return response.json();
  },
  
  getHeldOrders: async () => {
    const response = await fetch("/api/admin/held-orders");
    if (!response.ok) throw new Error("Failed to fetch held orders");
    return response.json();
  },
  
  releaseFunds: async (orderId: string) => {
    const response = await apiRequest("POST", "/api/admin/release-funds", { orderId });
    return response.json();
  },
  
  processRefund: async (orderId: string) => {
    const response = await apiRequest("POST", "/api/admin/process-refund", { orderId });
    return response.json();
  },
  
  getSellerApplications: async () => {
    const response = await fetch("/api/admin/seller-applications");
    if (!response.ok) throw new Error("Failed to fetch seller applications");
    return response.json();
  },
};
