import { X, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { items, totalAmount, updateItem, removeItem, isLoading } = useCart();
  const { user } = useAuth();

  const loyaltyPointsEarned = Math.floor(totalAmount * 0.05); // 5% of total as points

  if (!user) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>Shopping Cart</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <p className="text-muted-foreground">Please sign in to view your cart</p>
            <Link href="/auth">
              <Button onClick={onClose}>Sign In</Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-md flex flex-col" data-testid="cart-modal">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Shopping Cart
            <Badge variant="secondary" data-testid="cart-items-count">
              {items.length} items
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 space-y-4">
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button onClick={onClose} data-testid="continue-shopping">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-muted rounded-lg"
                    data-testid={`cart-item-${item.id}`}
                  >
                    <img
                      src={item.product.images?.[0] || "/placeholder-product.jpg"}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium" data-testid={`item-name-${item.id}`}>
                        {item.product.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {item.product.seller.businessName}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-semibold" data-testid={`item-price-${item.id}`}>
                          ₹{parseFloat(item.product.price).toLocaleString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="w-8 h-8"
                            onClick={() => updateItem(item.id, Math.max(0, item.quantity - 1))}
                            disabled={isLoading}
                            data-testid={`decrease-quantity-${item.id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center" data-testid={`item-quantity-${item.id}`}>
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
                        className="text-destructive hover:text-destructive mt-2"
                        onClick={() => removeItem(item.id)}
                        disabled={isLoading}
                        data-testid={`remove-item-${item.id}`}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span data-testid="cart-subtotal">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Loyalty Points Earned</span>
                  <span className="text-primary" data-testid="loyalty-points-earned">
                    +{loyaltyPointsEarned} points
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span data-testid="cart-total">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              <Link href="/checkout">
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
                  onClick={onClose}
                  disabled={isLoading}
                  data-testid="checkout-button"
                >
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
