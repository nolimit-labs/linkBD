import { createFileRoute } from '@tanstack/react-router'
import { useProfile, usePosts } from '@/api'
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
  const { data: profileData, isLoading: profileLoading, error: profileError } = useProfile(id)
  
  // Get posts based on profile type
  const { data: profilePosts, isLoading: postsLoading } = usePosts(
    profileData?.type === 'organization' ? profileData.profile.id : undefined,
    profileData?.type === 'user' ? profileData.profile.id : undefined
  )

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  if (profileError || !profileData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
        <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
      </div>
    )
  }

  const isOrganization = profileData.type === 'organization'
  const profile = profileData.profile

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-background px-6 py-8 border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={
                isOrganization 
                  ? profile.logoUrl || undefined
                  : profile.avatarUrl || undefined
              } />
              <AvatarFallback className="text-2xl">
                {isOrganization && <Building2 className="h-12 w-12" />}
                {!isOrganization && (profile.name?.charAt(0) || '?')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {!isOrganization && (
                  <p className="text-muted-foreground">{profile.email}</p>
                )}
                {isOrganization && profile.slug && (
                  <p className="text-muted-foreground">@{profile.slug}</p>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {isOrganization ? 'Established' : 'Joined'} {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                </div>
                {isOrganization ? (
                  <>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {profile.memberCount || 0} members
                    </div>
                    <div className="flex items-center gap-1">
                      {profile.postCount || 0} posts
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {profile.postCount || 0} posts
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {isOrganization && (
                  <Badge variant="secondary">
                    <Building2 className="h-3 w-3 mr-1" />
                    Business Account
                  </Badge>
                )}
                {!isOrganization && profile.isAnonymous && (
                  <Badge variant="secondary">Guest User</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="px-6">
        <div className="max-w-4xl mx-auto">
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
                {profilePosts.map((post) => (
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
