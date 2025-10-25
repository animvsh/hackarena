import { Trophy } from 'lucide-react';

interface Team {
  name: string;
  score: number;
  change: number;
}

export function LiveScoreBoard() {
  const topTeams: Team[] = [
    { name: 'Code Crusaders', score: 2847, change: 12 },
    { name: 'Tech Titans', score: 2691, change: -5 },
    { name: 'Bug Busters', score: 2534, change: 8 },
  ];

  return (
    <div className="absolute top-16 right-4 z-40 w-64">
      <div className="bg-card/90 backdrop-blur-md border border-primary/30 rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary/20 border-b border-primary/30 px-3 py-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wide">
              Live Leaderboard
            </span>
          </div>
        </div>
        
        {/* Teams */}
        <div className="p-2 space-y-1">
          {topTeams.map((team, index) => (
            <div
              key={team.name}
              className="flex items-center justify-between p-2 bg-background/50 rounded hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  'bg-orange-600 text-white'
                }`}>
                  {index + 1}
                </div>
                <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                  {team.name}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {team.score}
                </span>
                <span className={`text-xs font-semibold ${
                  team.change > 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {team.change > 0 ? '↑' : '↓'}{Math.abs(team.change)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
