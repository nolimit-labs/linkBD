import { createFileRoute, notFound } from '@tanstack/react-router'
import { usePost } from '@/api'
import { PostDetailView } from '@/components/posts/post-detail-view'
import { LoadingSpinner } from '@/components/layout/loading-spinner'

export const Route = createFileRoute('/(app)/posts/$id')({
  component: PostDetailComponent,
})

function PostDetailComponent() {
  const { id } = Route.useParams()
  const { data: post, isLoading, error } = usePost(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !post) {
    throw notFound()
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <PostDetailView post={post} />
    </div>
  )
}