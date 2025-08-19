import { useQuery } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { queryKeys } from './query-keys';

type SearchType = 'all' | 'user' | 'organization';

export const useSearch = (query: string, type: SearchType = 'all') => {
  return useQuery({
    queryKey: queryKeys.search.all(query, type),
    queryFn: async () => {
      if (!query.trim()) {
        return { users: [], organizations: [] };
      }

      const params: any = { q: query };
      if (type !== 'all') {
        params.type = type;
      }

      const response = await rpcClient.api.search.$get({
        query: params
      });
      
      if (!response.ok) {
        throw new Error('Failed to search');
      }
      
      return response.json();
    },
    enabled: !!query.trim(),
  });
};