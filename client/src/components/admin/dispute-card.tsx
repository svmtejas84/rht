import { AlertTriangle, CheckCircle, XCircle, Clock, User, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OrderWithItems } from "@shared/schema";
import { motion } from "framer-motion";

interface DisputeCardProps {
  order: OrderWithItems;
  onReleaseFunds: () => void;
  onProcessRefund: () => void;
  isLoading: boolean;
}

export default function DisputeCard({ 
  order, 
  onReleaseFunds, 
  onProcessRefund, 
  isLoading 
}: DisputeCardProps) {
  const totalAmount = parseFloat(order.totalAmount);
  const createdDate = new Date(order.createdAt);
  const daysSinceCreated = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card 
        className="border-destructive/20 bg-destructive/5"
        data-testid={`dispute-card-${order.id}`}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Order #{order.id.slice(-8)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {daysSinceCreated} days ago
                </p>
              </div>
            </div>
            
            <Badge 
              variant="destructive" 
              className="bg-destructive/20 text-destructive border-destructive/30"
            >
              High Priority
            </Badge>
          </div>

          {/* Order Details */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{order.buyer?.fullName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Seller:</span>
                <span className="font-medium">{order.seller?.businessName}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Order Date:</span>
                <span className="font-medium">{createdDate.toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold text-foreground">
                  ₹{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <Separator />

            {/* Dispute Reason */}
            <div>
              <h4 className="font-medium text-foreground mb-2">Dispute Reason:</h4>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {order.disputeReason || "Product not as described - Customer reports quality issues"}
              </p>
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Order Items:</h4>
                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center justify-between text-sm bg-muted p-2 rounded"
                    >
                      <span>{item.product?.name || "Product"}</span>
                      <span>Qty: {item.quantity} × ₹{parseFloat(item.unitPrice).toLocaleString()}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {order.adminNotes && (
              <div>
                <h4 className="font-medium text-foreground mb-2">Admin Notes:</h4>
                <p className="text-sm text-muted-foreground bg-accent/5 p-3 rounded-lg border border-accent/20">
                  {order.adminNotes}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onReleaseFunds}
              disabled={isLoading}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid={`release-funds-${order.id}`}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isLoading ? "Processing..." : "Release Funds to Seller"}
            </Button>
            
            <Button
              onClick={onProcessRefund}
              disabled={isLoading}
              variant="destructive"
              className="flex-1"
              data-testid={`process-refund-${order.id}`}
            >
              <XCircle className="w-4 h-4 mr-2" />
              {isLoading ? "Processing..." : "Process Customer Refund"}
            </Button>
            
            <Button
              variant="outline"
              className="flex-1"
              data-testid={`view-details-${order.id}`}
            >
              View Full Details
            </Button>
          </div>

          {/* Additional Information */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Releasing funds will transfer the payment to the seller. 
              Processing a refund will return the money to the customer and mark the order as cancelled.
              This action cannot be undone.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
