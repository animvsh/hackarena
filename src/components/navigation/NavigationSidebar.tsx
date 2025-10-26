import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Calendar, 
  Trophy,
  Wallet,
  Radio,
  Settings,
  Coins
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', gradient: 'from-purple-500 to-pink-500' },
  { icon: TrendingUp, label: 'Markets', path: '/markets', gradient: 'from-cyan-500 to-blue-500' },
  { icon: Users, label: 'Teams', path: '/teams', gradient: 'from-orange-500 to-red-500' },
  { icon: Calendar, label: 'Hackathons', path: '/hackathons', gradient: 'from-pink-500 to-purple-500' },
  { icon: Trophy, label: 'Leaderboard', path: '/leaderboard', gradient: 'from-green-500 to-teal-500' },
  { icon: Wallet, label: 'Wallet', path: '/wallet', gradient: 'from-yellow-500 to-orange-500' },
  { icon: Radio, label: 'Broadcast', path: '/radio', gradient: 'from-blue-500 to-cyan-500' },
];

export const NavigationSidebar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-0 top-0 h-screen w-20 bg-slate-medium/50 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-6 z-50">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-12 h-12 bg-gradient-purple-pink rounded-2xl flex items-center justify-center shadow-lg shadow-neon-purple/30">
            <Trophy className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-4 w-full px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 ${
                        isActive
                          ? 'bg-white/10 shadow-lg'
                          : 'hover:bg-white/5'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <div className={`w-10 h-10 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isActive ? 'shadow-lg' : ''}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-medium border-white/20">
                  <p className="font-medium">{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* User Profile */}
        {user && profile && (
          <div className="mt-auto w-full px-3 space-y-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="w-14 h-14 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center group"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-medium border-white/20">
                <p className="font-medium">Settings</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate('/my-profile')}
                  className="relative w-14 h-14 rounded-2xl hover:bg-white/5 transition-all flex items-center justify-center group"
                >
                  <Avatar className="w-12 h-12 border-2 border-white/20 group-hover:border-white/40 transition-all">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-purple-pink text-white font-bold">
                      {profile.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 flex items-center gap-1 px-1.5 py-0.5 bg-gradient-cyan-green rounded-full text-[10px] font-bold text-white shadow-lg">
                    <Coins className="w-2.5 h-2.5" />
                    <span>{(profile.wallet_balance || 0) > 999 ? `${Math.floor((profile.wallet_balance || 0) / 1000)}k` : profile.wallet_balance || 0}</span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-medium border-white/20">
                <p className="font-medium">{profile.username || 'User'}</p>
                <p className="text-xs text-muted-foreground">{profile.wallet_balance?.toLocaleString() || 0} HC</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
};
