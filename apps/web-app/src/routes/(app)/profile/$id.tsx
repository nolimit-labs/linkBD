import { createFileRoute } from '@tanstack/react-router'
import { useGetProfile, useGetPostsByAuthor } from '@/api'
import { Loader2 } from 'lucide-react'
import { UserProfileView } from '@/components/profile/user-profile-view'
import { OrganizationProfileView } from '@/components/profile/organization-profile-view'

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

  // Ensure posts have author information (fallback)
  const postsWithAuthor = (profilePosts || []).map((post: any) => ({
    ...post,
    author: post.author || {
      id: profile.id,
      name: profile.name,
      image: profile.image,
      type: profile.type,
      isOfficial: (profile as any).isOfficial ?? false,
      subscriptionPlan: (profile as any).subscriptionPlan ?? 'free',
    },
  }))

  return isOrganization ? (
    <OrganizationProfileView profile={profile as any} posts={postsWithAuthor} postsLoading={postsLoading} />
  ) : (
    <UserProfileView profile={profile as any} posts={postsWithAuthor} postsLoading={postsLoading} />
  )
}
