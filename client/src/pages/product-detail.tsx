import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Star, Leaf, Recycle, Truck, Shield, ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { productApi } from "@/lib/api";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem, isLoading: cartLoading } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["/api/products", id],
    queryFn: () => productApi.getProduct(id!),
    enabled: !!id,
  });

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    if (!product) return;

    try {
      await addItem(product.id, quantity);
    } catch (error) {
      // Error handled by cart context
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-20" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder-product.jpg'];
  const price = parseFloat(product.price);
  const loyaltyPoints = Math.floor(price * 0.05);

  return (
    <div className="container mx-auto px-4 py-20" data-testid="product-detail">
      {/* Back Button */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Link href="/products">
          <Button variant="ghost" className="flex items-center gap-2" data-testid="back-to-products">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              data-testid="main-product-image"
            />
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-primary" : "border-transparent"
                  }`}
                  data-testid={`thumbnail-${index}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {product.sustainabilityFeatures?.map((feature, index) => (
              <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                {feature}
              </Badge>
            ))}
            {product.biodegradable && (
              <Badge variant="secondary" className="bg-secondary/10 text-secondary">
                Biodegradable
              </Badge>
            )}
          </div>

          {/* Title and Seller */}
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2" data-testid="product-name">
              {product.name}
            </h1>
            <p className="text-muted-foreground" data-testid="seller-name">
              by {product.seller.businessName}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(parseFloat(product.seller.rating))
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.seller.reviewCount} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-primary" data-testid="product-price">
            ₹{price.toLocaleString()}
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed" data-testid="product-description">
            {product.description}
          </p>

          {/* Environmental Info */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-primary" />
                Environmental Impact
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {product.carbonFootprint && (
                  <div>
                    <span className="text-muted-foreground">Carbon Footprint:</span>
                    <span className="font-medium ml-2">{product.carbonFootprint} kg CO₂</span>
                  </div>
                )}
                {product.recycledContent && (
                  <div>
                    <span className="text-muted-foreground">Recycled Content:</span>
                    <span className="font-medium ml-2">{product.recycledContent}%</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Loyalty Points:</span>
                  <span className="font-medium ml-2 text-primary">+{loyaltyPoints} points</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  data-testid="decrease-quantity"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center font-medium" data-testid="quantity-display">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stockQuantity}
                  data-testid="increase-quantity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.stockQuantity} in stock)
              </span>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={cartLoading || !user}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
              data-testid="add-to-cart"
            >
              {cartLoading ? "Adding..." : user ? "Add to Cart" : "Sign in to Purchase"}
            </Button>

            {!user && (
              <p className="text-sm text-muted-foreground text-center">
                <Link href="/auth" className="text-primary hover:underline">
                  Sign in
                </Link>{" "}
                to add items to cart and earn loyalty points
              </p>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-4 h-4 text-primary" />
              <span>Free shipping over ₹1,000</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-primary" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Recycle className="w-4 h-4 text-primary" />
              <span>Sustainable packaging</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Leaf className="w-4 h-4 text-primary" />
              <span>Carbon neutral delivery</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Additional Information Tabs */}
      <motion.div
        className="mt-16"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
            <TabsTrigger value="seller">Seller Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Product Details</h3>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Category:</span>
                    <span className="ml-2 text-muted-foreground">{product.category}</span>
                  </div>
                  {product.tags && product.tags.length > 0 && (
                    <div>
                      <span className="font-medium">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sustainability" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Sustainability Information</h3>
                <div className="space-y-4">
                  {product.sustainabilityFeatures && (
                    <div>
                      <span className="font-medium">Eco-Friendly Features:</span>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {product.sustainabilityFeatures.map((feature, index) => (
                          <li key={index} className="text-muted-foreground">
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {product.carbonFootprint && (
                    <div>
                      <span className="font-medium">Carbon Footprint:</span>
                      <span className="ml-2 text-muted-foreground">
                        {product.carbonFootprint} kg CO₂ equivalent
                      </span>
                    </div>
                  )}
                  {product.recycledContent && (
                    <div>
                      <span className="font-medium">Recycled Content:</span>
                      <span className="ml-2 text-muted-foreground">
                        {product.recycledContent}% recycled materials
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Biodegradable:</span>
                    <span className="ml-2 text-muted-foreground">
                      {product.biodegradable ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="seller" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Seller Information</h3>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">Business Name:</span>
                    <span className="ml-2 text-muted-foreground">
                      {product.seller.businessName}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Sustainability Score:</span>
                    <span className="ml-2 text-muted-foreground">
                      {product.seller.sustainabilityScore}/100
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Rating:</span>
                    <span className="ml-2 text-muted-foreground">
                      {product.seller.rating}/5.0 ({product.seller.reviewCount} reviews)
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">KYC Status:</span>
                    <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary">
                      Verified
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
