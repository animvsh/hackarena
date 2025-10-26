import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Linkedin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProfilePreview } from "./ProfilePreview";

interface ProfileData {
  name?: string;
  email?: string;
  bio?: string;
  headline?: string;
  location?: string;
  skills?: Array<{ name: string; level: string }>;
  experience?: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description: string;
    location?: string;
    employment_type?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    start_year?: string;
    gpa?: string;
    field?: string;
  }>;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  years_of_experience?: number;
  certifications?: string[];
  languages?: string[];
  interests?: string[];
  volunteer_experience?: any[];
  publications?: any[];
  projects?: any[];
  awards?: any[];
}

interface ProfileImportProps {
  onComplete: (data: ProfileData, source: string) => void;
}

export const ProfileImport = ({ onComplete }: ProfileImportProps) => {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const provider = urlParams.get('provider');
      
      if (code && provider === 'linkedin_oidc') {
        console.log('Processing LinkedIn OAuth callback...');
        setLoading(true);
        try {
          // Exchange code for session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) throw error;
          
          if (data.session?.user) {
            console.log('LinkedIn OAuth successful, getting user data...');
            
            // Get the stored LinkedIn URL
            const storedLinkedinUrl = localStorage.getItem('linkedin_url_for_import');
            const isOnboarding = localStorage.getItem('onboarding_linkedin');
            
            if (storedLinkedinUrl && isOnboarding) {
              console.log('=== OAUTH CALLBACK: FOUND STORED LINKEDIN URL ===');
              console.log('Stored LinkedIn URL:', storedLinkedinUrl);
              console.log('Is onboarding:', isOnboarding);
              
              // Import LinkedIn profile using Clado
              const profileData = await importLinkedinWithClado(storedLinkedinUrl);
              
              if (profileData) {
                console.log('=== OAUTH CALLBACK: PROFILE IMPORT SUCCESS ===');
                console.log('Profile data received:', profileData);
                toast.success("LinkedIn profile imported successfully!");
                
                // Clean up localStorage
                localStorage.removeItem('linkedin_url_for_import');
                localStorage.removeItem('onboarding_linkedin');
                
                // Complete the onboarding
                onComplete(profileData, 'linkedin');
              } else {
                console.error('=== OAUTH CALLBACK: PROFILE IMPORT FAILED ===');
                console.error('Profile data was null or undefined');
                toast.error("Failed to import LinkedIn profile");
              }
            } else {
              console.log('=== OAUTH CALLBACK: NO STORED URL ===');
              console.log('Stored LinkedIn URL:', storedLinkedinUrl);
              console.log('Is onboarding:', isOnboarding);
              console.log('Redirecting to home...');
              toast.success("LinkedIn connected successfully!");
              
              // Clean up URL parameters and redirect to home
              window.location.href = '/';
            }
          }
        } catch (error) {
          console.error('Error handling OAuth callback:', error);
          toast.error("Failed to connect with LinkedIn");
          setLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const saveProfileToDatabase = async (profileData: ProfileData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      console.log('Saving profile data to database for user:', user.id);
      console.log('Profile data to save:', profileData);

      // Update user profile with scraped data - only update fields that have data
      const updateData: any = {};
      
      if (profileData.bio) updateData.bio = profileData.bio;
      if (profileData.headline) updateData.headline = profileData.headline;
      if (profileData.location) updateData.location = profileData.location;
      if (profileData.linkedin_url) updateData.linkedin_url = profileData.linkedin_url;
      if (profileData.portfolio_url) updateData.portfolio_url = profileData.portfolio_url;
      if (profileData.skills && profileData.skills.length > 0) updateData.skills = profileData.skills;
      if (profileData.experience && profileData.experience.length > 0) updateData.experience = profileData.experience;
      if (profileData.education && profileData.education.length > 0) updateData.education = profileData.education;
      if (profileData.years_of_experience) updateData.years_of_experience = profileData.years_of_experience;
      if (profileData.certifications && profileData.certifications.length > 0) updateData.certifications = profileData.certifications;

      console.log('Update data:', updateData);

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }
      
      console.log('Profile data saved to database successfully');
    } catch (error) {
      console.error('Error saving profile to database:', error);
      throw error;
    }
  };

  const importLinkedinWithClado = async (linkedinUrl: string): Promise<ProfileData | null> => {
    try {
      console.log('=== LINKEDIN IMPORT WITH CLADO STARTED ===');
      console.log('LinkedIn URL:', linkedinUrl);
      console.log('Timestamp:', new Date().toISOString());
      
      const { data, error } = await supabase.functions.invoke('import-linkedin-profile', {
        body: { 
          linkedinUrl
        },
      });

      console.log('=== CLADO API RESPONSE ===');
      console.log('Response data:', data);
      console.log('Response error:', error);
      console.log('Response analysis:', {
        hasData: !!data,
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : [],
        errorMessage: error?.message || 'none'
      });

      if (error) {
        console.error('Clado API error:', error);
        throw error;
      }

      if (data?.profile) {
        console.log('=== PROFILE DATA RECEIVED FROM CLADO ===');
        console.log('Raw profile data:', JSON.stringify(data.profile, null, 2));
        console.log('Profile data analysis:', {
          hasName: !!data.profile.name,
          hasEmail: !!data.profile.email,
          hasBio: !!data.profile.bio,
          hasHeadline: !!data.profile.headline,
          hasLocation: !!data.profile.location,
          hasLinkedinUrl: !!data.profile.linkedin_url,
          hasPortfolioUrl: !!data.profile.portfolio_url,
          skillsCount: data.profile.skills?.length || 0,
          experienceCount: data.profile.experience?.length || 0,
          educationCount: data.profile.education?.length || 0,
          yearsOfExperience: data.profile.years_of_experience,
          certificationsCount: data.profile.certifications?.length || 0
        });
        
        // Save profile data to database
        try {
          console.log('=== SAVING PROFILE TO DATABASE ===');
          await saveProfileToDatabase(data.profile);
          console.log('Profile data saved to database successfully');
        } catch (dbError) {
          console.error('Error saving to database:', dbError);
          // Don't throw here, just log the error and continue
        }
        
        setProfileData(data.profile);
        toast.success("LinkedIn profile imported successfully!");
        return data.profile;
      } else {
        console.error('=== NO PROFILE DATA IN RESPONSE ===');
        console.error('Response data:', data);
        console.error('Expected profile key:', 'profile');
        console.error('Available keys:', data ? Object.keys(data) : 'no data');
        throw new Error('No profile data returned from Clado API');
      }
    } catch (error) {
      console.error('Error importing LinkedIn profile:', error);
      toast.error("Failed to import LinkedIn profile. Please check your LinkedIn URL and try again.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedinContinue = async () => {
    console.log('=== LINKEDIN CONTINUE CLICKED ===');
    console.log('LinkedIn URL entered:', linkedinUrl);
    
    if (!linkedinUrl) {
      console.log('No LinkedIn URL provided');
      toast.error("Please enter your LinkedIn profile URL");
      return;
    }

    // Validate LinkedIn URL format
    const linkedinUrlPattern = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    const isValidUrl = linkedinUrlPattern.test(linkedinUrl);
    console.log('URL validation:', {
      url: linkedinUrl,
      isValid: isValidUrl,
      pattern: linkedinUrlPattern.toString()
    });
    
    if (!isValidUrl) {
      console.log('Invalid LinkedIn URL format');
      toast.error("Please enter a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/your-username)");
      return;
    }

    // Store the LinkedIn URL for later use
    console.log('Storing LinkedIn URL in localStorage:', linkedinUrl);
    localStorage.setItem('linkedin_url_for_import', linkedinUrl);
    
    // Start LinkedIn OAuth flow
    try {
      console.log('=== STARTING LINKEDIN OAUTH FLOW ===');
      setLoading(true);
      
      // Store that we're in the onboarding flow
      localStorage.setItem('onboarding_linkedin', 'true');
      console.log('Set onboarding flag in localStorage');
      
      // Start OAuth flow
      console.log('Initiating Supabase OAuth...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/`,
          scopes: 'openid profile email',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      console.log('OAuth response:', { data, error });
      
      if (error) throw error;
      
      console.log('OAuth initiated successfully, user will be redirected to LinkedIn');
      // The user will be redirected to LinkedIn and then back
    } catch (error) {
      console.error('=== OAUTH INITIATION ERROR ===');
      console.error('Error details:', error);
      toast.error("Failed to connect with LinkedIn");
      setLoading(false);
    }
  };


  const handleConfirm = (source: string) => {
    if (profileData) {
      onComplete(profileData, source);
    }
  };

  if (profileData) {
    return (
      <ProfilePreview
        data={profileData}
        onConfirm={handleConfirm}
        onEdit={setProfileData}
        onBack={() => setProfileData(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Connect with LinkedIn</h2>
        <p className="text-muted-foreground">
          Please connect your LinkedIn account to continue
        </p>
        <p className="text-sm text-primary font-medium">
          LinkedIn connection is required to create your account
        </p>
      </div>

      <Card className="p-6 space-y-4 border-primary/20 bg-primary/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Linkedin className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-primary">Connect with LinkedIn</h3>
            <p className="text-sm text-muted-foreground">
              Enter your LinkedIn profile URL and connect your account
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin-url">LinkedIn Profile URL *</Label>
          <Input
            id="linkedin-url"
            placeholder="https://www.linkedin.com/in/your-username"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            disabled={loading}
            className="border-primary/30 focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            Make sure your LinkedIn profile is public so we can access your information
          </p>
        </div>

        <Button
          onClick={handleLinkedinContinue}
          disabled={loading || !linkedinUrl}
          className="w-full bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white"
          size="lg"
        >
          <Linkedin className="w-5 h-5 mr-2" />
          {loading ? "Connecting..." : "Continue with LinkedIn"}
        </Button>
      </Card>
    </div>
  );
};