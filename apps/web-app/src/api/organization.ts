import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organization, subscription, useActiveOrganization } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from '@tanstack/react-router';
import { queryKeys } from './query-keys';
import { rpcClient } from './rpc-client';


// Delete organization
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (organizationId: string) => {
      await organization.delete({ organizationId });
      return { organizationId };
    },
    onSuccess: () => {
      // Invalidate all queries since organization deletion affects the entire application state
      queryClient.invalidateQueries();
      
      toast.success('Organization deleted successfully');
      
      // Navigate back to settings after deletion
      window.location.reload();
    },
    onError: (error) => {
      console.error('Failed to delete organization:', error);
      toast.error('Failed to delete organization. Please try again.');
    },
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