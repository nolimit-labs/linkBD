import { useQuery } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { queryKeys } from './query-keys';

// Get profile by ID (can be user or organization)
export const useGetProfile = (profileId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.profile.detail(profileId || ''),
    queryFn: async () => {
      if (!profileId) throw new Error('Profile ID is required');
      
      const res = await rpcClient.api.profile[':id'].$get({
        param: { id: profileId }
      });
      
      if (!res.ok) {
        const error = await res.json();
        console.error(error);
        throw new Error('Failed to fetch profile');
      }
      
      return res.json();
    },
    enabled: !!profileId,
  });
};