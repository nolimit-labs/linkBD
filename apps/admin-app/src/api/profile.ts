import { useQuery } from "@tanstack/react-query";
import { rpcClient } from "./rpc-client";

export function useGetProfile(userOrOrgId: string) {
    return useQuery({
      queryKey: ['admin', 'profile', userOrOrgId],
      queryFn: async () => {
        const response = await rpcClient.api.admin.profile[':id'].$get({
          param: { id: userOrOrgId }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const data = await response.json();
        return data;
      },
      enabled: !!userOrOrgId,
      retry: 1,
      staleTime: 30000, // Cache for 30 seconds
    });
  }

  // Get profile todos by ID (admin access)
export function useAdminProfileTodos(profileId: string) {
  return useQuery({
    queryKey: ['admin', 'profile', profileId, 'todos'],
    queryFn: async () => {
      const response = await rpcClient.api.admin.profile[':id'].todos.$get({
        param: { id: profileId }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile todos');
      }
      
      const data = await response.json();
      return data;
    },
    enabled: !!profileId,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
}

// Get profile files by ID (admin access)
export function useAdminProfileFiles(profileId: string) {
  return useQuery({
    queryKey: ['admin', 'profile', profileId, 'files'],
    queryFn: async () => {
      const response = await rpcClient.api.admin.profile[':id'].files.$get({
        param: { id: profileId }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile files');
      }
      
      const data = await response.json();
      return data;
    },
    enabled: !!profileId,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
}