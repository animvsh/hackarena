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

import { Pencil, MapPin, Linkedin, Github, Globe, Mail } from "lucide-react";
import { toast } from "sonner";

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
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="h-32 w-32">
            <AvatarImage src={fullProfile.avatar_url} />
            <AvatarFallback className="text-4xl">
              {fullProfile.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">{fullProfile.username}</h1>
                {fullProfile.headline && (
                  <p className="text-lg text-muted-foreground mt-1">{fullProfile.headline}</p>
                )}
                {fullProfile.location && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4" />
                    {fullProfile.location}
                  </p>
                )}
              </div>
              <Button onClick={() => navigate("/profile/edit")}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {fullProfile.linkedin_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={fullProfile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </a>
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

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{fullProfile.xp || 0}</div>
                <div className="text-sm text-muted-foreground">XP</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">${fullProfile.wallet_balance || 0}</div>
                <div className="text-sm text-muted-foreground">Wallet</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{fullProfile.total_predictions || 0}</div>
                <div className="text-sm text-muted-foreground">Predictions</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">{accuracyRate}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completeness */}
        {fullProfile.profile_completeness < 100 && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Profile Completeness</span>
              <span className="text-sm text-muted-foreground">{fullProfile.profile_completeness}%</span>
            </div>
            <Progress value={fullProfile.profile_completeness} />
            <p className="text-xs text-muted-foreground mt-2">
              Complete your profile to unlock all features and improve visibility
            </p>
          </div>
        )}
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="history">Betting History</TabsTrigger>
          <TabsTrigger value="activity">Team Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {fullProfile.bio && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{fullProfile.bio}</p>
            </Card>
          )}

          {fullProfile.skills && fullProfile.skills.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {fullProfile.skills.map((skill: any, index: number) => (
                  <Badge key={index} variant="secondary">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {fullProfile.projects && fullProfile.projects.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Projects</h2>
              <div className="space-y-4">
                {fullProfile.projects.map((project: any, index: number) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                    {project.url && (
                      <a 
                        href={project.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          {fullProfile.experience && fullProfile.experience.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Work Experience</h2>
              <div className="space-y-6">
                {fullProfile.experience.map((exp: any, index: number) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h3 className="font-semibold">{exp.title}</h3>
                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                    <p className="text-xs text-muted-foreground">
                      {exp.startDate} - {exp.endDate || "Present"}
                    </p>
                    {exp.description && (
                      <p className="text-sm mt-2">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {fullProfile.education && fullProfile.education.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Education</h2>
              <div className="space-y-4">
                {fullProfile.education.map((edu: any, index: number) => (
                  <div key={index} className="border-l-2 border-primary pl-4">
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    <p className="text-xs text-muted-foreground">{edu.year}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {fullProfile.certifications && fullProfile.certifications.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Certifications</h2>
              <div className="space-y-3">
                {fullProfile.certifications.map((cert: any, index: number) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{cert.date}</span>
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
          <Card className="p-6">
            <p className="text-muted-foreground">Team activity feed - coming soon</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
