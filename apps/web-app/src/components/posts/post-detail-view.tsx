import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from '@tanstack/react-router'
import { PostCard } from './post-card'
import { CommentsSection } from '@/components/comments/comments-section'
import { rpcClient } from '@/api'
import type { ComponentProps } from 'react'

// Utility: extract JSON payload type from an endpoint method like $get
type JsonOf<T extends (...args: any) => Promise<any>> = Awaited<
  ReturnType<Awaited<ReturnType<T>>['json']>
>
type SuccessJsonOf<T extends (...args: any) => Promise<any>> = Exclude<
  JsonOf<T>,
  { error: string }
>

// Type for GET /api/posts/:id success response body
const getPost = rpcClient.api.posts[':id'].$get
type Post = SuccessJsonOf<typeof getPost>
type PostCardPost = ComponentProps<typeof PostCard>['post']

interface PostDetailViewProps {
  post: Post
  onEdit?: () => void
  onDelete?: () => void
}

export function PostDetailView({ post, onEdit, onDelete }: PostDetailViewProps) {
  const router = useRouter()

  const handleBack = () => {
    router.history.back()
  }

  // Ensure PostCard receives a non-null author shape
  const postForCard: PostCardPost = {
    ...post,
    author: post.author ?? {
      id: post.userId || '',
      name: 'Unknown User',
      image: null,
      type: 'user',
      isOfficial: false,
      subscriptionPlan: 'free'
    }
  } as unknown as PostCardPost

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Use the actual PostCard component */}
      <PostCard 
        post={postForCard}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      {/* Comments Section */}
      <CommentsSection postId={post.id} />
    </div>
  )
}