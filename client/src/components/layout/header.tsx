import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, User, Menu, X, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import CartModal from "@/components/cart/cart-modal";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Header() {
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Impact", href: "/#impact" },
    { name: "Sell", href: user?.role === "seller" ? "/seller" : "/seller-apply" },
  ];

  const userNavigation = [
    { name: "Dashboard", href: "/dashboard" },
    ...(user?.role === "seller" ? [{ name: "Seller Portal", href: "/seller" }] : []),
    ...(user?.role === "admin" ? [{ name: "Admin Panel", href: "/admin" }] : []),
  ];

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`${
            mobile ? "block px-3 py-2 text-base" : "text-sm"
          } font-medium text-foreground hover:text-primary transition-colors duration-300 ${
            location === item.href ? "text-primary" : ""
          }`}
          data-testid={`nav-link-${item.name.toLowerCase()}`}
        >
          {item.name}
        </Link>
      ))}
    </>
  );

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "glassmorphism shadow-lg" : "bg-transparent"
        }`}
        data-testid="header"
      >
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2" data-testid="logo">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-serif font-semibold text-foreground">
                EcoMarket
              </span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="hidden md:flex items-center space-x-8">
                <NavItems />
              </div>
            )}

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setShowCartModal(true)}
                data-testid="cart-button"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <Badge
                    variant="default"
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
                    data-testid="cart-count"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              {user ? (
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    data-testid="user-menu-button"
                  >
                    <User className="w-6 h-6" />
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="py-1">
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          data-testid={`user-nav-${item.name.toLowerCase().replace(" ", "-")}`}
                        >
                          {item.name}
                        </Link>
                      ))}
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                        data-testid="logout-button"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/auth">
                  <Button
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                    data-testid="signin-button"
                  >
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile Menu */}
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="mobile-menu-button">
                      <Menu className="w-6 h-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <div className="flex flex-col space-y-4 mt-8">
                      <NavItems mobile />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Cart Modal */}
      <CartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
      />
    </>
  );
}
