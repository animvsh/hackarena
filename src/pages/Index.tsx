import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { BalanceCard } from "@/components/BalanceCard";
import { TopClients } from "@/components/TopClients";
import { RevenueDrivers } from "@/components/RevenueDrivers";
import { AccountGrowthChart } from "@/components/AccountGrowthChart";
import { Target, Share2, Inbox, DollarSign, FileText, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Index = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <Header />

        {/* Latest Statistics */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Latest Statistics</h2>
            <Select defaultValue="14days">
              <SelectTrigger className="w-[160px] bg-secondary border-border">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="14days">Last 14 Days</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={Target}
              label="Reach"
              value="299,039"
              trend={-10}
              iconColor="neon-purple"
            />
            <StatCard
              icon={Share2}
              label="Share"
              value="89,773"
              trend={-4}
              iconColor="neon-blue"
            />
            <StatCard
              icon={Inbox}
              label="Inbox"
              value="18,221"
              trend={11}
              iconColor="neon-pink"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StatCard
              icon={DollarSign}
              label="Revenue"
              value=""
              iconColor="neon-blue"
              highlight
              highlightContent={
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background/10 flex items-center justify-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-background/20"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-info-foreground mb-1">Angga Hosting Affiliates</p>
                    <p className="text-xs text-info-foreground/70">Goal: 18,000 Sign Ups</p>
                  </div>
                </div>
              }
            />
            <StatCard
              icon={FileText}
              label="Invoice"
              value=""
              iconColor="neon-pink"
            />
            <StatCard
              icon={Users}
              label="New Clients"
              value="22,089"
              trend={5}
              iconColor="neon-blue"
            />
          </div>
        </div>

        {/* Charts and Stats Grid */}
        <div className="grid grid-cols-3 gap-6">
          <AccountGrowthChart />
          
          <div className="space-y-6">
            <BalanceCard />
            <TopClients />
            <RevenueDrivers />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
