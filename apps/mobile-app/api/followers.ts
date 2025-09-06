import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';

// Query Keys
const queryKeys = {
  followers: {
    status: (targetId: string) => [
      'followers',
      'status',
      targetId,
    ] as const,
    counts: (id: string) => [
      'followers',
      'counts',
      id,
    ] as const,
    followers: (targetId: string) => [
      'followers',
      'list',
      targetId,
    ] as const,
    following: (followerId: string) => [
      'following',
      'list',
      followerId,
    ] as const,
  },
} as const;

// Hook to check if currently following a user or organization (unified)
export const useFollowStatus = (targetId: string) => {
  return useQuery({
    queryKey: queryKeys.followers.status(targetId),
    queryFn: async () => {
      const res = await rpcClient.api.followers.status[':id'].$get({
        param: { id: targetId }
      });
      
      if (!res.ok) return { isFollowing: false };
      return res.json();
    },
    enabled: !!targetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to get follower counts for a user or organization (unified)
export const useFollowerCounts = (userId?: string, organizationId?: string) => {
  const id = userId || organizationId;
  
  return useQuery({
    queryKey: queryKeys.followers.counts(id!),
    queryFn: async () => {
      if (!id) return { followersCount: 0, followingCount: 0 };
      
      const res = await rpcClient.api.followers.counts[':id'].$get({
        param: { id }
      });
      
      if (!res.ok) return { followersCount: 0, followingCount: 0 };
      return res.json();
    },
    enabled: !!(userId || organizationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to get followers list (unified - auto-detects entity type)
export const useFollowers = (targetId: string, limit = 100) => {
  return useQuery({
    queryKey: queryKeys.followers.followers(targetId),
    queryFn: async () => {
      const res = await rpcClient.api.followers.followers[':id'].$get({
        param: { id: targetId },
        query: { 
          limit: limit.toString()
        }
      });
      
      if (!res.ok) return { followers: [] };
      return res.json();
    },
    enabled: !!targetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook to get following list (unified - auto-detects entity type)
export const useFollowing = (followerId: string, limit = 100) => {
  return useQuery({
    queryKey: queryKeys.followers.following(followerId),
    queryFn: async () => {
      const res = await rpcClient.api.followers.following[':id'].$get({
        param: { id: followerId },
        query: { 
          limit: limit.toString()
        }
      });
      
      if (!res.ok) return { following: [], organizations: [] };
      return res.json();
    },
    enabled: !!followerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Combined follow/unfollow mutation (unified)
export const useFollow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      targetId, 
      targetType, 
      action 
    }: { 
      targetId: string; 
      targetType: 'user' | 'organization'; 
      action: 'follow' | 'unfollow' 
    }) => {
      const res = await rpcClient.api.followers.toggle.$post({
        json: {
          targetId,
          targetType,
          action
        }
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error((error as any).error || `Failed to ${action} ${targetType}`);
      }
      return res.json();
    },
    onSuccess: (_, { targetId }) => {
      // Invalidate follow status queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.followers.status(targetId),
      });
      
      // Invalidate follower counts for the target
      queryClient.invalidateQueries({
        queryKey: queryKeys.followers.counts(targetId),
      });
      
      // Invalidate followers list for the target
      queryClient.invalidateQueries({
        queryKey: queryKeys.followers.followers(targetId),
      });
      
      // Invalidate all following lists (since they depend on who the current user follows)
      queryClient.invalidateQueries({
        queryKey: ['following'],
      });
    },
  });
};