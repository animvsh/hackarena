import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, description, className }: StatsCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium",
            trend.isPositive ? "text-green-500" : "text-red-500"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">vs last period</span>
        </div>
      )}
    </Card>
  );
}
