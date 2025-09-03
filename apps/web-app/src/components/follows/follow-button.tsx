import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useFollowStatus, useFollow } from '@/api/followers';
import { useSession } from '@/lib/auth-client';
import { Loader2, UserCheck, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  targetId: string;
  targetType: 'user' | 'organization';
  initialFollowing?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  onFollowChange?: (following: boolean) => void;
}

export function FollowButton({
  targetId,
  targetType,
  initialFollowing = false,
  variant = 'outline',
  size = 'sm',
  className,
  showIcon = true,
  onFollowChange
}: FollowButtonProps) {
  const { data: session } = useSession();
  const [optimisticFollowing, setOptimisticFollowing] = useState<boolean | null>(null);

  // Don't show follow button for self
  if (session?.user.id === targetId && targetType === 'user') {
    return null;
  }

  // Query follow status using the API hook
  const { data: followStatus } = useFollowStatus(targetType, targetId);

  // Follow/unfollow mutation
  const followMutation = useFollow();

  const isFollowing = optimisticFollowing ?? followStatus?.isFollowing ?? initialFollowing;
  const isLoading = followMutation.isPending;

  const handleClick = () => {
    if (!session) return;
    
    const action = isFollowing ? 'unfollow' : 'follow';
    setOptimisticFollowing(!isFollowing);
    
    followMutation.mutate(
      { targetId, targetType, action },
      {
        onSuccess: () => {
          onFollowChange?.(!isFollowing);
        },
        onError: () => {
          setOptimisticFollowing(null);
        }
      }
    );
  };

  if (!session) return null;

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={isFollowing ? 'default' : variant}
      size={size}
      className={cn(
        'transition-all',
        isFollowing && 'bg-primary hover:bg-destructive',
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {showIcon && (
            isFollowing ? (
              <UserCheck className="h-4 w-4 mr-1" />
            ) : (
              <UserPlus className="h-4 w-4 mr-1" />
            )
          )}
          {isFollowing ? 'Following' : 'Follow'}
        </>
      )}
    </Button>
  );
}