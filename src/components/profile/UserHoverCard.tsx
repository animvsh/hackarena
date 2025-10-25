import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, TrendingUp } from 'lucide-react';

interface UserHoverCardProps {
  userId: string;
  username: string;
  avatarUrl?: string | null;
  xp?: number;
  totalPredictions?: number;
  correctPredictions?: number;
  children: React.ReactNode;
}

export function UserHoverCard({
  userId,
  username,
  avatarUrl,
  xp,
  totalPredictions,
  correctPredictions,
  children,
}: UserHoverCardProps) {
  const navigate = useNavigate();

  const accuracyRate =
    totalPredictions && totalPredictions > 0
      ? ((correctPredictions || 0) / totalPredictions) * 100
      : 0;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="cursor-pointer" onClick={() => navigate(`/users/${userId}`)}>
          {children}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{username}</h4>
              <p className="text-sm text-muted-foreground">
                Click to view full profile
              </p>
            </div>
          </div>

          {(xp !== undefined || totalPredictions !== undefined) && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              {xp !== undefined && (
                <div className="text-center p-2 bg-secondary/50 rounded-lg">
                  <div className="flex justify-center mb-1">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-bold">{xp.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              )}
              {totalPredictions !== undefined && (
                <div className="text-center p-2 bg-secondary/50 rounded-lg">
                  <div className="flex justify-center mb-1">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-bold">{totalPredictions}</p>
                  <p className="text-xs text-muted-foreground">Bets</p>
                </div>
              )}
              {correctPredictions !== undefined && totalPredictions !== undefined && (
                <div className="text-center p-2 bg-secondary/50 rounded-lg">
                  <div className="flex justify-center mb-1">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-bold">{accuracyRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                </div>
              )}
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
