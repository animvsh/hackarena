import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { UserWallet } from "@/components/UserWallet";
import { TrendingTeams } from "@/components/TrendingTeams";
import { RevenueDrivers } from "@/components/RevenueDrivers";
import { LiveMarketChart } from "@/components/LiveMarketChart";
import { LiveCommentaryTicker } from "@/components/LiveCommentaryTicker";
import { Users, TrendingUp, Zap, Trophy, Radio, BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <Header />

        {/* Live Statistics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Live Hackathon Metrics</h2>
            <Select defaultValue="current">
              <SelectTrigger className="w-[200px] bg-secondary border-border">
                <SelectValue placeholder="Hackathon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Hackathon</SelectItem>
                <SelectItem value="past">Past Events</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={Users}
              label="Active Teams"
              value="42"
              trend={15}
              iconColor="neon-purple"
            />
            <StatCard
              icon={TrendingUp}
              label="Commits / Hour"
              value="127"
              trend={8}
              iconColor="neon-blue"
            />
            <StatCard
              icon={Zap}
              label="Markets Open"
              value="8"
              iconColor="neon-pink"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={Trophy}
              label="Featured Track"
              value=""
              iconColor="neon-blue"
              highlight
              highlightContent={
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background/10 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-info-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-info-foreground mb-1">Claude AI Track</p>
                    <p className="text-xs text-info-foreground/70">12 Teams • $10K Prize</p>
                  </div>
                </div>
              }
            />
            <StatCard
              icon={BarChart3}
              label="Predictions Made"
              value="1,247"
              trend={23}
              iconColor="neon-pink"
            />
            <StatCard
              icon={Radio}
              label="Commentary Events"
              value="89"
              trend={12}
              iconColor="neon-blue"
            />
          </div>
        </div>

        {/* Charts and Stats Grid */}
        <div className="grid grid-cols-3 gap-6 mb-20">
          <LiveMarketChart />
          
          <div className="space-y-6">
            <UserWallet />
            <TrendingTeams />
            <RevenueDrivers />
          </div>
        </div>

        {/* Live Commentary Ticker */}
        <LiveCommentaryTicker />
      </main>
    </div>
  );
};

export default Index;
