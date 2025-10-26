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
  const gradients = [
    'from-purple-500 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-orange-500 to-red-500',
    'from-green-500 to-teal-500'
  ];
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  return (
    <Card className={cn("p-6 bg-slate-medium/80 backdrop-blur-sm border-white/10", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm text-white/60 font-medium mb-2">{title}</p>
          <p className="text-4xl font-bold tabular-nums">{value}</p>
          {description && (
            <p className="text-xs text-white/50 mt-2">{description}</p>
          )}
        </div>
        <div className={`p-3 bg-gradient-to-br ${randomGradient} rounded-xl shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-bold",
            trend.isPositive ? "text-neon-green" : "text-neon-red"
          )}>
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-white/50">vs last period</span>
        </div>
      )}
    </Card>
  );
}
