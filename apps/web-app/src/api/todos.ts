import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { queryKeys } from './query-keys';
import { toast } from 'sonner';
import { useUploadFile } from './storage';
import { useActiveOrganization } from '@/lib/auth-client';

// Get all todos for the authenticated user
export const useTodos = () => {
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;
  
  return useQuery({
    queryKey: queryKeys.todos.all(organizationId),
    queryFn: async () => {
      const response = await rpcClient.api.todos.$get();
      
      if (!response.ok) {
        throw new Error('Failed to fetch todos');
      }
      
      return response.json();
    },
  });
};

// Get single todo by ID
export const useTodo = (todoId: string) => {
  return useQuery({
    queryKey: queryKeys.todos.single(todoId),
    queryFn: async () => {
      const response = await rpcClient.api.todos[':id'].$get({
        param: { id: todoId },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch todo');
      }
      
      return response.json();
    },
    enabled: !!todoId,
  });
};

// Create a todo with optional image upload
export const useCreateTodo = () => {
  const uploadFile = useUploadFile();
  const queryClient = useQueryClient();
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;
  
  return useMutation({
    mutationFn: async ({ 
      todoData, 
      imageFile 
    }: { 
      todoData: {
        title: string;
        description: string;
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
          toast.error('Image upload failed, creating todo without image');
        }
      }
      
      // Step 2: Create todo with image reference
      const response = await rpcClient.api.todos.$post({
        json: {
          ...todoData,
          imageKey,
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).message || (error as any).error || 'Failed to create todo');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all(organizationId) });
      toast.success('Todo created successfully');
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

// Toggle todo completion
export const useToggleTodo = () => {
  const queryClient = useQueryClient();
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;
  
  return useMutation({
    mutationFn: async (todoId: string) => {
      const response = await rpcClient.api.todos[':id'].toggle.$patch({
        param: { id: todoId }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to toggle todo');
      }
      
      return response.json();
    },
    onSuccess: (updatedTodo) => {
      // Update the single todo query
      queryClient.setQueryData(queryKeys.todos.single(updatedTodo.id), updatedTodo);
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all(organizationId) });
    },
  });
};

// Delete a todo
export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;
  
  return useMutation({
    mutationFn: async (todoId: string) => {
      const response = await rpcClient.api.todos[':id'].$delete({
        param: { id: todoId }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to delete todo');
      }
      
      return response.json();
    },
    onSuccess: (_, todoId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.todos.single(todoId) });
      
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all(organizationId) });
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

// Remove todo image
export const useRemoveTodoImage = () => {
  const queryClient = useQueryClient();
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;
  
  return useMutation({
    mutationFn: async (todoId: string) => {
      const response = await rpcClient.api.todos[':id'].image.$delete({
        param: { id: todoId },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to remove todo image');
      }
      
      return response.json();
    },
    onSuccess: (updatedTodo) => {
      queryClient.setQueryData(queryKeys.todos.single(updatedTodo.id), updatedTodo);
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.all(organizationId) });
      toast.success('Image removed successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};