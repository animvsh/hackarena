import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  TrendingUp,
  Users2,
  Trophy,
  BarChart3,
  Wallet,
  Radio,
  Settings,
  LogOut,
  Activity,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { icon: Home, label: "Dashboard", route: "/" },
  { icon: TrendingUp, label: "Markets", route: "/markets" },
  { icon: Users2, label: "Teams", route: "/teams" },
  { icon: Trophy, label: "Hackathons", route: "/hackathons" },
  { icon: BarChart3, label: "Leaderboard", route: "/leaderboard" },
  { icon: Wallet, label: "Wallet", route: "/wallet" },
  { icon: Radio, label: "Live Radio", route: "/radio" },
];

export const NavigationSidebar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-slate-medium border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-neon-green rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-background" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">HackArena</h1>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
              <span>LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.route}
            to={item.route}
            end={item.route === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-neon-green/10 text-neon-green font-medium"
                  : "text-muted-foreground hover:bg-slate-light hover:text-foreground"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <Separator className="bg-border" />

      {/* User Profile */}
      {user && profile && (
        <div className="p-4 space-y-3">
          <NavLink
            to="/profile"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-light transition-colors"
          >
            <Avatar className="w-10 h-10 border-2 border-neon-green/30">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-neon-green/20 text-neon-green">
                {profile.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile.username || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.wallet_balance?.toLocaleString() || 0} HC
              </p>
            </div>
          </NavLink>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => navigate("/profile/edit")}
            >
              <Settings className="w-3.5 h-3.5 mr-1.5" />
              Settings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-xs text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
};
