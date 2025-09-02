import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';

// Get profile by ID (can be user or organization)
export const useGetProfile = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');
      
      const res = await rpcClient.api.profile[':id'].$get({
        param: { id: profileId }
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error(error);
        throw new Error('Failed to fetch profile');
      }
      
      return res.json();
    },
    enabled: !!profileId,
  });
};

// Infinite scroll version of posts by author
export const useGetPostsByAuthor = (authorId: string | undefined, limit = 20) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'author', authorId, 'infinite'],
    queryFn: async ({ pageParam }) => {
      if (!authorId) return { posts: [], pagination: { hasMore: false } };
      
      const response = await rpcClient.api.posts.$get({
        query: {
          authorId,
          cursor: pageParam,
          limit: limit.toString(),
          sortBy: 'newest',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      return response.json();
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.pagination?.hasMore && 'nextCursor' in lastPage.pagination 
        ? lastPage.pagination.nextCursor 
        : undefined;
    },
    enabled: !!authorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};