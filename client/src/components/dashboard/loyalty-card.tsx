import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Leaf, Gift, TreePine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loyaltyApi, environmentalApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import { motion } from "framer-motion";

interface LoyaltyCardProps {
  user: User;
}

const tierInfo = {
  bronze: { min: 0, max: 1000, color: "#CD7F32", next: "silver", rate: "2%" },
  silver: { min: 1000, max: 5000, color: "#C0C0C0", next: "gold", rate: "3%" },
  gold: { min: 5000, max: 15000, color: "#FFD700", next: "platinum", rate: "5%" },
  platinum: { min: 15000, max: Infinity, color: "#E5E4E2", next: null, rate: "7%" },
};

export default function LoyaltyCard({ user }: LoyaltyCardProps) {
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [showPlantDialog, setShowPlantDialog] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");
  const [plantPoints, setPlantPoints] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentTier = tierInfo[user.loyaltyTier as keyof typeof tierInfo];
  const totalSpent = parseFloat(user.totalSpent);
  const progressPercentage = currentTier.next 
    ? ((totalSpent - currentTier.min) / (currentTier.max - currentTier.min)) * 100
    : 100;

  const redeemPointsMutation = useMutation({
    mutationFn: ({ points, description }: { points: number; description: string }) =>
      loyaltyApi.redeemPoints(user.id, points, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty", user.id] });
      setShowRedeemDialog(false);
      setRedeemAmount("");
      toast({
        title: "Points Redeemed",
        description: "Your loyalty points have been successfully redeemed!",
      });
    },
    onError: (error) => {
      toast({
        title: "Redemption Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const plantTreesMutation = useMutation({
    mutationFn: (points: number) => environmentalApi.plantTrees(user.id, points),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/loyalty", user.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/environmental", user.id] });
      setShowPlantDialog(false);
      setPlantPoints("");
      toast({
        title: "Trees Planted! 🌳",
        description: `You've planted ${data.treesPlanted} trees! Thank you for helping the environment.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Tree Planting Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleRedeemPoints = () => {
    const points = parseInt(redeemAmount);
    if (points <= 0 || points > user.loyaltyPoints) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount within your available points",
        variant: "destructive",
      });
      return;
    }

    redeemPointsMutation.mutate({
      points,
      description: `Redeemed ${points} points for ₹${points} discount`,
    });
  };

  const handlePlantTrees = () => {
    const points = parseInt(plantPoints);
    if (points <= 0 || points > user.loyaltyPoints || points < 100) {
      toast({
        title: "Invalid Amount",
        description: "Minimum 100 points required to plant trees",
        variant: "destructive",
      });
      return;
    }

    plantTreesMutation.mutate(points);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="glassmorphism overflow-hidden" data-testid="loyalty-card">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Loyalty & Impact
            </CardTitle>
            <Badge 
              variant="secondary" 
              className="capitalize"
              style={{ backgroundColor: `${currentTier.color}20`, color: currentTier.color }}
            >
              {user.loyaltyTier} Member
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-8">
          {/* Points Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-4xl font-bold text-primary mb-2" data-testid="available-points">
                {user.loyaltyPoints.toLocaleString()}
              </div>
              <div className="text-muted-foreground">Available Points</div>
              <div className="text-sm text-accent mt-1">= ₹{user.loyaltyPoints.toLocaleString()} value</div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="text-4xl font-bold text-secondary mb-2" data-testid="current-tier">
                {user.loyaltyTier}
              </div>
              <div className="text-muted-foreground">Current Tier</div>
              <div className="text-sm text-accent mt-1">{currentTier.rate} earn rate</div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="text-4xl font-bold text-accent mb-2" data-testid="trees-planted">
                {user.treesPlanted}
              </div>
              <div className="text-muted-foreground">Trees Planted</div>
              <div className="text-sm text-secondary mt-1">This year</div>
            </motion.div>
          </div>

          {/* Tier Progress */}
          {currentTier.next && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Progress to {currentTier.next}</span>
                <span className="text-muted-foreground">
                  ₹{totalSpent.toLocaleString()} / ₹{currentTier.max.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="w-full h-3 mb-2"
                data-testid="tier-progress"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="capitalize">{user.loyaltyTier}</span>
                <span className="capitalize">{currentTier.next}</span>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
          >
            <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary text-primary-foreground p-6 rounded-xl hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                  data-testid="redeem-points-button"
                >
                  <div className="text-center">
                    <Gift className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-lg font-semibold mb-1">Redeem for Discount</div>
                    <div className="text-sm opacity-90">Use points to save on orders</div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Redeem Loyalty Points</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="redeem-amount">Points to redeem (1 point = ₹1)</Label>
                    <Input
                      id="redeem-amount"
                      type="number"
                      placeholder="Enter points"
                      value={redeemAmount}
                      onChange={(e) => setRedeemAmount(e.target.value)}
                      max={user.loyaltyPoints}
                      data-testid="redeem-points-input"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Available: {user.loyaltyPoints.toLocaleString()} points
                  </p>
                  <Button 
                    onClick={handleRedeemPoints} 
                    disabled={redeemPointsMutation.isPending}
                    className="w-full"
                    data-testid="confirm-redeem"
                  >
                    {redeemPointsMutation.isPending ? "Redeeming..." : "Redeem Points"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showPlantDialog} onOpenChange={setShowPlantDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="secondary"
                  className="bg-secondary text-secondary-foreground p-6 rounded-xl hover:bg-secondary/90 transition-all duration-300 transform hover:scale-105"
                  data-testid="plant-trees-button"
                >
                  <div className="text-center">
                    <TreePine className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-lg font-semibold mb-1">Plant Trees</div>
                    <div className="text-sm opacity-90">Donate points to environment</div>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Plant Trees with Points</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="plant-points">Points to donate (100 points = 1 tree)</Label>
                    <Input
                      id="plant-points"
                      type="number"
                      placeholder="Enter points (minimum 100)"
                      value={plantPoints}
                      onChange={(e) => setPlantPoints(e.target.value)}
                      min={100}
                      step={100}
                      max={user.loyaltyPoints}
                      data-testid="plant-trees-input"
                    />
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Available: {user.loyaltyPoints.toLocaleString()} points</p>
                    <p>Trees to plant: {plantPoints ? Math.floor(parseInt(plantPoints) / 100) : 0}</p>
                  </div>
                  <Button 
                    onClick={handlePlantTrees} 
                    disabled={plantTreesMutation.isPending}
                    className="w-full"
                    data-testid="confirm-plant-trees"
                  >
                    {plantTreesMutation.isPending ? "Planting..." : "Plant Trees"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
