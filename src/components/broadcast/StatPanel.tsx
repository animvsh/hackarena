interface StatPanelProps {
  visible: boolean;
}

export function StatPanel({ visible }: StatPanelProps) {
  if (!visible) return null;

  const topTeams = [
    { name: 'TechCorp', score: 87, trend: '+12' },
    { name: 'StartupX', score: 82, trend: '+8' },
    { name: 'CodeNinjas', score: 78, trend: '+15' },
    { name: 'TeamAI', score: 75, trend: '+5' },
    { name: 'InnovateCo', score: 71, trend: '+3' },
  ];

  return (
    <div className="absolute top-24 right-8 w-80 bg-card/90 backdrop-blur-sm border border-primary/20 rounded-lg p-6 animate-in slide-in-from-right duration-700">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h3 className="text-lg font-bold text-foreground uppercase tracking-wider">Live Leaderboard</h3>
      </div>

      <div className="space-y-3">
        {topTeams.map((team, index) => (
          <div key={team.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-primary w-6">{index + 1}</span>
              <span className="text-sm font-medium text-foreground">{team.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground">{team.score}</span>
              <span className="text-xs font-semibold text-success">{team.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Market Odds</p>
        <div className="mt-2 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">TechCorp</span>
            <span className="font-bold text-primary">2.1x</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">StartupX</span>
            <span className="font-bold text-primary">2.5x</span>
          </div>
        </div>
      </div>
    </div>
  );
}
