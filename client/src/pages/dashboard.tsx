import { useQuery } from "@tanstack/react-query";
import { Package, Leaf, Star, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { orderApi, loyaltyApi, environmentalApi } from "@/lib/api";
import LoyaltyCard from "@/components/dashboard/loyalty-card";
import ImpactMetrics from "@/components/dashboard/impact-metrics";
import OrderTimeline from "@/components/dashboard/order-timeline";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders", user?.id],
    queryFn: () => orderApi.getOrders({ buyerId: user?.id }),
    enabled: !!user,
  });

  const { data: loyaltyTransactions = [] } = useQuery({
    queryKey: ["/api/loyalty", user?.id],
    queryFn: () => loyaltyApi.getTransactions(user?.id!),
    enabled: !!user,
  });

  const { data: environmentalActions = [] } = useQuery({
    queryKey: ["/api/environmental", user?.id],
    queryFn: () => environmentalApi.getUserActions(user?.id!),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your dashboard.
          </p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);
  const currentYearActions = environmentalActions.filter(
    action => new Date(action.createdAt).getFullYear() === new Date().getFullYear()
  );

  const stats = {
    totalOrders: orders.length,
    activeOrders: orders.filter(order => ['pending', 'paid', 'shipped'].includes(order.status)).length,
    completedOrders: orders.filter(order => order.status === 'delivered').length,
    totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0),
    treesPlanted: currentYearActions
      .filter(action => action.actionType === 'tree_planted')
      .reduce((sum, action) => sum + parseFloat(action.quantity), 0),
    carbonOffset: currentYearActions
      .filter(action => action.actionType === 'carbon_offset')
      .reduce((sum, action) => sum + parseFloat(action.quantity), 0),
  };

  return (
    <div className="container mx-auto px-4 py-20" data-testid="dashboard">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Welcome back, {user.fullName}
            </h1>
            <p className="text-muted-foreground">
              Track your orders, loyalty points, and environmental impact
            </p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {user.loyaltyTier} Member
          </Badge>
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
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-foreground" data-testid="total-orders">
                  {stats.totalOrders}
                </p>
              </div>
              <Package className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Loyalty Points</p>
                <p className="text-2xl font-bold text-primary" data-testid="loyalty-points">
                  {user.loyaltyPoints.toLocaleString()}
                </p>
              </div>
              <Star className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trees Planted</p>
                <p className="text-2xl font-bold text-secondary" data-testid="trees-planted">
                  {stats.treesPlanted}
                </p>
              </div>
              <Leaf className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold text-foreground" data-testid="total-spent">
                  ₹{stats.totalSpent.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
          <TabsTrigger value="impact">Impact</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
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
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Start shopping to see your orders here
                    </p>
                    <Link href="/products">
                      <Button>Browse Products</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        data-testid={`order-${order.id}`}
                      >
                        <div className="border border-border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium">Order #{order.id.slice(-8)}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge
                              variant={order.status === 'delivered' ? 'default' : 'secondary'}
                              className={
                                order.status === 'delivered'
                                  ? 'bg-primary text-primary-foreground'
                                  : order.status === 'shipped'
                                  ? 'bg-accent text-accent-foreground'
                                  : 'bg-secondary text-secondary-foreground'
                              }
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                {order.items?.length} items • ₹{parseFloat(order.totalAmount).toLocaleString()}
                              </p>
                              <p className="text-sm text-primary">
                                +{order.loyaltyPointsEarned} loyalty points earned
                              </p>
                            </div>
                            <OrderTimeline status={order.status} />
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

        {/* Loyalty Tab */}
        <TabsContent value="loyalty" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LoyaltyCard user={user} />
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {loyaltyTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No loyalty transactions yet</h3>
                    <p className="text-muted-foreground">
                      Start shopping to earn loyalty points
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {loyaltyTransactions.slice(0, 10).map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                        data-testid={`loyalty-transaction-${transaction.id}`}
                      >
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`text-sm font-medium ${
                          transaction.points > 0 ? 'text-primary' : 'text-destructive'
                        }`}>
                          {transaction.points > 0 ? '+' : ''}{transaction.points} points
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Impact Tab */}
        <TabsContent value="impact" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-primary" />
                  Your Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-6 bg-primary/5 rounded-lg">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {user.treesPlanted}
                    </div>
                    <div className="text-sm text-muted-foreground">Trees Planted</div>
                    <div className="text-xs text-primary mt-1">This year: {stats.treesPlanted}</div>
                  </div>
                  <div className="text-center p-6 bg-accent/5 rounded-lg">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {parseFloat(user.carbonOffset).toFixed(1)}t
                    </div>
                    <div className="text-sm text-muted-foreground">CO₂ Offset</div>
                    <div className="text-xs text-accent mt-1">This year: {stats.carbonOffset.toFixed(1)}t</div>
                  </div>
                </div>

                {environmentalActions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Recent Environmental Actions</h4>
                    {environmentalActions.slice(0, 5).map((action, index) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {action.actionType === 'tree_planted' ? '🌳 Tree Planted' : 
                             action.actionType === 'carbon_offset' ? '🌍 Carbon Offset' : 
                             action.actionType}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(action.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {action.quantity} {action.actionType === 'tree_planted' ? 'trees' : 'kg CO₂'}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <ImpactMetrics showUserStats={false} />
          </motion.div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Full Name</Label>
                    <p className="text-foreground">{user.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Username</Label>
                    <p className="text-foreground">{user.username}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Member Since</Label>
                    <p className="text-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Loyalty Tier</Label>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {user.loyaltyTier}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Account Type</Label>
                    <p className="text-foreground capitalize">{user.role}</p>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h4 className="font-semibold mb-4">Quick Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="justify-start">
                      Update Profile
                    </Button>
                    <Button variant="outline" className="justify-start">
                      Change Password
                    </Button>
                    <Button variant="outline" className="justify-start">
                      Privacy Settings
                    </Button>
                    {user.role === 'buyer' && (
                      <Link href="/seller-apply">
                        <Button variant="outline" className="w-full justify-start">
                          Become a Seller
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
