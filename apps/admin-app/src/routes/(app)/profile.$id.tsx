import { createFileRoute } from '@tanstack/react-router'
import { useGetProfile } from '@/api/profile'
import { UserProfileView } from '@/components/profile/user-profile-view'
import { OrganizationProfileView } from '@/components/profile/organization-profile-view'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/(app)/profile/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data, isLoading, error } = useGetProfile(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      {data.type === 'user' ? (
        <UserProfileView data={data} />
      ) : (
        <OrganizationProfileView data={data} />
      )}
    </div>
  )
}