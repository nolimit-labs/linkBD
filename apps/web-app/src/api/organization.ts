import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organization, subscription, useActiveOrganization } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from '@tanstack/react-router';
import { queryKeys } from './query-keys';
import { rpcClient } from './rpc-client';


// Delete organization
export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  
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

export const useOrganizationSubscription = () => {
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;

  return useQuery({
    queryKey: queryKeys.organization.subscription(organizationId),
    queryFn: async () => {
      const { data: subscriptions, error } = await subscription.list({ query: { referenceId: organizationId } })
      if (error) {
        throw new Error('Failed to get subscriptions');
      }
      return subscriptions;
    },
    enabled: !!organizationId,
  });
};