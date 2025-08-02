import { createFileRoute } from '@tanstack/react-router'
import { useUser, usePosts } from '@/api'
import { PageHeader } from '@/components/layout/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PostCard } from '@/components/posts/post-card'
import { Loader2, MapPin, Calendar, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const Route = createFileRoute('/(app)/users/$userId')({
  component: UserProfilePage,
})

function UserProfilePage() {
  const { userId } = Route.useParams()
  const { data: userProfile, isLoading: userLoading, error: userError } = useUser(userId)
  const { data: userPosts, isLoading: postsLoading } = usePosts(undefined, userId)

  if (userLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  if (userError || !userProfile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">User not found</h2>
        <p className="text-muted-foreground">The user profile you're looking for doesn't exist.</p>
      </div>
    )
  }

  const user = userProfile.user

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-background px-6 py-8 border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {user.postCount || 0} posts
                </div>
              </div>

              {user.isAnonymous && (
                <Badge variant="secondary">Guest User</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="px-6">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title={`${user.name}'s Posts`}
            description={`Recent posts from ${user.name}`}
          />

          <div className="mt-6">
            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading posts...</span>
              </div>
            ) : !userPosts || userPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {user.name} hasn't shared any posts yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}