import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { CreditCard, MapPin, Leaf, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { orderApi } from "@/lib/api";
import { motion } from "framer-motion";

const checkoutSchema = z.object({
  shippingAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    pincode: z.string().min(6, "Valid pincode required"),
    country: z.string().default("India"),
  }),
  paymentMethod: z.enum(["card", "upi", "wallet"]),
  loyaltyPointsToUse: z.number().min(0).default(0),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      loyaltyPointsToUse: 0,
      paymentMethod: "card",
      shippingAddress: {
        country: "India",
      },
    },
  });

  const loyaltyPointsToUse = watch("loyaltyPointsToUse");
  const maxLoyaltyPoints = Math.min(user?.loyaltyPoints || 0, Math.floor(totalAmount));
  const loyaltyDiscount = Math.min(loyaltyPointsToUse, maxLoyaltyPoints);
  const platformFee = totalAmount * 0.05;
  const finalTotal = Math.max(0, totalAmount + platformFee - loyaltyDiscount);
  const loyaltyPointsEarned = Math.floor(finalTotal * 0.05);

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      setIsProcessing(true);
      return orderApi.createOrder(orderData);
    },
    onSuccess: async (response) => {
      await clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Thank you for your sustainable purchase. You'll receive a confirmation email shortly.",
      });
      setLocation(`/dashboard?order=${response.order.id}`);
    },
    onError: (error) => {
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (!user || items.length === 0) return;

    // Group items by seller
    const sellerOrders = new Map();
    items.forEach(item => {
      const sellerId = item.product.sellerId;
      if (!sellerOrders.has(sellerId)) {
        sellerOrders.set(sellerId, []);
      }
      sellerOrders.get(sellerId).push(item);
    });

    // Create orders for each seller
    for (const [sellerId, sellerItems] of sellerOrders) {
      const sellerTotal = sellerItems.reduce(
        (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
        0
      );
      const sellerPlatformFee = sellerTotal * 0.05;
      const sellerLoyaltyDiscount = loyaltyPointsToUse * (sellerTotal / totalAmount);
      const sellerFinalTotal = Math.max(0, sellerTotal + sellerPlatformFee - sellerLoyaltyDiscount);

      const orderData = {
        buyerId: user.id,
        sellerId,
        status: "pending",
        paymentStatus: "pending",
        totalAmount: sellerFinalTotal.toString(),
        platformFee: sellerPlatformFee.toString(),
        loyaltyPointsEarned: Math.floor(sellerFinalTotal * 0.05),
        loyaltyPointsUsed: Math.floor(sellerLoyaltyDiscount),
        shippingAddress: data.shippingAddress,
      };

      await createOrderMutation.mutateAsync(orderData);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign in required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to continue with checkout.
          </p>
          <Button onClick={() => setLocation("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some products to your cart before checkout.
          </p>
          <Button onClick={() => setLocation("/products")}>Browse Products</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20" data-testid="checkout-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Button
          variant="ghost"
          onClick={() => setLocation("/cart")}
          className="mb-8"
          data-testid="back-to-cart"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Button>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-8">Checkout</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Textarea
                        id="street"
                        {...register("shippingAddress.street")}
                        placeholder="Enter your complete address"
                        className="min-h-[60px]"
                        data-testid="shipping-street"
                      />
                      {errors.shippingAddress?.street && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.shippingAddress.street.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...register("shippingAddress.city")}
                        data-testid="shipping-city"
                      />
                      {errors.shippingAddress?.city && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.shippingAddress.city.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        {...register("shippingAddress.state")}
                        data-testid="shipping-state"
                      />
                      {errors.shippingAddress?.state && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.shippingAddress.state.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        {...register("shippingAddress.pincode")}
                        data-testid="shipping-pincode"
                      />
                      {errors.shippingAddress?.pincode && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.shippingAddress.pincode.message}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        {...register("shippingAddress.country")}
                        readOnly
                        data-testid="shipping-country"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { value: "card", label: "Credit/Debit Card", description: "Secure payment via card" },
                      { value: "upi", label: "UPI", description: "Quick UPI payments" },
                      { value: "wallet", label: "Wallet", description: "Pay using digital wallet" },
                    ].map((method) => (
                      <div key={method.value} className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id={method.value}
                          value={method.value}
                          {...register("paymentMethod")}
                          className="w-4 h-4 text-primary"
                          data-testid={`payment-${method.value}`}
                        />
                        <label htmlFor={method.value} className="flex-1 cursor-pointer">
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Loyalty Points */}
            {user.loyaltyPoints > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-primary" />
                      Use Loyalty Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        You have <span className="font-medium text-primary">{user.loyaltyPoints}</span> loyalty points
                        (₹{user.loyaltyPoints} value)
                      </p>
                      <div>
                        <Label htmlFor="loyaltyPoints">Points to use (max: {maxLoyaltyPoints})</Label>
                        <Input
                          id="loyaltyPoints"
                          type="number"
                          min="0"
                          max={maxLoyaltyPoints}
                          {...register("loyaltyPointsToUse", { valueAsNumber: true })}
                          data-testid="loyalty-points-input"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </form>
        </div>

        {/* Order Summary */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.product.images?.[0] || "/placeholder-product.jpg"}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-sm">
                      ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span data-testid="checkout-subtotal">₹{totalAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span data-testid="checkout-platform-fee">₹{platformFee.toLocaleString()}</span>
                </div>
                
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Loyalty Points Discount</span>
                    <span data-testid="loyalty-discount">-₹{loyaltyDiscount}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="checkout-total">₹{finalTotal.toLocaleString()}</span>
                </div>

                <div className="text-sm text-primary">
                  You'll earn {loyaltyPointsEarned} loyalty points
                </div>
              </div>

              {/* Environmental Impact */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary text-sm">Environmental Impact</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p>Trees to be planted: <span className="font-medium">{Math.floor(loyaltyPointsEarned / 100)}</span></p>
                    <p>Carbon offset: <span className="font-medium">{(finalTotal * 0.001).toFixed(2)} kg CO₂</span></p>
                  </div>
                </CardContent>
              </Card>

              {/* Place Order Button */}
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isProcessing}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                size="lg"
                data-testid="place-order-button"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Place Order
                  </div>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By placing this order, you agree to our terms of service and privacy policy.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
