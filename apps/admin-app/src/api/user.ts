import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { queryKeys } from './query-keys';
import { admin } from '@/lib/auth-client';

// =====================================================================
// Queries
// =====================================================================

export function useGetAllUsersAsAdmin() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await rpcClient.api.admin.users.$get({
        query: {
          limit: '20',
          cursor: undefined,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      return data;
    },
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
}

// Get user profile from user table
export function useCurrentUserProfile() {
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

// =====================================================================
// Mutations
// =====================================================================

// Update user profile
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: { userId: string; name?: string; image?: string | null }) => {
      const response = await admin.updateUser({
        userId: userData.userId,
        data: {
          name: userData.name,
          image: userData.image,
        }
      });
      
      if (response.error) {
        throw new Error('Failed to update user profile');
      }
      
      return response.data;
    },
    onSuccess: (updatedUser) => {
      // Update the user query data
      queryClient.setQueryData(queryKeys.user.profile, updatedUser);
    },
  });
}

// Delete user completely (admin only)
export function useDeleteUser() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await rpcClient.api.admin.users[':userId'].$delete({
        param: {
          userId,
        },
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to delete user');
      }
      
      return await response.json();
    },
  });
}

// Get user profile by ID (admin access)

