import { useState, useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EnhancedChatWidget } from "@/components/chat/EnhancedChatWidget";
import { SplashScreen } from "@/components/SplashScreen";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load all pages for code splitting and faster initial load
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Markets = lazy(() => import("./pages/Markets"));
const Hackathons = lazy(() => import("./pages/Hackathons"));
const HackathonTeams = lazy(() => import("./pages/HackathonTeams"));
const HackathonTeamSetup = lazy(() => import("./pages/HackathonTeamSetup"));
const Teams = lazy(() => import("./pages/Teams"));
const TeamSettings = lazy(() => import("./pages/TeamSettings"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const RadioPage = lazy(() => import("./pages/RadioPage"));
const Sponsors = lazy(() => import("./pages/Sponsors"));
const WalletPage = lazy(() => import("./pages/WalletPage"));
const BroadcastStream = lazy(() => import("./pages/BroadcastStream"));
const NotFound = lazy(() => import("./pages/NotFound"));
const TeamProfile = lazy(() => import("./pages/TeamProfile"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const BetDetail = lazy(() => import("./pages/BetDetail"));
const TeamInvite = lazy(() => import("./pages/TeamInvite"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const ProfileEdit = lazy(() => import("./pages/ProfileEdit"));
const LinkedInCallback = lazy(() => import("./pages/LinkedInCallback"));
const GitHubCallback = lazy(() => import("./pages/GitHubCallback"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-background">
    <div className="w-full max-w-4xl space-y-4">
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-3 gap-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    const currentPath = window.location.pathname;
    // Skip splash on broadcast page or if already visited
    return !hasVisited && currentPath !== '/broadcast';
  });

  const handleSplashComplete = () => {
    localStorage.setItem('hasVisited', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/hackathons" element={<Hackathons />} />
                <Route path="/hackathons/:hackathonId/markets" element={<Markets />} />
                <Route path="/hackathons/:hackathonId/broadcast" element={<BroadcastStream />} />
                <Route path="/hackathons/:hackathonId/teams" element={<ProtectedRoute><HackathonTeams /></ProtectedRoute>} />
                <Route path="/hackathons/:hackathonId/teams/new" element={<ProtectedRoute><HackathonTeamSetup /></ProtectedRoute>} />
                <Route path="/markets" element={<Markets />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/teams/:teamId" element={<ProtectedRoute><TeamProfile /></ProtectedRoute>} />
                <Route path="/teams/:teamId/settings" element={<ProtectedRoute><TeamSettings /></ProtectedRoute>} />
                <Route path="/users/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
                <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/radio" element={<RadioPage />} />
                <Route path="/sponsors" element={<Sponsors />} />
                <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
                <Route path="/broadcast" element={<BroadcastStream />} />
                <Route path="/bets/:betId" element={<ProtectedRoute><BetDetail /></ProtectedRoute>} />
                <Route path="/invite/:inviteId" element={<TeamInvite />} />
                <Route path="/auth/callback/linkedin" element={<LinkedInCallback />} />
                <Route path="/auth/callback/github" element={<GitHubCallback />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <EnhancedChatWidget />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
