import { memo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, TrendingUp, Users, Code, Flame } from "lucide-react";

interface TeamCardProps {
  team: {
    id: string;
    name: string;
    tagline: string | null;
    logo_url: string | null;
    category: string[];
    tech_stack: string[];
    github_repo: string | null;
    devpost_url: string | null;
    status: string;
    team_size: number;
    current_progress: number;
    momentum_score: number;
  };
  onClick?: () => void;
}

export const TeamCard = memo(({ team, onClick }: TeamCardProps) => {
  const getMomentumColor = (score: number) => {
    if (score >= 75) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getMomentumLabel = (score: number) => {
    if (score >= 75) return "🔥 HOT";
    if (score >= 50) return "📈 Rising";
    return "📉 Building";
  };

  return (
    <Card
      className="p-6 bg-card border-border hover:border-primary/50 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={team.logo_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${team.name}`}
          alt={team.name}
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold truncate group-hover:text-primary transition-colors">
            {team.name}
          </h3>
          {team.tagline && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {team.tagline}
            </p>
          )}
        </div>
        <Badge
          variant="outline"
          className={`${getMomentumColor(team.momentum_score)} border-current`}
        >
          {getMomentumLabel(team.momentum_score)}
        </Badge>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {team.category?.map((cat) => (
          <Badge key={cat} variant="secondary">
            {cat}
          </Badge>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Project Progress</span>
          <span className="text-sm font-bold">{team.current_progress}%</span>
        </div>
        <Progress value={team.current_progress} className="h-2" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-background/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Flame className={`w-4 h-4 ${getMomentumColor(team.momentum_score)}`} />
          <div>
            <p className="text-xs text-muted-foreground">Momentum</p>
            <p className="text-sm font-bold">{team.momentum_score.toFixed(1)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-muted-foreground">Team Size</p>
            <p className="text-sm font-bold">{team.team_size}</p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      {team.tech_stack && team.tech_stack.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">TECH STACK</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {team.tech_stack.slice(0, 5).map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {team.tech_stack.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{team.tech_stack.length - 5}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {team.github_repo && (
          <Button
            variant="outline"
            size="sm"
            asChild
            onClick={(e) => e.stopPropagation()}
            className="flex-1"
          >
            <a href={team.github_repo} target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </a>
          </Button>
        )}
        {team.devpost_url && (
          <Button
            variant="outline"
            size="sm"
            asChild
            onClick={(e) => e.stopPropagation()}
            className="flex-1"
          >
            <a href={team.devpost_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Devpost
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
});
