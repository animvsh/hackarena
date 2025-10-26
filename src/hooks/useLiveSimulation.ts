import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SimulationStats {
  eventsGenerated: number;
  isRunning: boolean;
  lastUpdate: Date | null;
  eventHistory: SimulationEvent[];
}

export interface SimulationEvent {
  type: string;
  timestamp: Date;
  data: any;
}

export interface SimulationConfig {
  enabled: boolean;
  interval: number; // milliseconds between updates
  hackathonId?: string;
  intensity: 'low' | 'medium' | 'high';
  eventTypes: string[];
}

const DEFAULT_CONFIG: SimulationConfig = {
  enabled: false,
  interval: 15000, // 15 seconds
  hackathonId: undefined,
  intensity: 'medium',
  eventTypes: ['all']
};

export function useLiveSimulation(initialConfig: Partial<SimulationConfig> = {}) {
  const [config, setConfig] = useState<SimulationConfig>({
    ...DEFAULT_CONFIG,
    ...initialConfig
  });

  const [stats, setStats] = useState<SimulationStats>({
    eventsGenerated: 0,
    isRunning: false,
    lastUpdate: null,
    eventHistory: []
  });

  const intervalRef = useRef<number | null>(null);
  const eventsGeneratedRef = useRef(0);

  // Function to trigger the Edge Function
  const triggerSimulation = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('simulate-live-updates', {
        body: {
          hackathonId: config.hackathonId,
          eventTypes: config.eventTypes,
          intensity: config.intensity
        }
      });

      if (error) {
        console.error('Simulation error:', error);
        toast.error('Simulation error: ' + error.message);
        return;
      }

      if (data?.success) {
        const newEvents = data.eventsGenerated || 0;
        eventsGeneratedRef.current += newEvents;

        setStats(prev => ({
          eventsGenerated: eventsGeneratedRef.current,
          isRunning: true,
          lastUpdate: new Date(),
          eventHistory: [
            {
              type: 'simulation_run',
              timestamp: new Date(),
              data: data.events || []
            },
            ...prev.eventHistory.slice(0, 49) // Keep last 50 events
          ]
        }));

        // Show notification for major events
        const whaleBets = data.events?.filter((e: any) => e.whale) || [];
        if (whaleBets.length > 0) {
          toast.success(`🐋 Whale alert! ${whaleBets[0].amount} HC bet placed!`);
        }
      }
    } catch (error: any) {
      console.error('Failed to trigger simulation:', error);
      toast.error('Simulation failed: ' + error.message);
    }
  }, [config]);

  // Start/stop simulation based on enabled flag
  useEffect(() => {
    if (config.enabled) {
      // Initial trigger
      triggerSimulation();

      // Set up interval
      intervalRef.current = window.setInterval(() => {
        triggerSimulation();
      }, config.interval);

      setStats(prev => ({ ...prev, isRunning: true }));

      toast.success(`🎬 Live simulation started (${config.interval / 1000}s interval)`);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setStats(prev => ({ ...prev, isRunning: false }));
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setStats(prev => ({ ...prev, isRunning: false }));
    }
  }, [config.enabled, config.interval, triggerSimulation]);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<SimulationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset stats
  const resetStats = useCallback(() => {
    eventsGeneratedRef.current = 0;
    setStats({
      eventsGenerated: 0,
      isRunning: config.enabled,
      lastUpdate: null,
      eventHistory: []
    });
    toast.info('Simulation stats reset');
  }, [config.enabled]);

  // Manual trigger (useful for testing)
  const manualTrigger = useCallback(async () => {
    toast.info('Manually triggering simulation...');
    await triggerSimulation();
  }, [triggerSimulation]);

  return {
    config,
    stats,
    updateConfig,
    resetStats,
    manualTrigger,
    isRunning: stats.isRunning
  };
}
