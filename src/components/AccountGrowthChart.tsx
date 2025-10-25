import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const data = [
  { month: "Jan", reach: 280, revenue: 250, clients: 60 },
  { month: "Feb", reach: 320, revenue: 300, clients: 75 },
  { month: "Mar", reach: 380, revenue: 350, clients: 90 },
  { month: "Apr", reach: 420, revenue: 280, clients: 110 },
  { month: "May", reach: 350, revenue: 450, clients: 95 },
  { month: "Jun", reach: 380, revenue: 400, clients: 85 },
  { month: "Jul", reach: 320, revenue: 520, clients: 70 },
  { month: "Aug", reach: 450, revenue: 580, clients: 120 },
];

export const AccountGrowthChart = () => {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold mb-2">Account Growth</h3>
          <div className="flex items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-1"></div>
              <span className="text-muted-foreground">Reach</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-3"></div>
              <span className="text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-info"></div>
              <span className="text-muted-foreground">Clients</span>
            </div>
          </div>
        </div>
        <Select defaultValue="lifetime">
          <SelectTrigger className="w-[140px] bg-secondary border-border">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lifetime">Lifetime</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Bar dataKey="reach" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
          <Bar dataKey="revenue" fill="hsl(var(--chart-3))" radius={[8, 8, 0, 0]} />
          <Bar dataKey="clients" fill="hsl(var(--info))" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Tooltip info */}
      <div className="mt-4 p-4 bg-info/10 rounded-xl border border-info/20">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-success"></div>
          <span className="text-muted-foreground">$50,391 Revenue</span>
          <div className="w-2 h-2 rounded-full bg-chart-1 ml-4"></div>
          <span className="text-muted-foreground">189,309 Reach</span>
          <div className="w-2 h-2 rounded-full bg-info ml-4"></div>
          <span className="text-muted-foreground">82 Clients</span>
        </div>
      </div>
    </div>
  );
};
