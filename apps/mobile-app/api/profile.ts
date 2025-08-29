import { useQuery } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';

// Get profile by ID (can be user or organization)
export const useGetProfile = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', profileId],
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

// Get posts for specific author (user or organization)
export const useGetPostsByAuthor = (authorId: string | undefined) => {
  return useQuery({
    queryKey: ['posts', 'author', authorId],
    queryFn: async () => {
      if (!authorId) return [];
      
      const response = await rpcClient.api.posts.$get({
        query: { authorId },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      return response.json();
    },
    enabled: !!authorId,
  });
};