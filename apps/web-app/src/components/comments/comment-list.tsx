import { useEffect, useRef } from 'react'
import { CommentThread } from './comment-thread'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageCircle, Plus } from 'lucide-react'
import { usePostComments } from '@/api'
import { useIntersection } from '@/hooks/use-intersection'

interface CommentListProps {
  postId: string
  onAddComment?: () => void
  className?: string
}

export function CommentList({ postId, onAddComment, className }: CommentListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const isIntersecting = useIntersection(loadMoreRef as unknown as React.RefObject<Element>)
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = usePostComments(postId)

  // Auto-load more when intersection observer triggers
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage])

  const comments = data?.pages.flatMap(page => page.comments) ?? []
  const totalComments = comments.length

  const handleCommentUpdate = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className={className}>
        <CommentListSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-sm text-muted-foreground mb-4">
          Failed to load comments. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header with padding */}
      <div className="flex items-center justify-between mb-4 px-6">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}
        </h3>
        {onAddComment && (
          <Button variant="ghost" size="sm" onClick={onAddComment}>
            <Plus className="h-4 w-4 mr-1" />
            Add Comment
          </Button>
        )}
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-8 px-6">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">
            No comments yet. Be the first to share your thoughts!
          </p>
          {onAddComment && (
            <Button variant="outline" size="sm" onClick={onAddComment}>
              <Plus className="h-4 w-4 mr-1" />
              Add Comment
            </Button>
          )}
        </div>
      ) : (
        <div className="">
          {/* Top-level comments get padding, replies will handle their own indentation */}
          {comments.map((comment) => (
            <div key={comment.id}>
              <CommentThread
                comment={comment}
                postId={postId}
                onCommentUpdate={handleCommentUpdate}
              />
            </div>
          ))}

          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="h-4" />

          {isFetchingNextPage && (
            <div className="space-y-4 px-6">
              <CommentItemSkeleton />
              <CommentItemSkeleton />
            </div>
          )}

          {hasNextPage && !isFetchingNextPage && (
            <div className="text-center px-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNextPage()}
                className="text-xs"
              >
                Load more comments
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CommentListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
      <CommentItemSkeleton />
      <CommentItemSkeleton />
      <CommentItemSkeleton />
    </div>
  )
}

function CommentItemSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}