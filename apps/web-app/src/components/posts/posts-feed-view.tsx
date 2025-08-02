import { usePosts, useDeletePost } from '@/api'
import { PostCard } from './post-card'
import { Loader2 } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { useActiveOrganization } from '@/lib/auth-client'

interface PostsFeedViewProps {
  feedType: 'public' | 'personal' | 'organization'
}

export function PostsFeedView({ feedType }: PostsFeedViewProps) {
  const { data: session } = useSession()
  const { data: activeOrg } = useActiveOrganization()
  const deletePost = useDeletePost()
  
  // Determine query parameters based on feed type
  const getFeedParams = () => {
    switch (feedType) {
      case 'public':
        return { feed: 'public' as const, targetUserId: undefined }
      case 'personal':
        return { feed: undefined, targetUserId: session?.user?.id }
      case 'organization':
        return { feed: 'organization' as const, targetUserId: undefined }
      default:
        return { feed: 'public' as const, targetUserId: undefined }
    }
  }
  
  const { feed, targetUserId } = getFeedParams()
  const { data: posts, isLoading, error } = usePosts(feed, targetUserId)
  
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
    const getEmptyMessage = () => {
      switch (feedType) {
        case 'public':
          return 'No posts in the public feed yet. Be the first to share something!'
        case 'personal':
          return 'You haven\'t created any posts yet. Share your first post!'
        case 'organization':
          return `No posts from ${activeOrg?.name} yet. Start a conversation!`
        default:
          return 'No posts to show.'
      }
    }
    
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{getEmptyMessage()}</p>
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