import { Tv, TrendingUp, Users, BarChart3, Radio, Trophy, Wallet, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Tv, label: "Live Broadcast", route: "/", badge: "LIVE" },
  { icon: TrendingUp, label: "Markets", route: "/markets" },
  { icon: Users, label: "Teams", route: "/teams" },
  { icon: BarChart3, label: "Leaderboard", route: "/leaderboard" },
  { icon: Radio, label: "Commentary", route: "/radio" },
  { icon: Trophy, label: "Sponsors", route: "/sponsors" },
  { icon: Wallet, label: "My Wallet", route: "/wallet" },
];

export const Sidebar = () => {
  const location = useLocation();
  
  return (
    <aside className="w-64 bg-card border-r border-border p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          <span className="text-primary">HackCast</span>
          <span className="text-muted-foreground text-sm ml-2">LIVE</span>
        </h1>
      </div>

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
              {item.badge && (
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                  item.badge === "LIVE" 
                    ? "bg-destructive text-destructive-foreground animate-pulse" 
                    : "bg-primary/20 text-primary"
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="mt-6 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
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
