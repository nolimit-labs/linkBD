import { useFollowerCounts } from '@/api/followers';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface FollowStatsProps {
  userId?: string;
  organizationId?: string;
  className?: string;
  showLabels?: boolean;
  clickable?: boolean;
}

export function FollowStats({
  userId,
  organizationId,
  className,
  showLabels = true
}: FollowStatsProps) {
  // Query follower counts using the API hook
  const { data: counts, isLoading } = useFollowerCounts(userId, organizationId);
  
  console.log('counts', counts);

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-20" />
      </div>
    );
  }

  const followersCount = counts?.followersCount || 0;
  const followingCount = counts?.followingCount || 0;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex items-center gap-1">
        <span className="font-semibold">{formatCount(followersCount)}</span>
        {showLabels && (
          <span className="text-muted-foreground">followers</span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <span className="font-semibold">{formatCount(followingCount)}</span>
        {showLabels && (
          <span className="text-muted-foreground">following</span>
        )}
      </div>
    </div>
  );
}
