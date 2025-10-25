import { useState, useEffect, Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Markets from "./pages/Markets";
import Teams from "./pages/Teams";
import TeamSettings from "./pages/TeamSettings";
import Leaderboard from "./pages/Leaderboard";
import RadioPage from "./pages/RadioPage";
import Sponsors from "./pages/Sponsors";
import WalletPage from "./pages/WalletPage";
import BroadcastStream from "./pages/BroadcastStream";
import NotFound from "./pages/NotFound";
import TeamProfile from "./pages/TeamProfile";
import UserProfile from "./pages/UserProfile";
import BetDetail from "./pages/BetDetail";
import TeamInvite from "./pages/TeamInvite";

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
            <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:teamId" element={<ProtectedRoute><TeamProfile /></ProtectedRoute>} />
            <Route path="/teams/:teamId/settings" element={<ProtectedRoute><TeamSettings /></ProtectedRoute>} />
            <Route path="/users/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/radio" element={<RadioPage />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/bets/:betId" element={<ProtectedRoute><BetDetail /></ProtectedRoute>} />
            <Route path="/broadcast" element={<BroadcastStream />} />
            <Route path="/invite/:inviteId" element={<TeamInvite />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
