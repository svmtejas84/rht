import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, CreditCard, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { payoutApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Seller } from "@shared/schema";
import { motion } from "framer-motion";

interface PayoutCardProps {
  seller: Seller;
}

export default function PayoutCard({ seller }: PayoutCardProps) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pendingBalance = parseFloat(seller.pendingBalance);
  const availableBalance = parseFloat(seller.availableBalance);
  const maxRequestAmount = Math.floor(availableBalance);

  const requestPayoutMutation = useMutation({
    mutationFn: (amount: number) => payoutApi.requestPayout(seller.id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sellers", seller.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/payouts", seller.id] });
      setShowRequestDialog(false);
      setRequestAmount("");
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted successfully. Funds will be transferred within 2-3 business days.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payout Request Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleRequestPayout = () => {
    const amount = parseFloat(requestAmount);
    if (amount <= 0 || amount > maxRequestAmount) {
      toast({
        title: "Invalid Amount",
        description: `Please enter a valid amount between ₹1 and ₹${maxRequestAmount.toLocaleString()}`,
        variant: "destructive",
      });
      return;
    }

    if (amount < 100) {
      toast({
        title: "Minimum Amount Required",
        description: "Minimum payout amount is ₹100",
        variant: "destructive",
      });
      return;
    }

    requestPayoutMutation.mutate(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card data-testid="payout-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Payout Information
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Balance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              className="text-center p-6 bg-accent/5 rounded-lg border border-accent/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Clock className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-sm text-muted-foreground mb-1">Pending Balance</div>
              <div className="text-3xl font-bold text-accent" data-testid="pending-balance">
                ₹{pendingBalance.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Being processed
              </div>
            </motion.div>

            <motion.div
              className="text-center p-6 bg-primary/5 rounded-lg border border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <CheckCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-sm text-muted-foreground mb-1">Available for Payout</div>
              <div className="text-3xl font-bold text-primary" data-testid="available-balance">
                ₹{availableBalance.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Ready to withdraw
              </div>
            </motion.div>
          </div>

          {/* Account Status */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">Account Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">KYC Verification</span>
                <Badge 
                  variant={seller.kycStatus === 'verified' ? 'default' : 'secondary'}
                  className={
                    seller.kycStatus === 'verified'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }
                >
                  {seller.kycStatus}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Payout Enabled</span>
                <Badge 
                  variant={seller.kycStatus === 'verified' ? 'default' : 'secondary'}
                  className={
                    seller.kycStatus === 'verified'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }
                >
                  {seller.kycStatus === 'verified' ? 'Active' : 'Pending'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {seller.bankDetails && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Bank Details</h3>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {(seller.bankDetails as any)?.bankName || "Bank Account"}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Account: {(seller.bankDetails as any)?.accountNumber || "****1234"}
                </div>
              </div>
            </div>
          )}

          {/* Payout Request */}
          <div className="space-y-4">
            <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
              <DialogTrigger asChild>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
                  disabled={availableBalance < 100 || seller.kycStatus !== 'verified'}
                  data-testid="request-payout-button"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Payout</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="payout-amount">Amount to withdraw (₹)</Label>
                    <Input
                      id="payout-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      min={100}
                      max={maxRequestAmount}
                      data-testid="payout-amount-input"
                    />
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Available: ₹{availableBalance.toLocaleString()}</p>
                    <p>Minimum: ₹100</p>
                    <p>Processing time: 2-3 business days</p>
                  </div>
                  <Button 
                    onClick={handleRequestPayout} 
                    disabled={requestPayoutMutation.isPending}
                    className="w-full"
                    data-testid="confirm-payout-request"
                  >
                    {requestPayoutMutation.isPending ? "Processing..." : "Request Payout"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {availableBalance < 100 && (
              <p className="text-sm text-muted-foreground text-center">
                Minimum payout amount is ₹100
              </p>
            )}

            {seller.kycStatus !== 'verified' && (
              <p className="text-sm text-destructive text-center">
                Complete KYC verification to enable payouts
              </p>
            )}
          </div>

          {/* Payout Information */}
          <div className="text-xs text-muted-foreground space-y-1 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-foreground mb-2">Payout Information:</h4>
            <p>• Payouts are processed within 2-3 business days</p>
            <p>• Minimum payout amount is ₹100</p>
            <p>• Platform fee is deducted before payout</p>
            <p>• KYC verification is required for all payouts</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
