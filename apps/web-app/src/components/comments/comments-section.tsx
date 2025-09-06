import { CommentList } from './comment-list'
import { CommentInput } from './comment-input'
import { Card, CardContent } from '@/components/ui/card'
import { useSession } from '@/lib/auth-client'

interface CommentsSectionProps {
  postId: string
  className?: string
}

export function CommentsSection({ 
  postId, 
  className
}: CommentsSectionProps) {
  const { data: session } = useSession()

  const handleCommentSuccess = () => {
    // Comment posted successfully - no additional action needed
  }

  return (
    <Card className={className}>
      <CardContent className="space-y-4 px-0 ">
        {/* Comment Input - Always visible, expandable on click */}
        {session && (
          <div className="px-6">
            <CommentInput
              postId={postId}
              placeholder="Join the conversation..."
              onSuccess={handleCommentSuccess}
              compact={true}
            />
          </div>
        )}

        {/* Comments List - no horizontal padding for flush threading */}
        <CommentList className="py-2"
          postId={postId}
        />
      </CardContent>
    </Card>
  )
}

// Export individual components for flexibility
export { CommentCard } from './comment-card'
export { CommentInput } from './comment-input'
export { CommentList } from './comment-list'
export { CommentThread } from './comment-thread'
export { CommentEditor } from './comment-editor'