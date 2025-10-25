import { Tv, TrendingUp, Users, BarChart3, Trophy, Wallet, Settings, LogOut, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { icon: Tv, label: "Dashboard", route: "/" },
  { icon: TrendingUp, label: "Markets", route: "/markets" },
  { icon: Users, label: "Teams", route: "/teams" },
  { icon: BarChart3, label: "Leaderboard", route: "/leaderboard" },
  { icon: User, label: "My Profile", route: "/profile" },
  { icon: Trophy, label: "Sponsors", route: "/sponsors" },
  { icon: Wallet, label: "My Wallet", route: "/wallet" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };
  
  return (
    <aside className="w-64 bg-card border-r border-border p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          <span className="text-primary">HackCast</span>
          <span className="text-muted-foreground text-sm ml-2">LIVE</span>
        </h1>
      </div>

      {/* User Profile */}
      {user && profile && (
        <div 
          className="mb-6 p-4 bg-secondary rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={() => navigate('/profile')}
        >
          <div className="flex items-center gap-3">
            <Avatar className="border-2 border-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {profile.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate text-sm">{profile.username}</p>
              <div className="flex gap-1 mt-1">
                {profile.roles.map(role => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.route;
          return (
            <Link
              key={index}
              to={item.route}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="mt-6 space-y-2">
        {user ? (
          <>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <Link 
            to="/auth"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium text-sm"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* HackCast Info */}
      <div className="mt-6 bg-gradient-to-br from-primary/10 to-neon-blue/10 rounded-2xl p-6 relative overflow-hidden border border-primary/20">
        <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-destructive">BROADCASTING</span>
          </div>
          <h3 className="font-bold text-sm mb-1">ESPN for Hackathons</h3>
          <p className="text-xs text-muted-foreground">
            Real-time predictions & AI commentary
          </p>
        </div>
      </div>
    </aside>
  );
};
