import { Home, MessageCircle, Users, Calendar, BarChart3, Star, Settings, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: Home, label: "Overview", active: true },
  { icon: MessageCircle, label: "Messages", badge: "8" },
  { icon: Users, label: "Clients" },
  { icon: Calendar, label: "Content Planner" },
  { icon: BarChart3, label: "Bot Analytics", badge: "NEW", badgeVariant: "info" as const },
  { icon: Star, label: "Testimonials" },
];

export const Sidebar = () => {
  return (
    <aside className="w-[220px] bg-card border-r border-border flex flex-col p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <div className="w-5 h-5 bg-foreground rounded-sm transform rotate-45"></div>
        </div>
        <span className="text-xl font-bold">kreatop</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              item.active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <Badge 
                variant={item.badgeVariant === "info" ? "default" : "secondary"}
                className={item.badgeVariant === "info" ? "bg-info text-info-foreground" : "bg-info text-info-foreground"}
              >
                {item.badge}
              </Badge>
            )}
          </button>
        ))}

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <Settings className="w-4 h-4" />
          <span className="flex-1 text-left">Settings</span>
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="flex-1 text-left">Logout</span>
        </button>
      </nav>

      {/* Upgrade Section */}
      <div className="mt-auto pt-6">
        <div className="bg-secondary rounded-2xl p-6 text-center">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-foreground rounded transform rotate-45"></div>
          </div>
          <h3 className="font-bold text-sm mb-2">Kreto AI Ready to Help You Grow.</h3>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4">
            Upgrade Now
          </Button>
        </div>
      </div>
    </aside>
  );
};
