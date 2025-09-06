import { useQuery } from "@tanstack/react-query";
import { Package, DollarSign, Star, TrendingUp, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { orderApi, productApi, sellerApi, payoutApi } from "@/lib/api";
import PayoutCard from "@/components/seller/payout-card";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function SellerDashboard() {
  const { user } = useAuth();

  const { data: seller } = useQuery({
    queryKey: ["/api/sellers/user", user?.id],
    queryFn: () => sellerApi.getSellerByUserId(user?.id!),
    enabled: !!user && user.role === "seller",
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders", seller?.id],
    queryFn: () => orderApi.getOrders({ sellerId: seller?.id }),
    enabled: !!seller,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products", seller?.id],
    queryFn: () => productApi.getProducts({ sellerId: seller?.id }),
    enabled: !!seller,
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ["/api/payouts", seller?.id],
    queryFn: () => payoutApi.getPayouts(seller?.id),
    enabled: !!seller,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your seller dashboard.
          </p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "seller") {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Seller Access Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to be a registered seller to access this dashboard.
          </p>
          <Link href="/seller-apply">
            <Button>Apply to Become a Seller</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);
  const activeProducts = products.filter(p => p.isActive);
  const pendingOrders = orders.filter(order => order.status === 'paid' || order.status === 'pending');
  const completedOrders = orders.filter(order => order.status === 'delivered');

  const stats = {
    totalSales: parseFloat(seller.totalSales),
    ordersCount: orders.length,
    productsCount: activeProducts.length,
    rating: parseFloat(seller.rating),
    pendingBalance: parseFloat(seller.pendingBalance),
    availableBalance: parseFloat(seller.availableBalance),
  };

  return (
    <div className="container mx-auto px-4 py-20" data-testid="seller-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Seller Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your products, orders, and payouts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={seller.kycStatus === 'verified' ? 'default' : 'secondary'}
              className={
                seller.kycStatus === 'verified'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }
            >
              KYC {seller.kycStatus}
            </Badge>
            <Badge variant="outline" className="bg-accent/10 text-accent">
              Sustainability Score: {seller.sustainabilityScore}/100
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold text-primary" data-testid="total-sales">
                  ₹{stats.totalSales.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold text-accent" data-testid="orders-count">
                  {stats.ordersCount}
                </p>
              </div>
              <Package className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <p className="text-2xl font-bold text-secondary" data-testid="products-count">
                  {stats.productsCount}
                </p>
              </div>
              <Package className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold text-foreground" data-testid="seller-rating">
                  {stats.rating.toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {pendingOrders.length} pending
                    </Badge>
                    <Badge variant="outline">
                      {completedOrders.length} completed
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground">
                      Orders will appear here when customers purchase your products
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        data-testid={`seller-order-${order.id}`}
                      >
                        <div className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">Order #{order.id.slice(-8)}</p>
                              <p className="text-sm text-muted-foreground">
                                Customer: {order.buyer?.fullName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={order.paymentStatus === 'captured' ? 'default' : 'secondary'}
                                className={
                                  order.paymentStatus === 'captured'
                                    ? 'bg-primary text-primary-foreground'
                                    : order.paymentStatus === 'held'
                                    ? 'bg-accent text-accent-foreground'
                                    : 'bg-secondary text-secondary-foreground'
                                }
                              >
                                {order.paymentStatus}
                              </Badge>
                              <Badge variant="outline">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">
                                ₹{parseFloat(order.totalAmount).toLocaleString()}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {order.status === 'paid' && (
                                <Button size="sm" data-testid={`mark-shipped-${order.id}`}>
                                  Mark as Shipped
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Products</CardTitle>
                  <Button className="flex items-center gap-2" data-testid="add-product">
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No products listed</h3>
                    <p className="text-muted-foreground mb-6">
                      Start selling by adding your first eco-friendly product
                    </p>
                    <Button data-testid="add-first-product">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeProducts.slice(0, 6).map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        data-testid={`seller-product-${product.id}`}
                      >
                        <Card className="overflow-hidden">
                          <div className="aspect-square">
                            <img
                              src={product.images?.[0] || '/placeholder-product.jpg'}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-sm">{product.name}</h3>
                              <Badge
                                variant={product.isActive ? 'default' : 'secondary'}
                                className="text-xs"
                              >
                                {product.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              ₹{parseFloat(product.price).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground mb-3">
                              Stock: {product.stockQuantity}
                            </p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-destructive">
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Payouts Tab */}
        <TabsContent value="payouts" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <PayoutCard seller={seller} />
            
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                {payouts.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No payouts yet</h3>
                    <p className="text-muted-foreground">
                      Payout requests will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payouts.slice(0, 10).map((payout, index) => (
                      <motion.div
                        key={payout.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                        data-testid={`payout-${payout.id}`}
                      >
                        <div>
                          <p className="font-medium">
                            ₹{parseFloat(payout.amount).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payout.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={payout.status === 'completed' ? 'default' : 'secondary'}
                          className={
                            payout.status === 'completed'
                              ? 'bg-primary text-primary-foreground'
                              : payout.status === 'processing'
                              ? 'bg-accent text-accent-foreground'
                              : payout.status === 'failed'
                              ? 'bg-destructive text-destructive-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }
                        >
                          {payout.status}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Revenue</span>
                      <span className="font-medium">₹{stats.totalSales.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Order Value</span>
                      <span className="font-medium">
                        ₹{orders.length ? (stats.totalSales / orders.length).toLocaleString() : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Conversion Rate</span>
                      <span className="font-medium">--</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Seller Rating</span>
                      <span className="font-medium">{stats.rating.toFixed(1)}/5.0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Reviews</span>
                      <span className="font-medium">{seller.reviewCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sustainability Score</span>
                      <span className="font-medium">{seller.sustainabilityScore}/100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Manage Inventory
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    Improve Rating
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
