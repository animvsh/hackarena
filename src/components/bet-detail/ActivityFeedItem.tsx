import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { GitCommit, TrendingUp, Award, DollarSign } from 'lucide-react';

interface ActivityFeedItemProps {
  type: string;
  title: string;
  content?: string;
  timestamp: string;
  metadata?: any;
}

export function ActivityFeedItem({ type, title, content, timestamp, metadata }: ActivityFeedItemProps) {
  const getTypeConfig = () => {
    switch (type) {
      case 'commit':
        return {
          icon: GitCommit,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10'
        };
      case 'progress':
        return {
          icon: TrendingUp,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10'
        };
      case 'milestone':
        return {
          icon: Award,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10'
        };
      case 'bet':
        return {
          icon: DollarSign,
          color: 'text-purple-500',
          bgColor: 'bg-purple-500/10'
        };
      default:
        return {
          icon: GitCommit,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted'
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-full ${config.bgColor}`}>
          <Icon className={`h-4 w-4 ${config.color}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium">{title}</h4>
            <Badge variant="outline" className="text-xs">
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </Badge>
          </div>
          {content && (
            <p className="text-sm text-muted-foreground">{content}</p>
          )}
          {metadata?.impact_score && (
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Impact: +{metadata.impact_score}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
