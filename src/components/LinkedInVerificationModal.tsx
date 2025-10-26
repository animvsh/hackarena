import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Linkedin, Shield, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LinkedInVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const LinkedInVerificationModal = ({
  open,
  onOpenChange,
  onSuccess
}: LinkedInVerificationModalProps) => {
  const [loading, setLoading] = useState(false);

  const handleVerifyLinkedIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback/linkedin`,
          scopes: 'openid profile email',
        },
      });

      if (error) {
        throw error;
      }

      // OAuth redirect will happen automatically
      toast.info('Redirecting to LinkedIn...');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to connect to LinkedIn: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    toast.info('You can verify your LinkedIn account later from your profile settings');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <DialogTitle className="text-xl">Verify Your Identity</DialogTitle>
          </div>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              Connect your LinkedIn account to verify your professional identity and
              automatically populate your profile.
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Auto-fill your bio, skills, experience, and education
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Get a verified badge on your profile
                </span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  Build trust with other hackathon participants
                </span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">
                  We only access public profile information
                </span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Skip for now
          </Button>
          <Button
            type="button"
            onClick={handleVerifyLinkedIn}
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <Linkedin className="w-4 h-4 mr-2" />
                Verify with LinkedIn
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
