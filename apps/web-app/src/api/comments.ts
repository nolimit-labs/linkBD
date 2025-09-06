import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';
import { queryKeys } from './query-keys';
import { toast } from 'sonner';

// ================================
// Queries
// ================================

// Get comments for a post with pagination
export const usePostComments = (postId: string, limit = 20) => {
  return useInfiniteQuery({
    queryKey: queryKeys.comments.byPost(postId),
    queryFn: async ({ pageParam }) => {
      const response = await rpcClient.api.posts[':id'].comments.$get({
        param: { id: postId },
        query: {
          cursor: pageParam,
          limit: limit.toString(),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      return response.json();
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    enabled: !!postId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get replies for a comment with pagination
export const useCommentReplies = (postId: string, commentId: string, limit = 10) => {
  return useInfiniteQuery({
    queryKey: queryKeys.comments.replies(commentId),
    queryFn: async ({ pageParam }) => {
      const response = await rpcClient.api.posts[':postId'].comments[':commentId'].replies.$get({
        param: { postId, commentId },
        query: {
          cursor: pageParam,
          limit: limit.toString(),
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch replies');
      }
      
      return response.json();
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    enabled: !!postId && !!commentId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// ================================
// Mutations
// ================================

// Create a new comment
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      content, 
      parentId 
    }: { 
      postId: string; 
      content: string; 
      parentId?: string;
    }) => {
      const response = await rpcClient.api.posts[':id'].comments.$post({
        param: { id: postId },
        json: { content, parentId },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create comment');
      }

      return response.json();
    },
    onSuccess: (newComment, { postId, parentId }) => {
      // Invalidate and refetch comments
      if (parentId) {
        // If it's a reply, invalidate the replies query
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.comments.replies(parentId) 
        });
      } else {
        // If it's a top-level comment, invalidate the post comments
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.comments.byPost(postId) 
        });
      }

      // Also invalidate the single post query to update comment count
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.posts.single(postId) 
      });

      toast.success('Comment posted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post comment');
    },
  });
};

// Update a comment
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      commentId, 
      content 
    }: { 
      postId: string; 
      commentId: string; 
      content: string;
    }) => {
      const response = await rpcClient.api.posts[':postId'].comments[':commentId'].$put({
        param: { postId, commentId },
        json: { content },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to update comment');
      }

      return response.json();
    },
    onSuccess: (updatedComment, { postId, commentId }) => {
      // Update the comment in the cache
      queryClient.setQueryData(
        queryKeys.comments.byPost(postId),
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              comments: page.comments.map((comment: any) =>
                comment.id === commentId ? updatedComment : comment
              ),
            })),
          };
        }
      );

      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.comments.byPost(postId) 
      });

      toast.success('Comment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update comment');
    },
  });
};

// Delete a comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      postId, 
      commentId 
    }: { 
      postId: string; 
      commentId: string;
    }) => {
      const response = await rpcClient.api.posts[':postId'].comments[':commentId'].$delete({
        param: { postId, commentId },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error((error as any).error || 'Failed to delete comment');
      }

      return response.json();
    },
    onSuccess: (_, { postId, commentId }) => {
      // Remove the comment from the cache
      queryClient.setQueryData(
        queryKeys.comments.byPost(postId),
        (oldData: any) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              comments: page.comments.filter((comment: any) => comment.id !== commentId),
            })),
          };
        }
      );

      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.comments.byPost(postId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.posts.single(postId) 
      });

      toast.success('Comment deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete comment');
    },
  });
};