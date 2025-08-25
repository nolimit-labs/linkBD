import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { toast } from 'sonner';

// Query keys
export const migrationKeys = {
  all: ['migrations'] as const,
  lists: () => [...migrationKeys.all, 'list'] as const,
  list: () => [...migrationKeys.lists()] as const,
  history: () => [...migrationKeys.all, 'history'] as const,
  status: (filename: string) => [...migrationKeys.all, 'status', filename] as const,
};

// Hook to fetch all migrations with their status
export function useMigrations(runningMigration?: string | null) {
  return useQuery({
    queryKey: migrationKeys.list(),
    queryFn: async () => {
      const response = await rpcClient.api.admin.migrations.$get();
      
      if (!response.ok) {
        throw new Error('Failed to fetch migrations');
      }
      
      return response.json();
    },
    // Poll while a migration is running for real-time updates
    refetchInterval: runningMigration ? 2000 : false,
    retry: 1,
    staleTime: 30000,
  });
}

// Hook to fetch migration history
export function useMigrationHistory() {
  return useQuery({
    queryKey: migrationKeys.history(),
    queryFn: async () => {
      const response = await rpcClient.api.admin.migrations.history.$get();
      
      if (!response.ok) {
        throw new Error('Failed to fetch migration history');
      }
      
      return response.json();
    },
    retry: 1,
    staleTime: 30000,
  });
}

// Hook to fetch specific migration status
export function useMigrationStatus(filename: string, enabled = true) {
  return useQuery({
    queryKey: migrationKeys.status(filename),
    queryFn: async () => {
      const response = await rpcClient.api.admin.migrations[':filename'].status.$get({
        param: { filename },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch migration status');
      }
      
      return response.json();
    },
    enabled,
    retry: 1,
    staleTime: 30000,
  });
}

// Hook to run a migration
export function useRunMigration(onRunning?: (filename: string) => void, onComplete?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filename: string) => {
      const response = await rpcClient.api.admin.migrations[':filename'].run.$post({
        param: { filename },
      });
      
      if (!response.ok) {
        const error = await response.json() as any;
        throw new Error(error.error || 'Failed to run migration');
      }
      
      return response.json();
    },
    onMutate: (filename) => {
      onRunning?.(filename);
    },
    onSuccess: (data, filename) => {
      toast.success(`Migration ${filename} executed successfully`);
      // Invalidate all migration queries to refresh data
      queryClient.invalidateQueries({ queryKey: migrationKeys.all });
      onComplete?.();
    },
    onError: (error: any, filename) => {
      toast.error(`Failed to run migration: ${error.message}`);
      onComplete?.();
    },
  });
}

// Hook to rollback a migration
export function useRollbackMigration(onRunning?: (filename: string) => void, onComplete?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filename: string) => {
      const response = await rpcClient.api.admin.migrations[':filename'].rollback.$post({
        param: { filename },
      });
      
      if (!response.ok) {
        const error = await response.json() as any;
        throw new Error(error.error || 'Failed to rollback migration');
      }
      
      return response.json();
    },
    onMutate: (filename) => {
      onRunning?.(filename);
    },
    onSuccess: (data, filename) => {
      toast.success(`Migration ${filename} rolled back successfully`);
      // Invalidate all migration queries to refresh data
      queryClient.invalidateQueries({ queryKey: migrationKeys.all });
      onComplete?.();
    },
    onError: (error: any, filename) => {
      toast.error(`Failed to rollback migration: ${error.message}`);
      onComplete?.();
    },
  });
}

// Define types directly here instead of importing from admin
export interface Migration {
  filename: string;
  sequence: string;
  name: string;
  path: string;
  lastRun?: {
    status: string;
    startedAt: string;
    completedAt?: string | null;
    error?: string | null;
  } | null;
}

export interface MigrationRun {
  id: string;
  migrationFile: string;
  status: 'running' | 'completed' | 'failed' | 'rolled_back';
  startedAt: string;
  completedAt?: string | null;
  error?: string | null;
  runBy: string;
  runByEmail?: string | null;
  runByName?: string | null;
}