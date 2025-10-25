import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileViewsCardProps {
  userId: string;
}

export function ProfileViewsCard({ userId }: ProfileViewsCardProps) {
  const [viewsData, setViewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    fetchViewsData();
  }, [userId]);

  const fetchViewsData = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data, error } = await supabase
        .from('profile_views')
        .select('viewed_at')
        .eq('profile_user_id', userId)
        .gte('viewed_at', thirtyDaysAgo.toISOString())
        .order('viewed_at', { ascending: true });

      if (error) throw error;

      // Group views by date
      const viewsByDate: { [key: string]: number } = {};
      data?.forEach((view) => {
        const date = new Date(view.viewed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        viewsByDate[date] = (viewsByDate[date] || 0) + 1;
      });

      const chartData = Object.entries(viewsByDate).map(([date, count]) => ({
        date,
        views: count,
      }));

      setViewsData(chartData);
      setTotalViews(data?.length || 0);
    } catch (error) {
      console.error('Error fetching views data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="text-xl font-bold">Profile Views</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{totalViews}</p>
          <p className="text-xs text-muted-foreground">Last 30 days</p>
        </div>
      </div>

      {viewsData.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={viewsData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No views yet
        </div>
      )}
    </Card>
  );
}
