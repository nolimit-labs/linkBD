import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { toast } from 'sonner';

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

// Update organization featured status (admin only)
export const useUpdateOrganizationFeaturedStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, isFeatured }: { 
      organizationId: string; 
      isFeatured: boolean; 
    }) => {
      const response = await rpcClient.api.organizations[':id'].featured.$patch({
        param: { id: organizationId },
        json: { isFeatured },
      });
      
      if (!response.ok) {
        throw new Error('Failed to update featured status');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      queryClient.invalidateQueries({ queryKey: ['organizations', 'featured'] });
      toast.success('Featured status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update featured status');
    },
  });
};