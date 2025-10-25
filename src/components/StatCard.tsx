import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: number;
  iconColor?: string;
  highlight?: boolean;
  highlightContent?: React.ReactNode;
}

export const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  iconColor = "neon-purple",
  highlight = false,
  highlightContent 
}: StatCardProps) => {
  const getTrendColor = (trend: number) => {
    if (trend > 0) return "bg-success text-success-foreground";
    if (trend < 0) return "bg-destructive text-destructive-foreground";
    return "bg-muted text-muted-foreground";
  };

  if (highlight && highlightContent) {
    return (
      <div className="bg-info rounded-2xl p-6 relative overflow-hidden">
        {highlightContent}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-${iconColor}/20 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${iconColor}`} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold">{value}</p>
        {trend !== undefined && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${getTrendColor(trend)}`}>
            {trend > 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
    </div>
  );
};
