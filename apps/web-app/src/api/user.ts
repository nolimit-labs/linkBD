import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { queryKeys } from './query-keys';
import { subscription } from '@/lib/auth-client';

// Get current user profile
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: async () => {
      const response = await rpcClient.api.user.profile.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      return data.user;
    },
  });
}

// Get user profile by ID
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.users.single(userId),
    queryFn: async () => {
      const response = await rpcClient.api.user[':id'].$get({
        param: { id: userId },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return response.json();
    },
    enabled: !!userId,
  });
};

// Update current user profile
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: { name?: string; image?: string | null }) => {
      const response = await rpcClient.api.user.profile.$put({
        json: userData
      });

      if (!response.ok) {
        throw new Error('Failed to update user profile');
      }

      const data = await response.json();
      return data.user;
    },
    onSuccess: (updatedUser) => {
      // Update the user query data
      queryClient.setQueryData(queryKeys.user.profile, updatedUser);
    },
  });
}

// User subscriptions
export function useUserSubscriptions() {
  return useQuery({
    queryKey: queryKeys.user.subscription,
    queryFn: async () => {
      const { data: subscriptions, error } = await subscription.list()
      if (error) {
        throw new Error('Failed to get subscriptions');
      }
      return subscriptions;
    },
  });
}