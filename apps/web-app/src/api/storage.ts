import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { queryKeys } from './query-keys';
import { toast } from 'sonner';
import { useActiveOrganization } from '@/lib/auth-client';

// Hook to get user's or organization's files
export const useGetFiles = () => {
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;
  
  return useQuery({
    queryKey: queryKeys.storage.list(organizationId),
    queryFn: async () => {
      const response = await rpcClient.api.storage.$get();
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      return response.json();
    },
  });
};

// Hook to upload a file to storage
export const useUploadFile = () => {
  const queryClient = useQueryClient();
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;
  
  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Get presigned upload URL
      const uploadResponse = await rpcClient.api.storage['upload-url'].$post({
        json: {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        },
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error((error as any).error || 'Failed to get upload URL');
      }

      const { uploadUrl, fileKey } = await uploadResponse.json();

      if (!uploadUrl) {
        throw new Error('Failed to get upload URL');
      }

      // Step 2: Upload file directly to R2 using presigned URL
      const uploadFileResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'Access-Control-Allow-Origin': '*',
        },
      });

      if (!uploadFileResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // Return the file key for future reference
      return {
        fileKey,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      };
    },
    onError: (error) => {
      // Show error toast
      toast.error(error.message || 'Failed to upload file');
    },
    onSuccess: (data) => {
      // Show success toast
      toast.success(`File "${data.fileName}" uploaded successfully`);
      // Invalidate the correct files list based on organization context
      queryClient.invalidateQueries({ queryKey: queryKeys.storage.list(organizationId) });
    },
  });
};

// Hook to delete a file
export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  const { data: activeOrg } = useActiveOrganization();
  const organizationId = activeOrg?.id;
  
  return useMutation({
    mutationFn: async (fileKey: string) => {
      const response = await rpcClient.api.storage[':fileKey'].$delete({
        param: { fileKey },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to delete file');
      }

      return response.json();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete file');
    },
    onSuccess: () => {
      toast.success('File deleted successfully');
      // Invalidate the correct files list based on organization context
      queryClient.invalidateQueries({ queryKey: queryKeys.storage.list(organizationId) });
    },
  });
};