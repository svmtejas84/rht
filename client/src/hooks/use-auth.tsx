import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, userApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { username: string; email: string; password: string; fullName: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for stored user session on app start
    const storedUser = localStorage.getItem("ecomarket_user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem("ecomarket_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.login({ email, password });
      if (response.user) {
        setUser(response.user);
        localStorage.setItem("ecomarket_user", JSON.stringify(response.user));
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { username: string; email: string; password: string; fullName: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);
      if (response.user) {
        setUser(response.user);
        localStorage.setItem("ecomarket_user", JSON.stringify(response.user));
        toast({
          title: "Welcome to EcoMarket!",
          description: "Your account has been created successfully.",
        });
        return true;
      }
      return false;
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ecomarket_user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const updateUser = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;
    
    try {
      const response = await userApi.updateUser(user.id, updates);
      if (response) {
        const updatedUser = { ...user, ...response };
        setUser(updatedUser);
        localStorage.setItem("ecomarket_user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update user information",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
