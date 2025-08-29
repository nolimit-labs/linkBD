import { useQuery } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';

type SearchType = 'all' | 'user' | 'organization';

// Search for users and organizations
export const useSearch = (query: string, type: SearchType = 'all') => {
  return useQuery({
    queryKey: ['search', query, type],
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

// Get all organizations with limit
export const useOrganizations = (limit: number = 10) => {
  return useQuery({
    queryKey: ['organizations', 'list', limit],
    queryFn: async () => {
      const response = await rpcClient.api.organizations.$get({
        query: { limit: String(limit) }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      
      return response.json();
    },
  });
};