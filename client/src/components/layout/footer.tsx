import { Link } from "wouter";
import { Leaf, Twitter, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white py-16" data-testid="footer">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-serif font-semibold">EcoMarket</span>
            </div>
            <p className="text-white/70 mb-6">
              Building a sustainable future through conscious commerce and environmental action.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-primary transition-colors duration-300"
                data-testid="social-twitter"
              >
                <Twitter className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-primary transition-colors duration-300"
                data-testid="social-instagram"
              >
                <Instagram className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white/70 hover:text-primary transition-colors duration-300"
                data-testid="social-facebook"
              >
                <Facebook className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Shop</h3>
            <ul className="space-y-3">
              {[
                { name: "All Products", href: "/products" },
                { name: "New Arrivals", href: "/products?sort=newest" },
                { name: "Best Sellers", href: "/products?sort=popular" },
                { name: "Sale", href: "/products?category=sale" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-white/70 hover:text-primary transition-colors duration-300"
                    data-testid={`footer-link-${item.name.toLowerCase().replace(" ", "-")}`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
              {[
                { name: "Help Center", href: "/help" },
                { name: "Shipping Info", href: "/shipping" },
                { name: "Returns", href: "/returns" },
                { name: "Contact Us", href: "/contact" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-white/70 hover:text-primary transition-colors duration-300"
                    data-testid={`footer-link-${item.name.toLowerCase().replace(" ", "-")}`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Newsletter</h3>
            <p className="text-white/70 mb-4">
              Stay updated on new sustainable products and environmental initiatives.
            </p>
            <div className="flex">
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-primary rounded-r-none"
                data-testid="newsletter-email"
              />
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300 rounded-l-none"
                data-testid="newsletter-subscribe"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 text-center">
          <p className="text-white/70">
            © 2024 EcoMarket. All rights reserved. Building a sustainable future together.
          </p>
        </div>
      </div>
    </footer>
  );
}
