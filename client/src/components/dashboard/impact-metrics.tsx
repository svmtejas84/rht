import { useQuery } from "@tanstack/react-query";
import { TreePine, Zap, Recycle, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { environmentalApi } from "@/lib/api";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface ImpactMetricsProps {
  showUserStats?: boolean;
}

export default function ImpactMetrics({ showUserStats = true }: ImpactMetricsProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const { data: impact } = useQuery({
    queryKey: ["/api/environmental/impact"],
    queryFn: () => environmentalApi.getTotalImpact(),
  });

  const metrics = [
    {
      icon: TreePine,
      value: impact?.treesPlanted || 2847,
      label: "Trees Planted",
      description: "By our community",
      color: "text-primary",
      bgColor: "bg-primary/10",
      suffix: "",
    },
    {
      icon: Zap,
      value: impact?.carbonOffset || 156,
      label: "CO₂ Offset",
      description: "This year",
      color: "text-accent",
      bgColor: "bg-accent/10",
      suffix: "t",
    },
    {
      icon: Recycle,
      value: impact?.plasticReduced || 89,
      label: "Plastic Reduced",
      description: "Vs traditional",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      suffix: "%",
    },
    {
      icon: Trash2,
      value: impact?.wasteReduced || 1200,
      label: "Waste Diverted",
      description: "Kg from landfills",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      suffix: "",
    },
  ];

  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" data-testid="impact-metrics">
      {metrics.map((metric, index) => (
        <MetricCard
          key={metric.label}
          metric={metric}
          isInView={isInView}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}

interface MetricCardProps {
  metric: {
    icon: React.ElementType;
    value: number;
    label: string;
    description: string;
    color: string;
    bgColor: string;
    suffix: string;
  };
  isInView: boolean;
  delay: number;
}

function MetricCard({ metric, isInView, delay }: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = metric.value / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(metric.value, increment * step);
        setDisplayValue(Math.floor(current));

        if (step >= steps) {
          clearInterval(timer);
          setDisplayValue(metric.value);
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, metric.value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <Card className="text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105">
        <CardContent className="p-8">
          <motion.div
            className={`w-16 h-16 ${metric.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ duration: 0.6, delay: delay + 0.3 }}
          >
            <metric.icon className={`w-8 h-8 ${metric.color}`} />
          </motion.div>
          
          <motion.div
            className={`text-3xl font-bold ${metric.color} mb-2 animate-counter`}
            data-testid={`metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {displayValue.toLocaleString()}{metric.suffix}
          </motion.div>
          
          <div className="text-foreground font-semibold mb-1">{metric.label}</div>
          <div className="text-muted-foreground text-sm">{metric.description}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
