import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { useFollowStatus, useFollow } from '~/api/followers';
import { useSession } from '~/api/auth';

interface FollowButtonProps {
  targetId: string;
  targetType: 'user' | 'organization';
  initialFollowing?: boolean;
  size?: 'sm' | 'default' | 'lg';
  onFollowChange?: (following: boolean) => void;
}

export function FollowButton({
  targetId,
  targetType,
  initialFollowing = false,
  size = 'default',
  onFollowChange
}: FollowButtonProps) {
  const { data: session } = useSession();
  const [optimisticFollowing, setOptimisticFollowing] = useState<boolean | null>(null);

  // Don't show follow button for self
  if (session?.data?.user?.id === targetId && targetType === 'user') {
    return null;
  }

  // Query follow status using the API hook
  const { data: followStatus } = useFollowStatus(targetType, targetId);

  // Follow/unfollow mutation
  const followMutation = useFollow();

  const isFollowing = optimisticFollowing ?? followStatus?.isFollowing ?? initialFollowing;
  const isLoading = followMutation.isPending;

  const handlePress = () => {
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

  // Button sizes
  const sizeStyles = {
    sm: 'px-3 py-1.5',
    default: ' py-2',
    lg: 'px-6 py-3'
  };

  const textSizeStyles = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base'
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isLoading}
      className={`
        ${sizeStyles[size]}
        ${isFollowing 
          ? 'bg-primary border border-primary' 
          : 'bg-background border border-border'
        }
        rounded-md items-center justify-center w-full
        ${isLoading ? 'opacity-50' : ''}
      `}
    >
      <View className="flex-row items-center justify-center">
        {isLoading ? (
          <ActivityIndicator size="small" color={isFollowing ? 'white' : 'currentColor'} />
        ) : (
          <Text className={`
            ${textSizeStyles[size]} 
            font-medium
            ${isFollowing ? 'text-primary-foreground' : 'text-foreground'}
          `}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}