import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rpcClient } from './rpc-client'

// ================================
// Queries
// ================================

export const usePostComments = (postId: string, limit = 20) => {
  return useInfiniteQuery({
    queryKey: ['comments', 'post', postId, limit],
    queryFn: async ({ pageParam }) => {
      const response = await rpcClient.api.posts[':id'].comments.$get({
        param: { id: postId },
        query: { cursor: pageParam, limit: String(limit) },
      })
      if (!response.ok) throw new Error('Failed to fetch comments')
      return response.json()
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!postId,
    staleTime: 1000 * 60 * 2,
  })
}

export const useCommentReplies = (postId: string, commentId: string, limit = 10) => {
  return useInfiniteQuery({
    queryKey: ['comments', 'replies', commentId, limit],
    queryFn: async ({ pageParam }) => {
      const response = await rpcClient.api.posts[':postId'].comments[':commentId'].replies.$get({
        param: { postId, commentId },
        query: { cursor: pageParam, limit: String(limit) },
      })
      if (!response.ok) throw new Error('Failed to fetch replies')
      return response.json()
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled: !!postId && !!commentId,
    staleTime: 1000 * 60 * 2,
  })
}

// ================================
// Mutations
// ================================

export const useCreateComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) => {
      const response = await rpcClient.api.posts[':id'].comments.$post({
        param: { id: postId },
        json: { content, parentId },
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error((error as any).error || 'Failed to create comment')
      }
      return response.json()
    },
    onSuccess: (_newComment, { postId, parentId }) => {
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: ['comments', 'replies', parentId] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['comments', 'post', postId] })
      }
    },
  })
}

export const useUpdateComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId, commentId, content }: { postId: string; commentId: string; content: string }) => {
      const response = await rpcClient.api.posts[':postId'].comments[':commentId'].$put({
        param: { postId, commentId },
        json: { content },
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error((error as any).error || 'Failed to update comment')
      }
      return response.json()
    },
    onSuccess: (_updated, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'post', postId] })
    },
  })
}

export const useDeleteComment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ postId, commentId }: { postId: string; commentId: string }) => {
      const response = await rpcClient.api.posts[':postId'].comments[':commentId'].$delete({
        param: { postId, commentId },
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error((error as any).error || 'Failed to delete comment')
      }
      return response.json()
    },
    onSuccess: (_res, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', 'post', postId] })
    },
  })
}


