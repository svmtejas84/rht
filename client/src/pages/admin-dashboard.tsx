import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, AlertTriangle, DollarSign, Users, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { adminApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import DisputeCard from "@/components/admin/dispute-card";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: () => adminApi.getStats(),
    enabled: !!user && user.role === "admin",
  });

  const { data: disputes = [] } = useQuery({
    queryKey: ["/api/admin/disputes"],
    queryFn: () => adminApi.getDisputes(),
    enabled: !!user && user.role === "admin",
  });

  const { data: heldOrders = [] } = useQuery({
    queryKey: ["/api/admin/held-orders"],
    queryFn: () => adminApi.getHeldOrders(),
    enabled: !!user && user.role === "admin",
  });

  const { data: sellerApplications = [] } = useQuery({
    queryKey: ["/api/admin/seller-applications"],
    queryFn: () => adminApi.getSellerApplications(),
    enabled: !!user && user.role === "admin",
  });

  const releaseFundsMutation = useMutation({
    mutationFn: adminApi.releaseFunds,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/held-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/disputes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Funds Released",
        description: "Funds have been successfully released to the seller.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Release Funds",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const processRefundMutation = useMutation({
    mutationFn: adminApi.processRefund,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/disputes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/held-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Refund Processed",
        description: "Refund has been successfully processed to the customer.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Process Refund",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access the admin dashboard.
          </p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            You need administrator privileges to access this dashboard.
          </p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20" data-testid="admin-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Platform management and oversight
            </p>
          </div>
          <div className="flex items-center gap-3">
            {disputes.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {disputes.length} Open Disputes
              </Badge>
            )}
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              <Shield className="w-3 h-3 mr-1" />
              Administrator
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {stats && (
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
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary" data-testid="total-revenue">
                    ₹{stats.totalRevenue.toLocaleString()}
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
                  <p className="text-sm text-muted-foreground">Funds Held</p>
                  <p className="text-2xl font-bold text-accent" data-testid="held-funds">
                    ₹{stats.heldFunds.toLocaleString()}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <p className="text-2xl font-bold text-secondary" data-testid="active-orders">
                    {stats.activeOrders}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Disputes</p>
                  <p className="text-2xl font-bold text-destructive" data-testid="dispute-count">
                    {stats.disputeCount}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="disputes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="disputes">Disputes</TabsTrigger>
          <TabsTrigger value="held-orders">Held Orders</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Disputes Tab */}
        <TabsContent value="disputes" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Open Disputes ({disputes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {disputes.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No open disputes</h3>
                    <p className="text-muted-foreground">
                      All disputes have been resolved. Great job!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {disputes.map((dispute, index) => (
                      <motion.div
                        key={dispute.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                      >
                        <DisputeCard
                          order={dispute}
                          onReleaseFunds={() => releaseFundsMutation.mutate(dispute.id)}
                          onProcessRefund={() => processRefundMutation.mutate(dispute.id)}
                          isLoading={releaseFundsMutation.isPending || processRefundMutation.isPending}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Held Orders Tab */}
        <TabsContent value="held-orders" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  Orders Requiring Action ({heldOrders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {heldOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders requiring action</h3>
                    <p className="text-muted-foreground">
                      All orders are processing normally
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {heldOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="border border-border rounded-lg p-4"
                        data-testid={`held-order-${order.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">Order #{order.id.slice(-8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.paymentStatus === "held" ? "Payment on hold" : "Seller KYC incomplete"}
                            </p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-accent/20 text-accent"
                          >
                            {order.paymentStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              ₹{parseFloat(order.totalAmount).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Customer: {order.buyer?.fullName}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => releaseFundsMutation.mutate(order.id)}
                              disabled={releaseFundsMutation.isPending}
                              data-testid={`release-funds-${order.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Release Funds
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`view-order-${order.id}`}
                            >
                              View Details
                            </Button>
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

        {/* Sellers Tab */}
        <TabsContent value="sellers" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  Seller Applications ({sellerApplications.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sellerApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No pending applications</h3>
                    <p className="text-muted-foreground">
                      All seller applications have been processed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sellerApplications.map((seller, index) => (
                      <motion.div
                        key={seller.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="border border-border rounded-lg p-4"
                        data-testid={`seller-application-${seller.id}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">{seller.businessName}</p>
                            <p className="text-sm text-muted-foreground">
                              Applied: {new Date(seller.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                            Pending Review
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Sustainability Score: {seller.sustainabilityScore}/100
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Tax ID: {seller.taxId || "Not provided"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-primary text-primary-foreground"
                              data-testid={`approve-seller-${seller.id}`}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              data-testid={`reject-seller-${seller.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Revenue</span>
                        <span className="font-medium">
                          ₹{stats.totalRevenue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Platform Fees</span>
                        <span className="font-medium">
                          ₹{stats.platformFee.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Funds Held</span>
                        <span className="font-medium text-accent">
                          ₹{stats.heldFunds.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Active Orders</span>
                        <span className="font-medium">{stats.activeOrders}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Active Sellers</span>
                        <span className="font-medium">{stats.activeSellers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Open Disputes</span>
                        <span className="font-medium text-destructive">
                          {stats.disputeCount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-muted-foreground">System monitoring active</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span className="text-muted-foreground">Platform operating normally</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-muted-foreground">All systems operational</span>
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
