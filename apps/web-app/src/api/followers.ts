import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { toast } from 'sonner';

// ================================
// Query Keys
// ================================

export const followersQueryKeys = {
  followStatus: (targetType: 'user' | 'organization', targetId: string) => 
    ['follow-status', targetType, targetId] as const,
  followers: (userId: string) => ['followers', userId] as const,
  following: (userId: string) => ['following', userId] as const,
  counts: (id: string) => ['follower-counts', id] as const,
};

// ================================
// Queries
// ================================

// Check if following a user
export const useFollowStatus = (targetType: 'user' | 'organization', targetId: string) => {
  return useQuery({
    queryKey: followersQueryKeys.followStatus(targetType, targetId),
    queryFn: async () => {
      if (targetType === 'user') {
        const response = await rpcClient.api.followers.users[':userId']['follow-status'].$get({
          param: { userId: targetId }
        });
        
        if (!response.ok) return { isFollowing: false };
        return response.json();
      } else {
        const response = await rpcClient.api.followers.organizations[':orgId']['follow-status'].$get({
          param: { orgId: targetId }
        });
        
        if (!response.ok) return { isFollowing: false };
        return response.json();
      }
    },
    enabled: !!targetId,
  });
};

// Get user's followers
export const useUserFollowers = (userId: string, limit = 100) => {
  return useQuery({
    queryKey: followersQueryKeys.followers(userId),
    queryFn: async () => {
      const response = await rpcClient.api.followers.users[':userId'].followers.$get({
        param: { userId },
        query: { limit: limit.toString() }
      });
      
      if (!response.ok) return { followers: [] };
      return response.json();
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get who a user is following
export const useUserFollowing = (userId: string, limit = 100) => {
  return useQuery({
    queryKey: followersQueryKeys.following(userId),
    queryFn: async () => {
      const response = await rpcClient.api.followers.users[':userId'].following.$get({
        param: { userId },
        query: { limit: limit.toString() }
      });
      
      if (!response.ok) return { following: [], organizations: [] };
      return response.json();
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get follower/following counts
export const useFollowerCounts = (userId?: string, organizationId?: string) => {
  const id = userId || organizationId;
  
  return useQuery({
    queryKey: followersQueryKeys.counts(id!),
    queryFn: async () => {
      if (userId) {
        const response = await rpcClient.api.followers.users[':userId'].counts.$get({
          param: { userId }
        });
        if (!response.ok) return { followersCount: 0, followingCount: 0 };
        return response.json();
      } else if (organizationId) {
        const response = await rpcClient.api.followers.organizations[':orgId'].counts.$get({
          param: { orgId: organizationId }
        });
        if (!response.ok) return { followersCount: 0, followingCount: 0 };
        return response.json();
      }
      return { followersCount: 0, followingCount: 0 };
    },
    enabled: !!(userId || organizationId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// ================================
// Mutations
// ================================

// Follow a user
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await rpcClient.api.followers.users[':userId'].follow.$post({
        param: { userId }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to follow user');
      }
      
      return response.json();
    },
    onSuccess: (_, userId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.followStatus('user', userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.counts(userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.followers(userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['posts', 'feed'] 
      });
      toast.success('Following user');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Unfollow a user
export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await rpcClient.api.followers.users[':userId'].follow.$delete({
        param: { userId }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to unfollow user');
      }
      
      return response.text();
    },
    onSuccess: (_, userId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.followStatus('user', userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.counts(userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.followers(userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['posts', 'feed'] 
      });
      toast.success('Unfollowed user');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Follow an organization
export const useFollowOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const response = await rpcClient.api.followers.organizations[':orgId'].follow.$post({
        param: { orgId: organizationId }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to follow organization');
      }
      
      return response.json();
    },
    onSuccess: (_, organizationId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.followStatus('organization', organizationId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.counts(organizationId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['posts', 'feed'] 
      });
      toast.success('Following organization');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Unfollow an organization
export const useUnfollowOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const response = await rpcClient.api.followers.organizations[':orgId'].follow.$delete({
        param: { orgId: organizationId }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to unfollow organization');
      }
      
      return response.text();
    },
    onSuccess: (_, organizationId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.followStatus('organization', organizationId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: followersQueryKeys.counts(organizationId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['posts', 'feed'] 
      });
      toast.success('Unfollowed organization');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Combined follow mutation that works for both users and organizations
export const useFollow = () => {
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const followOrganization = useFollowOrganization();
  const unfollowOrganization = useUnfollowOrganization();
  
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
      if (targetType === 'user') {
        return action === 'follow' 
          ? followUser.mutateAsync(targetId)
          : unfollowUser.mutateAsync(targetId);
      } else {
        return action === 'follow'
          ? followOrganization.mutateAsync(targetId)
          : unfollowOrganization.mutateAsync(targetId);
      }
    },
  });
};