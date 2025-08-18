import { createFileRoute } from '@tanstack/react-router'
import { PostsFeedView } from '@/components/posts/posts-feed-view'
import { PageHeader } from '@/components/layout/page-header'
import { NewPostDialog } from '@/components/posts/new-post-dialog'

export const Route = createFileRoute('/(app)/feed')({
  component: FeedPage,
})

function FeedPage() {
  return (
    <div className="space-y-6">
      <div className="bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Community Feed"
            description="Connect with the Bangladeshi diaspora community"
          />
          <NewPostDialog />
        </div>
      </div>

      <div className="px-6">
        <PostsFeedView />
      </div>
    </div>
  )
}

