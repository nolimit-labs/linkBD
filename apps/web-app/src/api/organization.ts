import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { organization, subscription, useActiveOrganization } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from '@tanstack/react-router';
import { queryKeys } from './query-keys';
import { rpcClient } from './rpc-client';
import type { InferRequestType, InferResponseType } from 'hono/client';


// ================================
// Queries
// ================================

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

// Get organization by ID
export const useOrganization = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ['organizations', organizationId],
    queryFn: async () => {
      if (!organizationId) throw new Error('Organization ID is required');
      
      const response = await rpcClient.api.organizations[':id'].$get({
        param: { id: organizationId }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch organization');
      }
      
      return response.json();
    },
    enabled: !!organizationId,
  });
};

// Update organization
type UpdateOrganizationInput = {
  id: string;
  name?: string;
  description?: string;
  imageKey?: string;
};

// ================================
// Mutations
// ================================

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateOrganizationInput) => {
      const response = await rpcClient.api.organizations[':id'].$patch({
        param: { id },
        json: data,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to update organization');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast.success('Organization updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update organization:', error);
      toast.error(error.message || 'Failed to update organization');
    },
  });
};

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