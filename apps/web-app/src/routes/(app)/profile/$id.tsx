import { createFileRoute } from '@tanstack/react-router'
import { useGetProfile } from '@/api'
import { Loader2 } from 'lucide-react'
import { UserProfileView } from '@/components/profile/user-profile-view'
import { OrganizationProfileView } from '@/components/profile/organization-profile-view'

export const Route = createFileRoute('/(app)/profile/$id')({
  component: ProfilePage,
})

function ProfilePage() {
  const { id } = Route.useParams()
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfile(id)

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

  return isOrganization ? (
    <OrganizationProfileView profile={profile as any} />
  ) : (
    <UserProfileView profile={profile as any} />
  )
}
