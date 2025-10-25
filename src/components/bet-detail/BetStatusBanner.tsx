import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface BetStatusBannerProps {
  status: string;
  amount: number;
  odds: number;
  payout?: number;
  potentialPayout: number;
}

export function BetStatusBanner({ status, amount, odds, payout, potentialPayout }: BetStatusBannerProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'won':
        return {
          icon: CheckCircle2,
          label: 'Won',
          className: 'bg-green-500/10 text-green-500 border-green-500/20',
          bgGradient: 'from-green-500/5 to-transparent'
        };
      case 'lost':
        return {
          icon: XCircle,
          label: 'Lost',
          className: 'bg-red-500/10 text-red-500 border-red-500/20',
          bgGradient: 'from-red-500/5 to-transparent'
        };
      default:
        return {
          icon: Clock,
          label: 'Pending',
          className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          bgGradient: 'from-yellow-500/5 to-transparent'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const roi = payout ? ((payout - amount) / amount * 100) : ((potentialPayout - amount) / amount * 100);

  return (
    <div className={`relative overflow-hidden rounded-lg border bg-gradient-to-br ${config.bgGradient} p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${config.className}`}>
            <Icon className="h-8 w-8" />
          </div>
          <div>
            <Badge variant="outline" className={config.className}>
              {config.label}
            </Badge>
            <h2 className="text-2xl font-bold mt-2">
              {amount} HC @ {odds}%
            </h2>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {status === 'won' ? 'Actual Payout' : 'Potential Payout'}
          </p>
          <p className="text-3xl font-bold">
            {payout || potentialPayout} HC
          </p>
          <p className={`text-sm font-medium ${roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}% ROI
          </p>
        </div>
      </div>
    </div>
  );
}
