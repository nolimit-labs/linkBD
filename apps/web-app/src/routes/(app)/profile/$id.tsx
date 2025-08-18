import { createFileRoute } from '@tanstack/react-router'
import { useGetProfile, useGetPostsByAuthor } from '@/api'
import { PageHeader } from '@/components/layout/page-header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PostCard } from '@/components/posts/post-card'
import { Loader2, MapPin, Calendar, Users, Building2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const Route = createFileRoute('/(app)/profile/$id')({
  component: ProfilePage,
})

function ProfilePage() {
  const { id } = Route.useParams()
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfile(id)
  
  // Get posts based on profile type
  const { data: profilePosts, isLoading: postsLoading } = useGetPostsByAuthor(id)

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
        <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
      </div>
    )
  }

  const isOrganization = profile.type === 'organization'

  return (
    <div className="space-y-6 px-8">
      {/* Profile Header */}
      <div className="bg-background pt-6 pb-2">
        <div className="mx-auto">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.image || undefined} />
              <AvatarFallback className="text-2xl">
                {isOrganization && <Building2 className="h-12 w-12" />}
                {!isOrganization && (profile.name?.charAt(0) || '?')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {isOrganization ? 'Established' : 'Joined'} {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                </div>
              </div>

              <div className="flex gap-2">
                {isOrganization && (
                  <Badge variant="secondary">
                    <Building2 className="h-3 w-3 mr-1" />
                    Organization
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="">
        <div className="mx-auto">
          <PageHeader
            title={`${profile.name}'s Posts`}
            description={`Recent posts from ${profile.name}`}
          />

          <div className="mt-6">
            {postsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading posts...</span>
              </div>
            ) : !profilePosts || profilePosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {profile.name} hasn't shared any posts yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {profilePosts.map((post) => {
                  // Add author information to post if missing
                  const postWithAuthor = {
                    ...post,
                    author: post.author || {
                      id: profile.id,
                      name: profile.name,
                      image: profile.image,
                      type: profile.type
                    }
                  }
                  return <PostCard key={post.id} post={postWithAuthor} />
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
