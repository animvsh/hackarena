import { Search, Bell, User, Wallet, Settings, LogOut, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "./NotificationCenter";
import { UserSearch } from "@/components/search/UserSearch";
import hackcastLogo from "@/assets/hackcast-logo.png";

export const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <img src={hackcastLogo} alt="HackCast LIVE" className="h-12" />
          <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 rounded-full glass">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-destructive">BROADCASTING</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">Real-time hackathon predictions & AI commentary</p>
      </div>

      <div className="flex items-center gap-4">
        <UserSearch />
        
        {user && <NotificationCenter />}
        
        {user && profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="text-right">
                  <p className="text-sm font-semibold">{profile.username}</p>
                  <p className="text-xs text-muted-foreground capitalize">{profile.roles[0] || 'User'}</p>
                </div>
                <Avatar className="w-10 h-10 border-2 border-primary/20">
                  <AvatarImage src={profile.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {profile.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile/edit')}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/wallet')}>
                <Wallet className="mr-2 h-4 w-4" />
                Wallet
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate('/auth')} variant="outline" size="sm">
              Sign In
            </Button>
            <Button onClick={() => navigate('/auth')} size="sm">
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
