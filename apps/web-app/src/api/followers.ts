import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { toast } from 'sonner';

// ================================
// Query Keys
// ================================

export const followersQueryKeys = {
  followStatus: (targetId: string) => 
    ['follow-status', targetId] as const,
  followers: (targetId: string) => 
    ['followers', targetId] as const,
  following: (followerId: string) => 
    ['following', followerId] as const,
  counts: (id: string) => 
    ['follower-counts', id] as const,
};

// ================================
// Queries
// ================================

// Check if following a target (unified)
export const useFollowStatus = (targetId: string) => {
  return useQuery({
    queryKey: followersQueryKeys.followStatus(targetId),
    queryFn: async () => {
      const response = await rpcClient.api.followers.status[':id'].$get({
        param: { id: targetId }
      });
      
      if (!response.ok) return { isFollowing: false };
      return response.json();
    },
    enabled: true,
  });
};

// Get follower/following counts (unified)
export const useFollowerCounts = (userId?: string, organizationId?: string) => {
  const id = userId || organizationId;
  
  return useQuery({
    queryKey: followersQueryKeys.counts(id!),
    queryFn: async () => {
      if (!id) return { followersCount: 0, followingCount: 0 };
      
      const response = await rpcClient.api.followers.counts[':id'].$get({
        param: { id }
      });
      
      if (!response.ok) return { followersCount: 0, followingCount: 0 };
      return response.json();
    },
    enabled: !!(userId || organizationId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get followers list (unified - auto-detects entity type)
export const useFollowers = (targetId: string, limit = 100) => {
  return useQuery({
    queryKey: followersQueryKeys.followers(targetId),
    queryFn: async () => {
      const response = await rpcClient.api.followers.followers[':id'].$get({
        param: { id: targetId }
      });
      
      if (!response.ok) return { followers: [] };
      return response.json();
    },
    enabled: !!targetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get following list (unified - auto-detects entity type)
export const useFollowing = (followerId: string, limit = 100) => {
  return useQuery({
    queryKey: followersQueryKeys.following(followerId),
    queryFn: async () => {
      const response = await rpcClient.api.followers.following[':id'].$get({
        param: { id: followerId }
      });
      
      if (!response.ok) return { following: [], organizations: [] };
      return response.json();
    },
    enabled: !!followerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ================================
// Mutations
// ================================

// Unified follow/unfollow mutation
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
      const response = await rpcClient.api.followers.toggle.$post({
        json: {
          targetId,
          targetType,
          action
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || `Failed to ${action} ${targetType}`);
      }
      
      return response.json();
    },
    onSuccess: (_, { targetId, action }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.followStatus(targetId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.counts(targetId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.followers(targetId) 
      });
      // Also invalidate feed since following changes affect feed content
      queryClient.invalidateQueries({ 
        queryKey: ['posts', 'feed'] 
      });
      
      const actionText = action === 'follow' ? 'Following' : 'Unfollowed';
      toast.success(`${actionText}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};