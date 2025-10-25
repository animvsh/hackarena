import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface OddsChartProps {
  data: Array<{
    timestamp: string;
    odds: number;
    volume: number;
  }>;
  betOdds: number;
  betTimestamp: string;
}

export function OddsChart({ data, betOdds, betTimestamp }: OddsChartProps) {
  const currentOdds = data[data.length - 1]?.odds || betOdds;
  const highestOdds = Math.max(...data.map(d => d.odds));
  const lowestOdds = Math.min(...data.map(d => d.odds));
  const avgOdds = data.reduce((sum, d) => sum + d.odds, 0) / data.length;
  const oddsChange = ((currentOdds - betOdds) / betOdds * 100);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Odds Movement</h3>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Your Odds</p>
            <p className="text-xl font-bold">{betOdds.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Odds</p>
            <p className="text-xl font-bold">{currentOdds.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Change</p>
            <p className={`text-xl font-bold ${oddsChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {oddsChange >= 0 ? '+' : ''}{oddsChange.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-xl font-bold">{avgOdds.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="timestamp" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={(value) => format(new Date(value), 'HH:mm')}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={[Math.max(0, lowestOdds - 5), Math.min(100, highestOdds + 5)]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
            labelFormatter={(value) => format(new Date(value), 'PPp')}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Odds']}
          />
          <ReferenceLine 
            y={betOdds} 
            stroke="hsl(var(--primary))" 
            strokeDasharray="5 5"
            label={{ value: 'Your Bet', position: 'right' }}
          />
          <Line 
            type="monotone" 
            dataKey="odds"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-muted/50 rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Highest Odds</p>
          <p className="text-lg font-semibold">{highestOdds.toFixed(2)}%</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Lowest Odds</p>
          <p className="text-lg font-semibold">{lowestOdds.toFixed(2)}%</p>
        </div>
      </div>
    </Card>
  );
}
