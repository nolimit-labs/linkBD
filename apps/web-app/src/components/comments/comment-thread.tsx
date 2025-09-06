import { useState } from 'react'
import { CommentCard } from './comment-card'
import { CommentInput } from './comment-input'
import { CommentEditor } from './comment-editor'
import { Button } from '@/components/ui/button'
import { useCommentReplies, useUpdateComment, useDeleteComment } from '@/api'
import { useSession } from '@/lib/auth-client'
import { toast } from 'sonner'

interface CommentThreadProps {
  comment: any
  postId: string
  depth?: number
  maxDepth?: number
  onCommentUpdate?: () => void
}

export function CommentThread({ 
  comment, 
  postId, 
  depth = 0, 
  maxDepth = 2,
  onCommentUpdate 
}: CommentThreadProps) {
  const { data: session } = useSession()
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  
  const { 
    data: repliesData, 
    fetchNextPage: fetchNextReplies,
    hasNextPage: hasMoreReplies,
    isFetchingNextPage: isFetchingMoreReplies,
    isLoading: isLoadingReplies
  } = useCommentReplies(postId, comment.id)

  console.log('repliesData', repliesData)
  
  const updateComment = useUpdateComment()
  const deleteComment = useDeleteComment()

  const replies = repliesData?.pages.flatMap(page => page.comments) ?? []

  const handleReply = (_commentId: string) => {
    if (!session) {
      toast.error('Please sign in to reply')
      return
    }
    setShowReplyInput(true)
  }

  const handleEdit = (commentId: string, _currentContent: string) => {
    setEditingCommentId(commentId)
  }

  const handleDelete = (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return
    }
    
    deleteComment.mutate(
      { postId, commentId },
      {
        onSuccess: () => {
          onCommentUpdate?.()
        }
      }
    )
  }

  const handleShowReplies = (_commentId: string) => {
    setShowReplies(!showReplies)
  }

  const handleReplySuccess = () => {
    setShowReplyInput(false)
    setShowReplies(true) // Show replies after successful reply
    onCommentUpdate?.()
  }

  const handleEditSave = (commentId: string, content: string) => {
    updateComment.mutate(
      { postId, commentId, content },
      {
        onSuccess: () => {
          setEditingCommentId(null)
          onCommentUpdate?.()
        }
      }
    )
  }

  const handleEditCancel = () => {
    setEditingCommentId(null)
  }

  const hasReplies = (comment.repliesCount ?? 0) > 0 || replies.length > 0
  const shouldShowReplies = showReplies && hasReplies
  const totalReplies = Math.max(comment.repliesCount ?? 0, replies.length)

  return (
    <div className="space-y-2">
      {/* Main Comment */}
      {editingCommentId === comment.id ? (
        <CommentEditor
          initialContent={comment.content}
          onSave={(content) => handleEditSave(comment.id, content)}
          onCancel={handleEditCancel}
          isLoading={updateComment.isPending}
        />
      ) : (
        <CommentCard
          comment={comment}
          depth={depth}
          onReply={depth < maxDepth ? handleReply : undefined}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onShowReplies={handleShowReplies}
          repliesCountDisplay={totalReplies}
        />
      )}

      {/* Reply Input - only indent if this is a reply (depth >= 0, but input is always indented) */}
      {showReplyInput && depth < maxDepth && (
        <div className="ml-10 mt-2">
          <CommentInput
            postId={postId}
            parentId={comment.id}
            placeholder={`Reply to ${comment.author?.name || 'this comment'}...`}
            onSuccess={handleReplySuccess}
            onCancel={() => setShowReplyInput(false)}
            autoFocus
          />
        </div>
      )}

      {/* Replies */}
      {shouldShowReplies && (
        <div className="space-y-1">
          {isLoadingReplies && (
            <div className="ml-10 text-sm text-muted-foreground">
              Loading replies...
            </div>
          )}
          
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              maxDepth={maxDepth}
              onCommentUpdate={onCommentUpdate}
            />
          ))}
          
          {hasMoreReplies && (
            <div className="ml-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchNextReplies()}
                disabled={isFetchingMoreReplies}
                className="text-xs"
              >
                {isFetchingMoreReplies ? 'Loading...' : 'Load more replies'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}