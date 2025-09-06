import { Link } from "wouter";
import { Star, Leaf, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithSeller } from "@shared/schema";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: ProductWithSeller;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, isLoading } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    try {
      await addItem(product.id, 1);
    } catch (error) {
      // Error handled by cart context
    }
  };

  const price = parseFloat(product.price);
  const loyaltyPoints = Math.floor(price * 0.05);
  const rating = parseFloat(product.seller.rating);

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className="group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
          data-testid={`product-card-${product.id}`}
        >
          {/* Product Image */}
          <div className="aspect-square overflow-hidden relative">
            <img
              src={product.images?.[0] || '/placeholder-product.jpg'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            
            {/* Sustainability Badge */}
            {product.biodegradable && (
              <Badge
                variant="secondary"
                className="absolute top-3 left-3 bg-primary/90 text-primary-foreground"
              >
                <Leaf className="w-3 h-3 mr-1" />
                Eco-Friendly
              </Badge>
            )}

            {/* Quick Add to Cart */}
            <Button
              size="icon"
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-foreground hover:bg-white"
              onClick={handleAddToCart}
              disabled={isLoading}
              data-testid={`quick-add-cart-${product.id}`}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>

          <CardContent className="p-6">
            {/* Sustainability Features */}
            <div className="flex items-center gap-2 mb-2">
              {product.sustainabilityFeatures?.slice(0, 1).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-accent/20 text-accent">
                  {feature}
                </Badge>
              ))}
              
              {/* Rating */}
              <div className="flex items-center gap-1 ml-auto">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Product Name */}
            <h3
              className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors"
              data-testid={`product-name-${product.id}`}
            >
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {product.description}
            </p>

            {/* Seller */}
            <p className="text-xs text-muted-foreground mb-3">
              by {product.seller.businessName}
            </p>

            {/* Price and Action */}
            <div className="flex items-center justify-between">
              <div>
                <span
                  className="text-2xl font-bold text-primary"
                  data-testid={`product-price-${product.id}`}
                >
                  ₹{price.toLocaleString()}
                </span>
                <div className="text-xs text-muted-foreground">
                  +{loyaltyPoints} points
                </div>
              </div>
              
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                onClick={handleAddToCart}
                disabled={isLoading}
                data-testid={`add-cart-${product.id}`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Add to Cart"
                )}
              </Button>
            </div>

            {/* Environmental Impact */}
            {product.carbonFootprint && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <Leaf className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Carbon footprint: {product.carbonFootprint} kg CO₂
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
