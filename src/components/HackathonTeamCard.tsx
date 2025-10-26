import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, Users, Code } from "lucide-react";

interface Team {
  id: string;
  name: string;
  tagline: string;
  logo_url: string;
  category: string[];
  tech_stack: string[];
  team_size: number;
  momentum_score: number;
}

interface HackathonTeamCardProps {
  team: Team;
  hackathonId: string;
}

export const HackathonTeamCard = ({ team, hackathonId }: HackathonTeamCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={team.logo_url} alt={team.name} />
            <AvatarFallback>{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{team.name}</CardTitle>
            <CardDescription className="line-clamp-2">{team.tagline}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {team.category && team.category.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {team.category.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="secondary">
                {cat}
              </Badge>
            ))}
            {team.category.length > 3 && (
              <Badge variant="secondary">+{team.category.length - 3}</Badge>
            )}
          </div>
        )}

        {team.tech_stack && team.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {team.tech_stack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="outline" className="text-xs">
                <Code className="w-3 h-3 mr-1" />
                {tech}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{team.team_size} members</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{team.momentum_score.toFixed(0)} momentum</span>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={() => navigate(`/teams/${team.id}`)}
        >
          View Team Profile
        </Button>
      </CardContent>
    </Card>
  );
};
