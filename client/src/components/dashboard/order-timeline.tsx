import { Check, Package, Truck, Home, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OrderTimelineProps {
  status: string;
  compact?: boolean;
}

const orderSteps = [
  { key: "pending", label: "Ordered", icon: Package },
  { key: "paid", label: "Paid", icon: Check },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

const statusOrder = ["pending", "paid", "shipped", "delivered"];

export default function OrderTimeline({ status, compact = false }: OrderTimelineProps) {
  const currentIndex = statusOrder.indexOf(status);
  
  if (status === "cancelled" || status === "disputed") {
    return (
      <Badge 
        variant="destructive" 
        className="flex items-center gap-1"
        data-testid={`order-status-${status}`}
      >
        <AlertCircle className="w-3 h-3" />
        {status === "cancelled" ? "Cancelled" : "Disputed"}
      </Badge>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs" data-testid="order-timeline-compact">
        {orderSteps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div
              key={step.key}
              className={`flex items-center ${index < orderSteps.length - 1 ? 'mr-2' : ''}`}
            >
              <div
                className={`w-3 h-3 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? isCurrent
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {isCompleted && <Check className="w-2 h-2" />}
              </div>
              {index < orderSteps.length - 1 && (
                <div className={`w-8 h-px ml-1 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="order-timeline-full">
      {orderSteps.map((step, index) => {
        const StepIcon = step.icon;
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        
        return (
          <div key={step.key} className="flex items-center space-x-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                isCompleted
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4" />
              ) : (
                <StepIcon className="w-4 h-4" />
              )}
            </div>
            
            <div className="flex-1">
              <div
                className={`font-medium ${
                  isCompleted ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </div>
              {isCurrent && (
                <div className="text-sm text-primary">Current status</div>
              )}
            </div>
            
            {isCurrent && (
              <Badge variant="default" className="bg-primary text-primary-foreground">
                Current
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
}
