import { useQuery } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';

export function useGetAllOrganizationsAsAdmin() {
  return useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: async () => {
      const response = await rpcClient.api.admin.organizations.$get({
        query: {
          limit: '50',
          cursor: undefined,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }
      
      const data = await response.json();
      return data;
    },
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
}