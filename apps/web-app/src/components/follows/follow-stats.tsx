import { useFollowerCounts } from '@/api/followers';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { Link } from '@tanstack/react-router';
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
  showLabels = true,
  clickable = true
}: FollowStatsProps) {
  // Query follower counts using the API hook
  const { data: counts, isLoading } = useFollowerCounts(userId, organizationId);

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
        {userId && <Skeleton className="h-5 w-20" />}
      </div>
    );
  }

  const followersCount = counts?.followersCount || 0;
  const followingCount = counts?.followingCount || 0;
  const targetId = userId || organizationId;
  const isOrganization = !!organizationId;

  const FollowerStat = ({ count, label }: { count: number; label: string }) => {
    const content = (
      <div className="flex items-center gap-1">
        <span className="font-semibold">{formatCount(count)}</span>
        {showLabels && (
          <span className="text-muted-foreground">{label}</span>
        )}
      </div>
    );

    if (clickable && targetId) {
      // For organizations, followers link goes to profile, following has its own page
      // For users, both have dedicated pages under profile
      const route = isOrganization
        ? (label === 'followers' ? '/profile/$id' : '/organizations/$id/following')
        : (label === 'followers' ? '/profile/$id/followers' : '/profile/$id/following');
      
      return (
        <Link
          to={route}
          params={{ id: targetId }}
          className="hover:underline"
        >
          {content}
        </Link>
      );
    }

    return content;
  };

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <FollowerStat count={followersCount} label="followers" />
      {targetId && (
        <FollowerStat count={followingCount} label="following" />
      )}
    </div>
  );
}

interface CompactFollowStatsProps {
  userId?: string;
  organizationId?: string;
  className?: string;
}

export function CompactFollowStats({
  userId,
  organizationId,
  className
}: CompactFollowStatsProps) {
  // Query follower counts using the API hook
  const { data: counts, isLoading } = useFollowerCounts(userId, organizationId);

  if (isLoading) {
    return <Skeleton className="h-4 w-12" />;
  }

  const followersCount = counts?.followersCount || 0;

  return (
    <div className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}>
      <Users className="h-3 w-3" />
      <span>{followersCount}</span>
    </div>
  );
}