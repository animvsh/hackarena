import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Competitor {
  team_id: string;
  team_name: string;
  team_logo: string;
  current_odds: number;
  volume: number;
  trend?: 'up' | 'down' | 'neutral';
}

interface CompetitorTableProps {
  competitors: Competitor[];
  userTeamId: string;
  totalPool: number;
}

export function CompetitorTable({ competitors, userTeamId, totalPool }: CompetitorTableProps) {
  const navigate = useNavigate();

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">All Teams in Market</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Odds</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>% of Pool</TableHead>
            <TableHead>Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {competitors.map((competitor, index) => {
            const isUserTeam = competitor.team_id === userTeamId;
            const poolPercentage = (competitor.volume / totalPool * 100).toFixed(1);

            return (
              <TableRow 
                key={competitor.team_id}
                className={`cursor-pointer hover:bg-accent ${isUserTeam ? 'bg-primary/5' : ''}`}
                onClick={() => navigate(`/teams/${competitor.team_id}`)}
              >
                <TableCell className="font-medium">#{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={competitor.team_logo} />
                      <AvatarFallback>{competitor.team_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{competitor.team_name}</p>
                      {isUserTeam && (
                        <Badge variant="outline" className="text-xs">Your Bet</Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{competitor.current_odds.toFixed(1)}%</span>
                </TableCell>
                <TableCell>{competitor.volume} HC</TableCell>
                <TableCell>{poolPercentage}%</TableCell>
                <TableCell>{getTrendIcon(competitor.trend)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
