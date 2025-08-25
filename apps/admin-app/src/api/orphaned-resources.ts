import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { toast } from 'sonner';

export const orphanedKeys = {
  all: ['orphaned'] as const,
  summary: () => [...orphanedKeys.all, 'summary'] as const,
  todos: () => [...orphanedKeys.all, 'todos'] as const,
  files: () => [...orphanedKeys.all, 'files'] as const,
};

// =====================================================================
// Queries
// =====================================================================

// Hook to fetch orphaned resources summary
export function useOrphanedSummary() {
  return useQuery({
    queryKey: orphanedKeys.summary(),
    queryFn: async () => {
      const response = await rpcClient.api.admin.orphaned.summary.$get();
      
      if (!response.ok) {
        throw new Error('Failed to fetch orphaned resources summary');
      }
      
      return response.json();
    },
    retry: 1,
    staleTime: 30000,
  });
}

// Hook to fetch orphaned todos
export function useOrphanedTodos() {
  return useQuery({
    queryKey: orphanedKeys.todos(),
    queryFn: async () => {
      const response = await rpcClient.api.admin.orphaned.todos.$get();
      
      if (!response.ok) {
        throw new Error('Failed to fetch orphaned todos');
      }
      
      return response.json();
    },
    retry: 1,
    staleTime: 30000,
  });
}

// Hook to fetch orphaned files
export function useOrphanedFiles() {
  return useQuery({
    queryKey: orphanedKeys.files(),
    queryFn: async () => {
      const response = await rpcClient.api.admin.orphaned.files.$get();
      
      if (!response.ok) {
        throw new Error('Failed to fetch orphaned files');
      }
      
      return response.json();
    },
    retry: 1,
    staleTime: 30000,
  });
}

// =====================================================================
// Mutations
// =====================================================================

// Hook to delete a single orphaned resource
export function useDeleteOrphanedResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, id }: { type: 'todo' | 'file'; id: string }) => {
      const response = await rpcClient.api.admin.orphaned[':type'][':id'].$delete({
        param: { type, id },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete orphaned resource');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`Deleted orphaned ${variables.type}`);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: orphanedKeys.summary() });
      queryClient.invalidateQueries({ queryKey: orphanedKeys[`${variables.type}s` as 'todos' | 'files']() });
    },
    onError: (error: any) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });
}

// Hook to batch delete orphaned resources
export function useBatchDeleteOrphans(
  onSuccess?: (type: 'todo' | 'file', count: number) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, ids }: { type: 'todo' | 'file'; ids: string[] }) => {
      const response = await rpcClient.api.admin.orphaned[':type']['batch-delete'].$post({
        param: { type },
        json: { ids },
      });
      
      if (!response.ok) {
        throw new Error('Failed to batch delete orphaned resources');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      toast.success(`Deleted ${data.deletedCount} orphaned ${variables.type}s`);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: orphanedKeys.summary() });
      queryClient.invalidateQueries({ queryKey: orphanedKeys[`${variables.type}s` as 'todos' | 'files']() });
      // Call custom success handler if provided
      onSuccess?.(variables.type, data.deletedCount);
    },
    onError: (error: any) => {
      toast.error(`Failed to batch delete: ${error.message}`);
    },
  });
}

