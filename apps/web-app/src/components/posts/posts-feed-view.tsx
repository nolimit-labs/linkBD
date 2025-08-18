import { useFeed, useDeletePost } from '@/api'
import { PostCard } from './post-card'
import { Loader2 } from 'lucide-react'
import { useSession } from '@/lib/auth-client'

export function PostsFeedView() {
  const { data: session } = useSession()
  const deletePost = useDeletePost()
  
  // Always use public feed
  const { data: posts, isLoading, error } = useFeed()
  
  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(postId)
    }
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading posts...</span>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load posts. Please try again.</p>
      </div>
    )
  }
  
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No posts in the feed yet. Be the first to share something!</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onDelete={
            session?.user?.id === post.userId 
              ? () => handleDeletePost(post.id)
              : undefined
          }
        />
      ))}
    </div>
  )
}