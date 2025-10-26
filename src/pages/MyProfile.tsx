import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pencil, Linkedin, Github, Globe, Mail, Trophy, Target, TrendingUp, Award, Eye, Users, MapPin } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/EmptyState";

export default function MyProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullProfile, setFullProfile] = useState<any>(null);
  const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false);

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

  const importLinkedInProfile = async (linkedinUrl: string) => {
    console.log('=== IMPORTING LINKEDIN PROFILE ===');
    console.log('LinkedIn URL:', linkedinUrl);
    
    try {
      const response = await supabase.functions.invoke('import-linkedin-profile', {
        body: { 
          linkedinUrl
        },
      });

      console.log('Clado API response:', response);

      if (response.error) {
        console.error('Clado API error:', response.error);
        toast.error("Failed to import LinkedIn profile: " + (response.error.message || 'Unknown error'));
        return;
      }

      if (response.data?.profile) {
        console.log('Profile data received from Clado:', response.data.profile);
        
        // Check if we got meaningful data
        const profileData = response.data.profile;
        const hasMeaningfulData = profileData.bio || 
                                 profileData.headline || 
                                 profileData.location || 
                                 (profileData.experience && profileData.experience.length > 0) ||
                                 (profileData.education && profileData.education.length > 0) ||
                                 (profileData.skills && profileData.skills.length > 0);

        if (hasMeaningfulData) {
          console.log('Updating profile with LinkedIn data');
          
          // Format all scraped data into the experience field
          let experienceText = '';
          
          // Add bio/summary
          if (profileData.bio) {
            experienceText += `**About Me:**\n${profileData.bio}\n\n`;
          }
          
          // Add headline
          if (profileData.headline) {
            experienceText += `**Professional Headline:**\n${profileData.headline}\n\n`;
          }
          
          // Add location
          if (profileData.location) {
            experienceText += `**Location:**\n${profileData.location}\n\n`;
          }
          
          // Add work experience
          if (profileData.experience && profileData.experience.length > 0) {
            experienceText += `**Work Experience:**\n`;
            profileData.experience.forEach((exp: any, index: number) => {
              experienceText += `${index + 1}. **${exp.title}** at ${exp.company}\n`;
              if (exp.startDate) experienceText += `   Period: ${exp.startDate} - ${exp.endDate || 'Present'}\n`;
              if (exp.description) experienceText += `   Description: ${exp.description}\n`;
              experienceText += `\n`;
            });
          }
          
          // Add education
          if (profileData.education && profileData.education.length > 0) {
            experienceText += `**Education:**\n`;
            profileData.education.forEach((edu: any, index: number) => {
              experienceText += `${index + 1}. **${edu.degree}** from ${edu.institution}\n`;
              if (edu.year) experienceText += `   Year: ${edu.year}\n`;
              experienceText += `\n`;
            });
          }
          
          // Add skills
          if (profileData.skills && profileData.skills.length > 0) {
            experienceText += `**Skills:**\n${profileData.skills.map((s: any) => s.name || s).join(', ')}\n\n`;
          }
          
          // Add certifications
          if (profileData.certifications && profileData.certifications.length > 0) {
            experienceText += `**Certifications:**\n`;
            profileData.certifications.forEach((cert: any, index: number) => {
              experienceText += `${index + 1}. ${cert}\n`;
            });
            experienceText += `\n`;
          }
          
          // Add years of experience
          if (profileData.years_of_experience) {
            experienceText += `**Years of Experience:** ${profileData.years_of_experience}\n\n`;
          }
          
          // Add portfolio URL
          if (profileData.portfolio_url) {
            experienceText += `**Portfolio:** ${profileData.portfolio_url}\n\n`;
          }
          
          // Update profile with formatted experience
          const updateData: any = {
            bio: profileData.bio || '',
            headline: profileData.headline || '',
            location: profileData.location || '',
            linkedin_url: linkedinUrl,
            portfolio_url: profileData.portfolio_url || '',
            experience: experienceText.trim(),
            years_of_experience: profileData.years_of_experience || 0,
            certifications: profileData.certifications || []
          };
          
          console.log('Updating profile with data:', updateData);
          
          const { error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id);
          
          if (updateError) {
            console.error('Error updating profile:', updateError);
            toast.error("Failed to save profile data");
          } else {
            console.log('Profile updated successfully');
            toast.success("LinkedIn profile imported successfully!");
            
            // Refresh profile data
            await fetchFullProfile();
          }
        } else {
          console.log('Clado returned empty data - no meaningful profile information found');
          toast.error('Could not find LinkedIn profile information. Please check if your LinkedIn profile is public.');
        }
      } else {
        console.log('No profile data in response');
        toast.error('No profile data returned from LinkedIn import');
      }
    } catch (error) {
      console.error('Error importing LinkedIn profile:', error);
      toast.error("Failed to import LinkedIn profile");
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

  if (!fullProfile) {
    return (
      <div className="container max-w-6xl mx-auto p-6 space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Profile Loading...</h1>
          <p className="text-muted-foreground">Please wait while we load your profile data.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
      
      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Avatar Section */}
          <div className="flex flex-col items-center lg:items-start gap-4">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {fullProfile.username?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <Button onClick={() => navigate("/profile/edit")} size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
          
          {/* Profile Info */}
          <div className="flex-1 space-y-4 min-w-0">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{fullProfile.username}</h2>
              {fullProfile.headline && (
                <p className="text-lg text-muted-foreground mt-2">{fullProfile.headline}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {fullProfile.location && (
                  <span className="flex items-center gap-2">
                    📍 {fullProfile.location}
                  </span>
                )}
                {fullProfile.years_of_experience && (
                  <span className="flex items-center gap-2">
                    🏆 {fullProfile.years_of_experience} years experience
                  </span>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      </Card>

      {/* Bio Section */}
      {fullProfile.bio && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">About</h3>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{fullProfile.bio}</p>
        </Card>
      )}

      {/* Experience Section */}
      {fullProfile.experience && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <div className="h-1 w-8 bg-primary rounded" />
            Experience
          </h3>
          <div className="space-y-4">
            {fullProfile.experience.split('\n\n').map((section: string, sectionIndex: number) => {
              const cleanSection = section.trim();
              if (!cleanSection) return null;
              
              return (
                <div key={sectionIndex} className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {cleanSection}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{fullProfile.xp || 0}</div>
          <div className="text-sm text-muted-foreground">Total XP</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">${fullProfile.wallet_balance || 0}</div>
          <div className="text-sm text-muted-foreground">Wallet Balance</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{fullProfile.total_predictions || 0}</div>
          <div className="text-sm text-muted-foreground">Total Predictions</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {fullProfile.total_predictions > 0
              ? ((fullProfile.correct_predictions / fullProfile.total_predictions) * 100).toFixed(1)
              : "0.0"}%
          </div>
          <div className="text-sm text-muted-foreground">Accuracy Rate</div>
        </Card>
      </div>
    </div>
  );
}