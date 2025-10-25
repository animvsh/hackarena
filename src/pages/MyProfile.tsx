import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

import { UserBettingHistory } from "@/components/profile/UserBettingHistory";

import { Pencil, MapPin, Linkedin, Github, Globe, Mail, Trophy, Target, TrendingUp, Award } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";
import { StatsCard } from "@/components/profile/StatsCard";

export default function MyProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullProfile, setFullProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchFullProfile();
  }, [user]);

  const fetchFullProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setFullProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInConnect = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/profile`,
          scopes: 'openid profile email'
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Error connecting LinkedIn:", error);
      toast.error("Failed to connect LinkedIn account");
    }
  };

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!fullProfile) return null;

  const accuracyRate = fullProfile.total_predictions > 0
    ? ((fullProfile.correct_predictions / fullProfile.total_predictions) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Hero Header Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage src={fullProfile.avatar_url} />
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                  {fullProfile.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button onClick={() => navigate("/profile/edit")} size="sm" className="w-full lg:w-auto">
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 space-y-4 min-w-0">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{fullProfile.username}</h1>
                {fullProfile.headline && (
                  <p className="text-lg text-muted-foreground mt-2">{fullProfile.headline}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                  {fullProfile.location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {fullProfile.location}
                    </span>
                  )}
                  {fullProfile.years_of_experience && (
                    <span className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      {fullProfile.years_of_experience} years experience
                    </span>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-2">
                {fullProfile.linkedin_url ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={fullProfile.linkedin_url} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleLinkedInConnect}>
                    <Linkedin className="h-4 w-4 mr-2" />
                    Connect LinkedIn
                  </Button>
                )}
                {fullProfile.github_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={fullProfile.github_url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {fullProfile.portfolio_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={fullProfile.portfolio_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Portfolio
                    </a>
                  </Button>
                )}
                {fullProfile.email && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${fullProfile.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Completeness Banner */}
          {fullProfile.profile_completeness < 100 && (
            <div className="mt-6 p-4 bg-card border rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">Profile Completeness</span>
                <span className="text-sm font-bold text-primary">{fullProfile.profile_completeness}%</span>
              </div>
              <Progress value={fullProfile.profile_completeness} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Complete your profile to unlock all features and boost your visibility
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total XP"
          value={fullProfile.xp || 0}
          icon={Trophy}
          className="hover:shadow-lg transition-shadow"
        />
        <StatsCard
          title="Wallet Balance"
          value={`$${fullProfile.wallet_balance || 0}`}
          icon={TrendingUp}
          className="hover:shadow-lg transition-shadow"
        />
        <StatsCard
          title="Total Predictions"
          value={fullProfile.total_predictions || 0}
          icon={Target}
          className="hover:shadow-lg transition-shadow"
        />
        <StatsCard
          title="Accuracy Rate"
          value={`${accuracyRate}%`}
          icon={Award}
          className="hover:shadow-lg transition-shadow"
        />
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Overview
          </TabsTrigger>
          <TabsTrigger value="experience" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Experience
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Betting History
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Team Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {fullProfile.bio ? (
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <div className="h-1 w-8 bg-primary rounded" />
                About
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{fullProfile.bio}</p>
            </Card>
          ) : (
            <EmptyState
              icon={Pencil}
              title="No bio yet"
              description="Add a bio to tell others about yourself"
              action={{
                label: "Edit Profile",
                onClick: () => navigate("/profile/edit")
              }}
            />
          )}

          {fullProfile.skills && fullProfile.skills.length > 0 && (
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <div className="h-1 w-8 bg-primary rounded" />
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {fullProfile.skills.map((skill: any, index: number) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {fullProfile.projects && fullProfile.projects.length > 0 ? (
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <div className="h-1 w-8 bg-primary rounded" />
                Projects
              </h2>
              <div className="space-y-6">
                {fullProfile.projects.map((project: any, index: number) => (
                  <div key={index} className="group p-4 border-l-4 border-primary/50 hover:border-primary bg-muted/30 hover:bg-muted/50 rounded-r-lg transition-all">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
                    {project.url && (
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-2 font-medium"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="experience" className="space-y-6">
          {fullProfile.experience && fullProfile.experience.length > 0 ? (
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="h-1 w-8 bg-primary rounded" />
                Work Experience
              </h2>
              <div className="space-y-6">
                {fullProfile.experience.map((exp: any, index: number) => (
                  <div key={index} className="group p-4 border-l-4 border-primary/50 hover:border-primary bg-muted/30 hover:bg-muted/50 rounded-r-lg transition-all">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{exp.title}</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{exp.company}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                    {exp.description && (
                      <p className="text-sm mt-3 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <EmptyState
              icon={Award}
              title="No work experience yet"
              description="Add your work experience to showcase your professional background"
              action={{
                label: "Edit Profile",
                onClick: () => navigate("/profile/edit")
              }}
            />
          )}

          {fullProfile.education && fullProfile.education.length > 0 && (
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="h-1 w-8 bg-primary rounded" />
                Education
              </h2>
              <div className="space-y-4">
                {fullProfile.education.map((edu: any, index: number) => (
                  <div key={index} className="group p-4 border-l-4 border-primary/50 hover:border-primary bg-muted/30 hover:bg-muted/50 rounded-r-lg transition-all">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{edu.degree}</h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground mt-1">{edu.year}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {fullProfile.certifications && fullProfile.certifications.length > 0 && (
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="h-1 w-8 bg-primary rounded" />
                Certifications
              </h2>
              <div className="space-y-4">
                {fullProfile.certifications.map((cert: any, index: number) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                    <div>
                      <h3 className="font-bold">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">{cert.date}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <UserBettingHistory userId={user.id} />
        </TabsContent>

        <TabsContent value="activity">
          <EmptyState
            icon={TrendingUp}
            title="Team activity coming soon"
            description="Track your team's performance and activity feed here"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
