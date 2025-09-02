import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';

// Infinite scroll version of posts feed
export const useGetPostsFeed = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed', 'infinite', limit],
    queryFn: async ({ pageParam }) => {
      const response = await rpcClient.api.posts.feed.$get({
        query: {
          cursor: pageParam,
          limit: limit.toString(),
          sortBy: 'popular',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }
      
      return response.json();
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination?.hasMore ? lastPage.pagination.nextCursor : undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Toggle post like
export const useTogglePostLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await rpcClient.api.posts[':id'].like.$patch({
        param: { id: postId }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to toggle like');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh like status
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Create a post (simplified for mobile, no image upload for now)
export const useCreatePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      content,
      visibility = 'public' 
    }: { 
      content: string;
      visibility?: 'public' | 'organization' | 'private';
    }) => {
      const response = await rpcClient.api.posts.$post({
        json: {
          content,
          visibility,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).message || (error as any).error || 'Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// Delete a post
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await rpcClient.api.posts[':id'].$delete({
        param: { id: postId }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to delete post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};