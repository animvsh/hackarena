import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Code, 
  Users, 
  Lightbulb, 
  MessageSquare,
  Brain,
  DollarSign,
  Smartphone,
  Database,
  Zap,
  Target,
  Award
} from "lucide-react";

interface HackerStats {
  hackathon_experience: number;
  technical_skill: number;
  leadership_score: number;
  innovation_score: number;
  communication_score: number;
  ai_ml_expertise: number;
  fintech_experience: number;
  blockchain_knowledge: number;
  mobile_dev_skill: number;
  fullstack_proficiency: number;
  consistency_score: number;
  growth_trajectory: number;
  network_strength: number;
  company_prestige: number;
  overall_rating: number;
  market_value: number;
}

interface HackerProfile {
  id: string;
  name: string;
  headline: string;
  current_company: string;
  years_experience: number;
  seniority_level: string;
  linkedin_url: string;
  stats: HackerStats;
}

interface HackerCardProps {
  hacker: HackerProfile;
  showDetailed?: boolean;
}

export const HackerCard = ({ hacker, showDetailed = false }: HackerCardProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 80) return "text-green-500";
    if (rating >= 60) return "text-yellow-500";
    if (rating >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 90) return "Elite";
    if (rating >= 80) return "Expert";
    if (rating >= 70) return "Advanced";
    if (rating >= 60) return "Intermediate";
    if (rating >= 40) return "Beginner";
    return "Novice";
  };

  const coreStats = [
    { label: "Hackathon Exp", value: hacker.stats.hackathon_experience, icon: Award },
    { label: "Technical Skill", value: hacker.stats.technical_skill, icon: Code },
    { label: "Leadership", value: hacker.stats.leadership_score, icon: Users },
    { label: "Innovation", value: hacker.stats.innovation_score, icon: Lightbulb },
    { label: "Communication", value: hacker.stats.communication_score, icon: MessageSquare },
  ];

  const specializedStats = [
    { label: "AI/ML", value: hacker.stats.ai_ml_expertise, icon: Brain },
    { label: "FinTech", value: hacker.stats.fintech_experience, icon: DollarSign },
    { label: "Blockchain", value: hacker.stats.blockchain_knowledge, icon: Zap },
    { label: "Mobile", value: hacker.stats.mobile_dev_skill, icon: Smartphone },
    { label: "Full-Stack", value: hacker.stats.fullstack_proficiency, icon: Database },
  ];

  return (
    <Card className="p-6 bg-card border-border hover:border-primary/50 transition-all">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Avatar className="w-16 h-16">
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {hacker.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold truncate">{hacker.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {hacker.headline}
          </p>
          
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-xs">
              {hacker.current_company}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {hacker.years_experience}y exp
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {hacker.seniority_level}
            </Badge>
          </div>
          
          {/* Overall Rating */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Overall Rating</p>
              <p className={`text-2xl font-bold ${getRatingColor(hacker.stats.overall_rating)}`}>
                {hacker.stats.overall_rating}
              </p>
            </div>
            <div className="flex-1">
              <Progress 
                value={hacker.stats.overall_rating} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {getRatingLabel(hacker.stats.overall_rating)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Market Value</p>
              <p className="text-lg font-bold text-primary">
                {hacker.stats.market_value.toLocaleString()} HC
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Stats */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-muted-foreground mb-3">CORE STATS</h4>
        <div className="grid grid-cols-2 gap-3">
          {coreStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2 p-2 bg-background/50 rounded">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={stat.value} className="h-1 flex-1" />
                    <span className={`text-xs font-bold ${getRatingColor(stat.value)}`}>
                      {stat.value}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Specialized Skills */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-muted-foreground mb-3">SPECIALIZED SKILLS</h4>
        <div className="grid grid-cols-2 gap-3">
          {specializedStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2 p-2 bg-background/50 rounded">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={stat.value} className="h-1 flex-1" />
                    <span className={`text-xs font-bold ${getRatingColor(stat.value)}`}>
                      {stat.value}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Meta Stats */}
      {showDetailed && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">META STATS</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Consistency</p>
                <p className={`text-sm font-bold ${getRatingColor(hacker.stats.consistency_score)}`}>
                  {hacker.stats.consistency_score}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
              <Target className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Growth</p>
                <p className={`text-sm font-bold ${getRatingColor(hacker.stats.growth_trajectory)}`}>
                  {hacker.stats.growth_trajectory}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Network</p>
                <p className={`text-sm font-bold ${getRatingColor(hacker.stats.network_strength)}`}>
                  {hacker.stats.network_strength}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
              <Award className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Prestige</p>
                <p className={`text-sm font-bold ${getRatingColor(hacker.stats.company_prestige)}`}>
                  {hacker.stats.company_prestige}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <a href={hacker.linkedin_url} target="_blank" rel="noopener noreferrer">
            View LinkedIn
          </a>
        </Button>
        {showDetailed && (
          <Button variant="outline" size="sm">
            Detailed Analysis
          </Button>
        )}
      </div>
    </Card>
  );
};

interface TeamCompositionCardProps {
  teamId: string;
  teamName: string;
  composition: {
    skill_diversity: number;
    experience_gap: number;
    leadership_clarity: number;
    domain_expertise: number;
    hackathon_readiness: number;
    innovation_potential: number;
    execution_ability: number;
    market_fit_understanding: number;
    overall_team_rating: number;
    predicted_performance: number;
  };
}

export const TeamCompositionCard = ({ teamId, teamName, composition }: TeamCompositionCardProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 80) return "text-green-500";
    if (rating >= 60) return "text-yellow-500";
    if (rating >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const synergyMetrics = [
    { label: "Skill Diversity", value: composition.skill_diversity, icon: Users },
    { label: "Experience Balance", value: composition.experience_gap, icon: TrendingUp },
    { label: "Leadership Clarity", value: composition.leadership_clarity, icon: Target },
    { label: "Domain Expertise", value: composition.domain_expertise, icon: Code },
  ];

  const predictiveMetrics = [
    { label: "Hackathon Readiness", value: composition.hackathon_readiness, icon: Award },
    { label: "Innovation Potential", value: composition.innovation_potential, icon: Lightbulb },
    { label: "Execution Ability", value: composition.execution_ability, icon: Zap },
    { label: "Market Understanding", value: composition.market_fit_understanding, icon: DollarSign },
  ];

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">{teamName}</h3>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Team Rating</p>
          <p className={`text-2xl font-bold ${getRatingColor(composition.overall_team_rating)}`}>
            {composition.overall_team_rating}
          </p>
        </div>
      </div>

      {/* Overall Performance Prediction */}
      <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Predicted Performance</p>
            <p className="text-xs text-muted-foreground">Based on team composition analysis</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${getRatingColor(composition.predicted_performance)}`}>
              {composition.predicted_performance}%
            </p>
            <p className="text-xs text-muted-foreground">Win Probability</p>
          </div>
        </div>
        <Progress value={composition.predicted_performance} className="h-2 mt-3" />
      </div>

      {/* Synergy Metrics */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-muted-foreground mb-3">TEAM SYNERGY</h4>
        <div className="grid grid-cols-2 gap-3">
          {synergyMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="flex items-center gap-2 p-2 bg-background/50 rounded">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{metric.label}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={metric.value} className="h-1 flex-1" />
                    <span className={`text-xs font-bold ${getRatingColor(metric.value)}`}>
                      {metric.value}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Predictive Metrics */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3">PREDICTIVE METRICS</h4>
        <div className="grid grid-cols-2 gap-3">
          {predictiveMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="flex items-center gap-2 p-2 bg-background/50 rounded">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{metric.label}</p>
                  <div className="flex items-center gap-2">
                    <Progress value={metric.value} className="h-1 flex-1" />
                    <span className={`text-xs font-bold ${getRatingColor(metric.value)}`}>
                      {metric.value}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};


