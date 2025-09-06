import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, TreePine, Zap, Droplets } from "lucide-react";
import { productApi, environmentalApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import ProductCard from "@/components/product/product-card";
import LoyaltyCard from "@/components/dashboard/loyalty-card";
import ImpactMetrics from "@/components/dashboard/impact-metrics";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Home() {
  const { user } = useAuth();
  const [heroMetrics, setHeroMetrics] = useState({ trees: 2847, carbon: 156 });
  const heroRef = useRef(null);
  const productsRef = useRef(null);
  const impactRef = useRef(null);
  const isHeroInView = useInView(heroRef);
  const isProductsInView = useInView(productsRef);
  const isImpactInView = useInView(impactRef);

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["/api/products", { featured: true }],
    queryFn: () => productApi.getProducts({ category: "featured" }),
  });

  const { data: environmentalImpact } = useQuery({
    queryKey: ["/api/environmental/impact"],
    queryFn: () => environmentalApi.getTotalImpact(),
  });

  useEffect(() => {
    if (environmentalImpact) {
      setHeroMetrics({
        trees: environmentalImpact.treesPlanted || 2847,
        carbon: environmentalImpact.carbonOffset || 156,
      });
    }
  }, [environmentalImpact]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        data-testid="hero-section"
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-transparent"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-serif font-bold text-white mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Shop for a{" "}
              <span className="text-accent">Sustainable</span>{" "}
              Future
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Discover eco-friendly products while earning loyalty points that plant trees and offset carbon footprints
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                  data-testid="explore-products-button"
                >
                  Explore Products
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 text-white border-white/20 glassmorphism hover:bg-white/20 transition-all duration-300"
                data-testid="learn-more-button"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Metrics */}
        <motion.div
          className="absolute bottom-20 left-10 bg-white/20 glassmorphism rounded-xl p-6 text-white animate-float hidden md:block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="text-3xl font-bold" data-testid="hero-trees-planted">
            {heroMetrics.trees.toLocaleString()}
          </div>
          <div className="text-sm opacity-90">Trees Planted</div>
        </motion.div>

        <motion.div
          className="absolute bottom-32 right-10 bg-white/20 glassmorphism rounded-xl p-6 text-white animate-float hidden md:block"
          style={{ animationDelay: "2s" }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <div className="text-3xl font-bold" data-testid="hero-carbon-offset">
            {heroMetrics.carbon}t
          </div>
          <div className="text-sm opacity-90">CO₂ Offset</div>
        </motion.div>
      </section>

      {/* Products Section */}
      <section ref={productsRef} className="py-20 bg-background" data-testid="products-section">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isProductsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Sustainable Products
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Curated eco-friendly products from verified sustainable sellers
            </p>
          </motion.div>

          {/* Filter Buttons */}
          <motion.div
            className="flex flex-wrap gap-4 mb-12 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={isProductsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[
              { label: "All Products", value: "all", active: true },
              { label: "Home & Garden", value: "home" },
              { label: "Clothing", value: "clothing" },
              { label: "Electronics", value: "electronics" },
              { label: "Beauty", value: "beauty" },
            ].map((filter, index) => (
              <Button
                key={filter.value}
                variant={filter.active ? "default" : "outline"}
                className={`px-6 py-3 font-medium transition-all duration-300 ${
                  filter.active
                    ? "bg-primary text-primary-foreground hover:scale-105"
                    : "hover:bg-primary hover:text-primary-foreground hover:scale-105"
                }`}
                data-testid={`filter-${filter.value}`}
              >
                {filter.label}
              </Button>
            ))}
          </motion.div>

          {/* Products Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            animate={isProductsInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {featuredProducts.slice(0, 8).map((product: any, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isProductsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={isProductsInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Link href="/products">
              <Button
                variant="secondary"
                size="lg"
                className="hover:scale-105 transition-all duration-300"
                data-testid="view-all-products"
              >
                View All Products
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Loyalty Section */}
      {user && (
        <section className="py-20 gradient-mesh" data-testid="loyalty-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
                Your Impact & Rewards
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Track your environmental contribution and loyalty rewards
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <LoyaltyCard user={user} />
            </div>
          </div>
        </section>
      )}

      {/* Environmental Impact Section */}
      <section ref={impactRef} className="py-20 bg-background" data-testid="impact-section">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isImpactInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Environmental Impact
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Together, we're making a measurable difference for our planet
            </p>
          </motion.div>

          <ImpactMetrics />
        </div>
      </section>

      {/* Seller CTA Section */}
      <section className="py-20 gradient-mesh" data-testid="seller-cta-section">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
              Become a Seller
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Join our community of sustainable entrepreneurs and reach eco-conscious customers
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  step: "1",
                  title: "Apply & Verify",
                  description: "Complete KYC verification and sustainability assessment",
                },
                {
                  step: "2", 
                  title: "List Products",
                  description: "Upload your eco-friendly products with detailed information",
                },
                {
                  step: "3",
                  title: "Start Selling",
                  description: "Receive secure payments through our escrow system",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  className="bg-card p-6 rounded-xl shadow-lg"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  viewport={{ once: true }}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <Link href="/seller-apply">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300"
                data-testid="start-selling-button"
              >
                Start Selling Today
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
