import { motion } from 'framer-motion';
import { Clock, Users, DollarSign, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export function InfoBar() {
  const [time, setTime] = useState(new Date());
  const [viewers, setViewers] = useState(1247);
  const [poolAmount, setPoolAmount] = useState(45678);
  const [activeTeams, setActiveTeams] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Simulate live stats changes
    const statsInterval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 10 - 3));
      setPoolAmount(prev => prev + Math.floor(Math.random() * 500));
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(statsInterval);
    };
  }, []);

  const stats = [
    {
      icon: Clock,
      label: 'LIVE',
      value: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      color: 'text-destructive',
    },
    {
      icon: Users,
      label: 'TEAMS',
      value: activeTeams.toString(),
      color: 'text-primary',
    },
    {
      icon: DollarSign,
      label: 'POOL',
      value: `$${poolAmount.toLocaleString()}`,
      color: 'text-accent',
    },
    {
      icon: TrendingUp,
      label: 'VIEWERS',
      value: viewers.toLocaleString(),
      color: 'text-success',
    },
  ];

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', bounce: 0.3 }}
      className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-card/95 via-card/90 to-transparent backdrop-blur-md border-b border-border/50"
    >
      <div className="flex items-center justify-between px-6 py-2">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 + index * 0.1 }}
            className="flex items-center gap-2"
          >
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground font-mono">
                {stat.label}
              </span>
              <motion.span
                key={stat.value}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className={`text-sm font-bold ${stat.color}`}
              >
                {stat.value}
              </motion.span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
