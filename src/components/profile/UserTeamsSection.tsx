import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, TrendingUp, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';

interface Team {
  id: string;
  name: string;
  logo_url?: string | null;
  tagline?: string | null;
  category?: string[] | null;
  momentum_score?: number;
  team_size?: number;
}

interface TeamMembership {
  id: string;
  role: string;
  can_manage_members?: boolean;
  teams: Team;
}

interface UserTeamsSectionProps {
  memberships: TeamMembership[];
  isOwnProfile?: boolean;
}

export function UserTeamsSection({ memberships, isOwnProfile = false }: UserTeamsSectionProps) {
  const navigate = useNavigate();

  if (memberships.length === 0) {
    if (isOwnProfile) {
      return (
        <EmptyState
          icon={Users}
          title="You're not part of any teams yet"
          description="Join or create a team to start collaborating"
          action={{
            label: "Browse Teams",
            onClick: () => navigate('/teams')
          }}
        />
      );
    } else {
      return (
        <EmptyState
          icon={Users}
          title="Not part of any teams"
          description="This user hasn't joined any teams yet"
        />
      );
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {memberships.map((membership) => (
        <Card 
          key={membership.id} 
          className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate(`/teams/${membership.teams.id}`)}
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={membership.teams.logo_url || undefined} />
              <AvatarFallback className="bg-primary/10">
                {membership.teams.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg truncate">
                    {membership.teams.name}
                  </h3>
                  {membership.teams.tagline && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {membership.teams.tagline}
                    </p>
                  )}
                </div>
                <Badge variant={membership.role === 'owner' ? 'default' : 'secondary'}>
                  {membership.role}
                </Badge>
              </div>

              {membership.teams.category && membership.teams.category.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {membership.teams.category.slice(0, 2).map((cat, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                  {membership.teams.category.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{membership.teams.category.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{membership.teams.team_size || 0} members</span>
                </div>
                {membership.teams.momentum_score !== undefined && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{Math.round(membership.teams.momentum_score)}</span>
                  </div>
                )}
              </div>

              {isOwnProfile && membership.role === 'owner' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/teams/${membership.teams.id}/settings`);
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Team
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
