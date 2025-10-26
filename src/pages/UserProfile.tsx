import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard } from '@/components/profile/StatsCard';
import { UserBettingHistory } from '@/components/profile/UserBettingHistory';
import { InviteToTeamModal } from '@/components/profile/InviteToTeamModal';
import { UserTeamsSection } from '@/components/profile/UserTeamsSection';
import { ArrowLeft, Wallet, Trophy, TrendingUp, Target, UserPlus, MapPin, Linkedin, Github, Globe, Mail, Briefcase, GraduationCap, Award, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMemberships } from '@/hooks/useTeamMemberships';
import { useProfileViews } from '@/hooks/useProfileViews';
import { checkSharedTeams, canViewSection } from '@/lib/privacyHelpers';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url: string;
  wallet_balance: number;
  xp: number;
  total_predictions: number;
  correct_predictions: number;
  bio?: string;
  headline?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  skills?: any[];
  experience?: any[];
  education?: any[];
  projects?: any[];
  certifications?: any[];
  privacy_settings?: any;
}

interface TeamMembership {
  id: string;
  role: string;
  teams: {
    id: string;
    name: string;
    logo_url: string;
  };
}

export default function UserProfile() {
  console.log('=== UserProfile component rendered ===');
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [hasSharedTeam, setHasSharedTeam] = useState(false);
  const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false);
  const { memberships: teamMemberships } = useTeamMemberships(userId);
  const { trackView } = useProfileViews(userId);

  const isOwnProfile = currentUser?.id === userId;
  console.log('=== UserProfile state ===', { userId, currentUser: currentUser?.id, isOwnProfile, hasUser: !!user });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;

      // Fetch user (check both users and hackers table)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userData && !userError) {
        setUser(userData as User);
      } else if (userError && userError.code === 'PGRST116') {
        // User not found in users table, try hackers table
        const { data: hackerData } = await supabase
          .from('hackers')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (hackerData) {
          // Fetch hacker stats
          const { data: stats } = await supabase
            .from('hacker_stats')
            .select('*')
            .eq('hacker_id', hackerData.id)
            .single();
          
          // Map hacker data to user format - only use actual data from database
          setUser({
            id: hackerData.id,
            username: hackerData.name || hackerData.github_username || 'Unknown',
            email: null,
            avatar_url: hackerData.avatar_url || null,
            wallet_balance: stats?.market_value || 0,
            xp: stats?.overall_rating || 0,
            total_predictions: 0,
            correct_predictions: 0,
            bio: hackerData.bio || null,
            headline: null,
            location: hackerData.location || null,
            linkedin_url: hackerData.linkedin_url || null,
            github_url: hackerData.github_username ? `https://github.com/${hackerData.github_username}` : null,
            portfolio_url: hackerData.website || null,
            skills: stats ? [
              { name: 'Technical Skill', level: stats.technical_skill },
              { name: 'Innovation', level: stats.innovation },
              { name: 'Hackathon Experience', level: stats.hackathon_experience },
            ] : [],
            experience: [],
            education: [],
            projects: [],
            certifications: [],
          });
        } else {
          console.error('User not found in users or hackers table');
        }
      }

      // Check for shared teams
      if (currentUser?.id && userId) {
        const shared = await checkSharedTeams(currentUser.id, userId);
        setHasSharedTeam(shared);
      }

      // Track profile view
      if (currentUser?.id && currentUser.id !== userId) {
        trackView(currentUser.id);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [userId, currentUser, trackView]);

  // Check if we just connected LinkedIn and need to import profile data
  useEffect(() => {
    const checkAndImportLinkedIn = async () => {
      console.log('Checking LinkedIn import...', { currentUser, isOwnProfile, hasUser: !!user });
      
      if (!currentUser || !isOwnProfile || !user) {
        console.log('Skipping LinkedIn check - not own profile, no current user, or user data not loaded');
        return;
      }

      try {
        // Check if LinkedIn is connected but profile is not populated
        const { data: { user: authUser } } = await supabase.auth.getUser();
        console.log('Auth user:', authUser);
        
        const linkedInIdentity = authUser?.identities?.find(
          identity => identity.provider === 'linkedin_oidc' || identity.provider === 'linkedin'
        );
        
        console.log('LinkedIn identity:', linkedInIdentity);
        console.log('Profile data:', { bio: user?.bio, experience: user?.experience?.length });

        // If LinkedIn is connected but we have no profile data yet
        if (linkedInIdentity && (!user?.bio || !user?.experience || user?.experience?.length === 0)) {
          console.log('LinkedIn connected but profile not populated - starting import');
          setIsImportingLinkedIn(true);
          
          // Try to get LinkedIn URL from metadata
          const linkedinUrl = authUser?.user_metadata?.sub || 
                             authUser?.user_metadata?.issuer || 
                             authUser?.user_metadata?.profile_url;
          
          console.log('LinkedIn URL from metadata:', linkedinUrl);

          if (linkedinUrl && linkedinUrl.includes('linkedin.com')) {
            console.log('Calling Clado API with URL:', linkedinUrl);
            
            // Call Clado API to scrape LinkedIn profile
            const { data, error } = await supabase.functions.invoke('import-linkedin-profile', {
              body: { linkedinUrl },
            });

            console.log('Clado API response:', { data, error });

            if (error) {
              console.error('Clado API error:', error);
              toast.error("Failed to import LinkedIn profile: " + (error.message || 'Unknown error'));
            } else if (data?.profile) {
              console.log('Profile data received from Clado:', data.profile);
              // Update user profile with scraped data
              const { error: updateError } = await supabase
                .from('users')
                .update({
                  name: data.profile.name,
                  bio: data.profile.bio,
                  headline: data.profile.headline,
                  location: data.profile.location,
                  linkedin_url: linkedinUrl,
                  portfolio_url: data.profile.portfolio_url,
                  skills: data.profile.skills,
                  experience: data.profile.experience,
                  education: data.profile.education,
                  years_of_experience: data.profile.years_of_experience,
                  certifications: data.profile.certifications,
                })
                .eq('id', currentUser.id);

              if (updateError) {
                console.error('Error updating profile:', updateError);
                toast.error("Failed to save profile data");
              } else {
                console.log('Profile updated successfully with LinkedIn data');
                toast.success("LinkedIn profile imported successfully!");
                
                // Refresh user data
                const { data: updatedUser } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', currentUser.id)
                  .single();
                
                if (updatedUser) {
                  setUser(updatedUser as User);
                }
              }
            }
          } else {
            toast.error("Could not extract LinkedIn profile URL");
          }
          
          setIsImportingLinkedIn(false);
        }
      } catch (error) {
        console.error('Error checking LinkedIn import:', error);
        setIsImportingLinkedIn(false);
      }
    };

    checkAndImportLinkedIn();
  }, [currentUser, isOwnProfile, user?.id, user?.bio, user?.experience]);

  const accuracyRate = user && user.total_predictions > 0
    ? ((user.correct_predictions / user.total_predictions) * 100).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8">
            <Skeleton className="h-48 w-full mb-8" />
            <Skeleton className="h-96 w-full" />
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-8">
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">User not found</p>
              <Button onClick={() => navigate('/leaderboard')} className="mt-4">
                Back to Leaderboard
              </Button>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/leaderboard" className="hover:text-foreground">Leaderboard</Link>
            <span>/</span>
            <span className="text-foreground">{user.username}</span>
          </div>

          {/* Importing LinkedIn Data Banner */}
          {isImportingLinkedIn && (
            <Card className="p-4 mb-6 bg-primary/10 border-primary/20">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <div>
                  <p className="font-medium text-primary">Importing LinkedIn Profile...</p>
                  <p className="text-sm text-muted-foreground">
                    We're populating your profile with information from your LinkedIn account
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Header Section */}
          <Card className="p-8 mb-8">
            <div className="flex items-start gap-6">
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                <AvatarImage src={user.avatar_url} alt={user.username} />
                <AvatarFallback className="text-4xl">{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
                    {user.headline && (
                      <p className="text-lg text-muted-foreground mb-2">{user.headline}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      {user.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {user.location}
                        </span>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="flex flex-wrap gap-2">
                      {user.linkedin_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {user.github_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={user.github_url} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {user.portfolio_url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={user.portfolio_url} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      {user.email && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={`mailto:${user.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {currentUser && currentUser.id !== user.id && (
                      <Button onClick={() => setInviteModalOpen(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite to Team
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => navigate(-1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <StatsCard
                title="XP"
                value={user.xp}
                icon={Trophy}
              />
              <StatsCard
                title="Wallet Balance"
                value={`${user.wallet_balance} HC`}
                icon={Wallet}
              />
              <StatsCard
                title="Total Predictions"
                value={user.total_predictions}
                icon={TrendingUp}
              />
              <StatsCard
                title="Accuracy Rate"
                value={`${accuracyRate}%`}
                icon={Target}
              />
            </div>
          </Card>

          {/* Main Content */}
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                  <TabsTrigger value="history">Betting History</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Bio Section */}
                  {canViewSection(user.privacy_settings, 'bio', hasSharedTeam, isOwnProfile) ? (
                    isImportingLinkedIn ? (
                      <Card className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <div className="h-1 w-8 bg-primary rounded" />
                          About
                        </h3>
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-3/4" />
                        </div>
                      </Card>
                    ) : (
                      user.bio && (
                      <Card className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <div className="h-1 w-8 bg-primary rounded" />
                          About
                        </h3>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                                  {user.bio}
                      </p>
                    </Card>
                    )
                    )
                  ) : (
                    <Card className="p-6 text-center">
                      <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">This section is private</p>
                    </Card>
                  )}

                  {/* Skills Section */}
                  {canViewSection(user.privacy_settings, 'skills', hasSharedTeam, isOwnProfile) ? (
                    user.skills && user.skills.length > 0 && (
                      <Card className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <div className="h-1 w-8 bg-primary rounded" />
                          Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {user.skills.map((skill: any, index: number) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    )
                  ) : null}

                  {/* Projects Section */}
                  {canViewSection(user.privacy_settings, 'projects', hasSharedTeam, isOwnProfile) ? (
                    user.projects && user.projects.length > 0 && (
                      <Card className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <div className="h-1 w-8 bg-primary rounded" />
                          Projects
                        </h3>
                        <div className="space-y-4">
                          {user.projects.map((project: any, index: number) => (
                            <div
                              key={index}
                              className="p-4 border-l-4 border-primary/50 bg-muted/30 rounded-r-lg hover:bg-muted/50 transition-colors"
                            >
                              <h4 className="font-bold text-lg">{project.title}</h4>
                              <p className="text-sm text-muted-foreground mt-2">
                                {project.description}
                              </p>
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
                    )
                  ) : null}

                  {/* Statistics */}
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">Statistics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Correct Predictions</p>
                        <p className="text-2xl font-bold text-green-500">{user.correct_predictions}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Incorrect Predictions</p>
                        <p className="text-2xl font-bold text-red-500">
                          {user.total_predictions - user.correct_predictions}
                        </p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                {/* Professional Timeline Tab */}
                <TabsContent value="professional" className="space-y-6">
                  {/* Work Experience */}
                  {canViewSection(user.privacy_settings, 'experience', hasSharedTeam, isOwnProfile) ? (
                    isImportingLinkedIn ? (
                      <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <Briefcase className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">Work Experience</h3>
                        </div>
                        <div className="space-y-4">
                          <Skeleton className="h-32 w-full" />
                          <Skeleton className="h-32 w-full" />
                        </div>
                      </Card>
                    ) : (
                      user.experience && user.experience.length > 0 && (
                      <Card className="p-6">
                        <h3 className="font-semibold mb-6 flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-primary" />
                          Work Experience
                        </h3>
                        <div className="space-y-6">
                          {user.experience.map((exp: any, index: number) => (
                            <div
                              key={index}
                              className="relative pl-8 pb-6 border-l-2 border-primary/30 last:border-transparent last:pb-0"
                            >
                              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                              <div>
                                <h4 className="font-bold text-lg">{exp.title}</h4>
                                <p className="text-sm font-medium text-muted-foreground mt-1">
                                  {exp.company}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {exp.startDate} - {exp.endDate || 'Present'}
                                </p>
                                {exp.description && (
                                  <p className="text-sm mt-3 leading-relaxed">{exp.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                      )
                    )
                  ) : (
                    <Card className="p-6 text-center">
                      <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Work experience is private</p>
                    </Card>
                  )}

                  {/* Education */}
                  {canViewSection(user.privacy_settings, 'education', hasSharedTeam, isOwnProfile) ? (
                    user.education && user.education.length > 0 && (
                      <Card className="p-6">
                        <h3 className="font-semibold mb-6 flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-primary" />
                          Education
                        </h3>
                        <div className="space-y-4">
                          {user.education.map((edu: any, index: number) => (
                            <div key={index} className="p-4 bg-muted/30 rounded-lg">
                              <h4 className="font-bold">{edu.degree}</h4>
                              <p className="text-sm font-medium text-muted-foreground mt-1">
                                {edu.institution}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">{edu.year}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )
                  ) : null}

                  {/* Certifications */}
                  {user.certifications && user.certifications.length > 0 && (
                    <Card className="p-6">
                      <h3 className="font-semibold mb-6 flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Certifications
                      </h3>
                      <div className="space-y-3">
                        {user.certifications.map((cert: any, index: number) => (
                          <div
                            key={index}
                            className="flex justify-between items-start p-3 bg-muted/30 rounded-lg"
                          >
                            <div>
                              <h4 className="font-bold">{cert.name}</h4>
                              <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                            </div>
                            <span className="text-sm text-muted-foreground font-medium">
                              {cert.date}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="history">
                  {canViewSection(user.privacy_settings, 'betting', hasSharedTeam, isOwnProfile) ? (
                    <UserBettingHistory userId={user.id} />
                  ) : (
                    <Card className="p-12 text-center">
                      <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="font-semibold text-lg mb-2">Betting History is Private</h3>
                      <p className="text-sm text-muted-foreground">
                        This user has chosen to keep their betting history private
                      </p>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="teams">
                  <Card className="p-6">
                    <h3 className="font-semibold mb-6">Team Memberships</h3>
                    <UserTeamsSection memberships={teamMemberships} isOwnProfile={false} />
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                    <span className="font-medium">{accuracyRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total XP</span>
                    <span className="font-medium">{user.xp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Teams</span>
                    <span className="font-medium">{teamMemberships.length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Invite Modal */}
      {user && (
        <InviteToTeamModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          targetUserId={user.id}
          targetUserEmail={user.email}
          targetUsername={user.username}
        />
      )}
    </div>
  );
}
