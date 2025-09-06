import { Link } from "wouter";
import { ShoppingCart, Plus, Minus, Trash2, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function Cart() {
  const { items, totalAmount, updateItem, removeItem, clearCart, isLoading } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <ShoppingCart className="mx-auto w-16 h-16 text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold text-foreground mb-4">Sign in to view your cart</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your shopping cart and continue shopping.
          </p>
          <Link href="/auth">
            <Button data-testid="signin-to-cart">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20" data-testid="empty-cart">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <ShoppingCart className="mx-auto w-16 h-16 text-muted-foreground mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              Discover our sustainable products and start building a better future.
            </p>
            <Link href="/products">
              <Button data-testid="browse-products">Browse Products</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  const loyaltyPointsEarned = Math.floor(totalAmount * 0.05);
  const platformFee = totalAmount * 0.05;
  const finalTotal = totalAmount + platformFee;

  return (
    <div className="container mx-auto px-4 py-20" data-testid="cart-page">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground">Shopping Cart</h1>
          <Badge variant="secondary" data-testid="cart-items-count">
            {items.length} items
          </Badge>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Items in your cart</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                disabled={isLoading}
                data-testid="clear-cart"
              >
                Clear Cart
              </Button>
            </div>
          </motion.div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card data-testid={`cart-item-${item.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.images?.[0] || "/placeholder-product.jpg"}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold" data-testid={`item-name-${item.id}`}>
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              by {item.product.seller.businessName}
                            </p>
                            
                            {/* Sustainability badges */}
                            <div className="flex flex-wrap gap-1 mb-2">
                              {item.product.sustainabilityFeatures?.slice(0, 2).map((feature, featureIndex) => (
                                <Badge key={featureIndex} variant="secondary" className="text-xs bg-primary/10 text-primary">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-semibold text-lg" data-testid={`item-price-${item.id}`}>
                              ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ₹{parseFloat(item.product.price).toLocaleString()} each
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium">Quantity:</span>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8"
                                onClick={() => updateItem(item.id, Math.max(0, item.quantity - 1))}
                                disabled={isLoading || item.quantity <= 1}
                                data-testid={`decrease-quantity-${item.id}`}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-8 text-center font-medium" data-testid={`item-quantity-${item.id}`}>
                                {item.quantity}
                              </span>
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8"
                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                disabled={isLoading}
                                data-testid={`increase-quantity-${item.id}`}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={isLoading}
                            className="text-destructive hover:text-destructive"
                            data-testid={`remove-item-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                        
                        {/* Environmental impact */}
                        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                          <Leaf className="w-4 h-4 text-primary" />
                          <span>
                            +{Math.floor(parseFloat(item.product.price) * item.quantity * 0.05)} loyalty points
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span data-testid="cart-subtotal">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span data-testid="platform-fee">
                    ₹{platformFee.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-primary">Loyalty Points Earned</span>
                  <span className="text-primary font-medium" data-testid="loyalty-points-earned">
                    +{loyaltyPointsEarned} points
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="cart-total">
                    ₹{finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <Link href="/checkout">
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                    size="lg"
                    disabled={isLoading}
                    data-testid="checkout-button"
                  >
                    Proceed to Checkout
                  </Button>
                </Link>
                
                <Link href="/products">
                  <Button
                    variant="outline"
                    className="w-full"
                    data-testid="continue-shopping"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </div>
              
              {/* Environmental Impact Summary */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-primary">Environmental Impact</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>Your purchase will help plant <span className="font-medium">{Math.floor(loyaltyPointsEarned / 100)}</span> trees</p>
                    <p>Estimated carbon offset: <span className="font-medium">{(finalTotal * 0.001).toFixed(2)} kg CO₂</span></p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
