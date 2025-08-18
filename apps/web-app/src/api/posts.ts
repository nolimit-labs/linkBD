import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { queryKeys } from './query-keys';
import { toast } from 'sonner';
import { useUploadFile } from './storage';
import { useActiveOrganization } from '@/lib/auth-client';

// Get public feed for discovery
export const useFeed = () => {
  return useQuery({
    queryKey: queryKeys.feed.public(),
    queryFn: async () => {
      const response = await rpcClient.api.posts.feed.$get();
      
      if (!response.ok) {
        throw new Error('Failed to fetch feed');
      }
      
      return response.json();
    },
  });
};

// Get posts for specific author (user or organization)
export const useGetPostsByAuthor = (authorId: string) => {
  return useQuery({
    queryKey: queryKeys.posts.byAuthor(authorId),
    queryFn: async () => {
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

// Get single post by ID
export const usePost = (postId: string) => {
  return useQuery({
    queryKey: queryKeys.posts.single(postId),
    queryFn: async () => {
      const response = await rpcClient.api.posts[':id'].$get({
        param: { id: postId },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      return response.json();
    },
    enabled: !!postId,
  });
};

// Create a post with optional image upload
export const useCreatePost = () => {
  const uploadFile = useUploadFile();
  const queryClient = useQueryClient();
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;
  
  return useMutation({
    mutationFn: async ({ 
      postData, 
      imageFile 
    }: { 
      postData: {
        content: string;
        visibility?: 'public' | 'organization' | 'private';
      }; 
      imageFile?: File 
    }) => {
      // Step 1: Upload image if provided
      let imageKey: string | undefined;
      if (imageFile) {
        try {
          const uploadResult = await uploadFile.mutateAsync(imageFile);
          imageKey = uploadResult.fileKey;
        } catch (error) {
          // If image upload fails, still create the todo without image
          console.error('Image upload failed:', error);
          toast.error('Image upload failed, creating post without image');
        }
      }
      
      // Step 2: Create post with image reference
      const response = await rpcClient.api.posts.$post({
        json: {
          ...postData,
          imageKey,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).message || (error as any).error || 'Failed to create post');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all(organizationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.public() });
      toast.success('Post created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};




// // Update a todo
// export const useUpdateTodo = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async ({ 
//       todoId, 
//       updateData 
//     }: { 
//       todoId: string; 
//       updateData: {
//         title: string;
//         description: string;
//       };
//     }) => {
//       const response = await rpcClient.api.todos[':id'].$put({
//         param: { id: todoId },
//         json: updateData,
//       });
      
//       if (!response.ok) {
//         const error = await response.json();  
//         throw new Error((error as any).error || 'Failed to update todo');
//       }
      
//       return response.json();
//     },
//     onSuccess: (updatedTodo) => {
//       // Update the single todo query
//       queryClient.setQueryData(queryKeys.todos.single(updatedTodo.id), updatedTodo);
      
//       // Invalidate list queries
//       queryClient.invalidateQueries({ queryKey: queryKeys.todos.all() });
//     },
//   });
// };

// Toggle post like
export const useTogglePostLike = () => {
  const queryClient = useQueryClient();
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await rpcClient.api.posts[':id'].like.$patch({
        param: { id: postId }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to toggle like');
      }
      
      return response.json();
    },
    onSuccess: (_, postId) => {
      // Invalidate post queries to refresh like status
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.single(postId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all(organizationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.public() });
    },
  });
};

// Delete a post
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await rpcClient.api.posts[':id'].$delete({
        param: { id: postId }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to delete post');
      }
      
      return response.json();
    },
    onSuccess: (_, postId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.posts.single(postId) });
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all(organizationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.public() });
    },
  });
};


// // Update todo image
// export const useUpdateTodoImage = () => {
//   const queryClient = useQueryClient();
//   const uploadFile = useUploadFile();
  
//   return useMutation({
//     mutationFn: async ({ 
//       todoId, 
//       imageFile 
//     }: { 
//       todoId: string; 
//       imageFile: File 
//     }) => {
//       // Step 1: Upload the new image
//       const uploadResult = await uploadFile.mutateAsync(imageFile);
      
//       // Step 2: Update todo with new image key
//       const response = await rpcClient.api.todos[':id'].image.$patch({
//         param: { id: todoId },
//         json: { imageKey: uploadResult.fileKey },
//       });
      
//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error((error as any).error || 'Failed to update todo image');
//       }
      
//       return response.json();
//     },
//     onSuccess: (updatedTodo) => {
//       queryClient.setQueryData(queryKeys.todos.single(updatedTodo.id), updatedTodo);
//       queryClient.invalidateQueries({ queryKey: queryKeys.todos.all() });
//       toast.success('Image updated successfully');
//     },
//     onError: (error) => {
//       toast.error(error.message);
//     },
//   });
// };

// Remove post image
export const useRemovePostImage = () => {
  const queryClient = useQueryClient();
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;
  
  return useMutation({
    mutationFn: async (postId: string) => {
      const response = await rpcClient.api.posts[':id'].image.$delete({
        param: { id: postId },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to remove post image');
      }
      
      return response.json();
    },
    onSuccess: (updatedPost) => {
      queryClient.setQueryData(queryKeys.posts.single(updatedPost.id), updatedPost);
      queryClient.invalidateQueries({ queryKey: queryKeys.posts.all(organizationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.public() });
      toast.success('Image removed successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};