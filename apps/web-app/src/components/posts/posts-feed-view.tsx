import { useInfinitePostsFeed, useDeletePost } from '@/api'
import { PostCard } from './post-card'
import { Loader2 } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { useEffect, useRef, useCallback } from 'react'

export function PostsFeedView() {
  const { data: session } = useSession()
  const deletePost = useDeletePost()
  const loadMoreRef = useRef<HTMLDivElement>(null)
  
  // Use infinite scroll for posts feed
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfinitePostsFeed(4)
  
  // Flatten all pages into a single posts array
  const posts = data?.pages.flatMap(page => page.posts) || []
  
  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deletePost.mutate(postId)
    }
  }
  
  // Intersection Observer for infinite scroll
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])
  
  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return
    
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    })
    
    observer.observe(element)
    return () => observer.disconnect()
  }, [handleIntersection])
  
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
      
      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
        {isFetchingNextPage && (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading more posts...</span>
          </div>
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-sm text-muted-foreground">You've reached the end!</p>
        )}
      </div>
    </div>
  )
}