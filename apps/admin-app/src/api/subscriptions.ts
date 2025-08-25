import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { toast } from 'sonner';

// Hook to update user subscription
export function useUpdateUserSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, plan }: { userId: string; plan: 'free' | 'pro_complementary' }) => {
      const response = await rpcClient.api.admin.users[':userId'].subscription.$patch({
        param: { userId },
        json: { plan },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error('Failed to update subscription');
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`Subscription updated to ${variables.plan.replace('_', ' ')}`);
      // Invalidate user queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'profile', variables.userId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update subscription');
    },
  });
}