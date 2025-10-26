import { lazy, Suspense } from 'react';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '@/components/ui/skeleton';

const UnifiedBroadcastPlayer = lazy(() => 
  import('./broadcast/UnifiedBroadcastPlayer').then(module => ({
    default: module.UnifiedBroadcastPlayer
  }))
);

const BroadcastPlayerSkeleton = () => (
  <div className="w-full aspect-video bg-gradient-to-br from-broadcast-blue/20 to-broadcast-blue-dark/20 border border-border rounded-2xl overflow-hidden">
    <div className="h-full flex items-center justify-center">
      <div className="text-center space-y-4">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  </div>
);

export function LazyBroadcastPlayer() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '200px', // Load when within 200px of viewport
  });

  return (
    <div ref={ref}>
      {inView ? (
        <Suspense fallback={<BroadcastPlayerSkeleton />}>
          <UnifiedBroadcastPlayer />
        </Suspense>
      ) : (
        <BroadcastPlayerSkeleton />
      )}
    </div>
  );
}
