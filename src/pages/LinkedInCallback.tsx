import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOAuthCallback } from "@/hooks/useOAuthCallback";
import { Loader2 } from "lucide-react";

export default function LinkedInCallback() {
  const navigate = useNavigate();

  // This hook will handle the OAuth callback
  useOAuthCallback();

  useEffect(() => {
    // Wait a bit for the OAuth callback to complete, then redirect
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-semibold">Connecting your LinkedIn account...</h2>
        <p className="text-muted-foreground">
          Please wait while we import your profile data
        </p>
      </div>
    </div>
  );
}
