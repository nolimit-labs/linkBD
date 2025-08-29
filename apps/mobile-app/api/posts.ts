import { useInfiniteQuery } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
    

// Infinite scroll version of posts feed
export const useInfinitePostsFeed = (limit = 10) => {
    return useInfiniteQuery({
      queryKey: ['posts', 'feed', 'infinite', limit],
      queryFn: async ({ pageParam }) => {
        const response = await rpcClient.api.posts.feed.$get({
          query: {
            cursor: pageParam,
            limit: limit.toString(),
            sortBy: 'popular', // Used in order by clause, popular posts first
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch feed');
        }
        
        return response.json();
      },
      initialPageParam: undefined as string | undefined,
      getNextPageParam: (lastPage) => {
        return lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };