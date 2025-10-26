import React, { useState, useEffect } from 'react';
import { OnboardingStep } from '../OnboardingStep';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Trophy, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Step04HackathonProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onNext: () => void;
  onBack: () => void;
}

interface Hackathon {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number | null;
  total_participants: number | null;
}

export const Step04Hackathon: React.FC<Step04HackathonProps> = ({
  value,
  onChange,
  onNext,
  onBack,
}) => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    try {
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .in('status', ['active', 'upcoming'])
        .order('start_date', { ascending: true })
        .limit(6);

      if (error) throw error;
      setHackathons(data || []);
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onChange(null);
    onNext();
  };

  return (
    <OnboardingStep
      question="Which hackathon are you participating in?"
      helper="Select the event you're currently attending or planning to join"
      onNext={value ? onNext : undefined}
      onBack={onBack}
      onSkip={handleSkip}
      nextDisabled={!value}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-h-[400px] overflow-y-auto">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))
        ) : hackathons.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-white/60">No active hackathons at the moment</p>
          </div>
        ) : (
          hackathons.map((hackathon) => {
            const isSelected = value === hackathon.id;
            const isLive = hackathon.status === 'active';
            
            return (
              <button
                key={hackathon.id}
                onClick={() => onChange(hackathon.id)}
                className={`p-5 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-[hsl(var(--neon-purple))] bg-[hsl(var(--neon-purple))]/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {hackathon.name}
                  </h3>
                  {isLive && (
                    <span className="px-2 py-1 bg-[hsl(var(--neon-purple))]/20 border border-[hsl(var(--neon-purple))]/30 rounded-full text-xs text-white flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-[hsl(var(--neon-purple))] rounded-full animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm text-white/60">
                  {hackathon.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {hackathon.location}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(hackathon.start_date).toLocaleDateString()}
                  </div>
                  {hackathon.prize_pool && (
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      ${hackathon.prize_pool.toLocaleString()} prize pool
                    </div>
                  )}
                  {hackathon.total_participants && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {hackathon.total_participants} participants
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </OnboardingStep>
  );
};
