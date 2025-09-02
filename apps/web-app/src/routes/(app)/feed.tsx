import { createFileRoute } from '@tanstack/react-router'
import { PostsFeedView } from '@/components/posts/posts-feed-view'
import { PageHeader } from '@/components/layout/page-header'
import { NewPostDialog } from '@/components/posts/new-post-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePostLimits } from '@/api'
import { Clock } from 'lucide-react'

export const Route = createFileRoute('/(app)/feed')({
  component: FeedPage,
})

function FeedPage() {
  const { data: limits } = usePostLimits()
  
  const getResetTimeDisplay = () => {
    if (!limits?.hoursUntilReset) return '';
    const hours = limits.hoursUntilReset;
    if (hours === 1) return 'in 1 hour';
    if (hours < 24) return `in ${hours} hours`;
    return 'tomorrow';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      <div className="bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Community Feed"
            description="Connect with the Bangladeshi diaspora community"
          />
          <div className="flex items-center gap-4">
            {limits && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {limits.remainingToday}/{limits.dailyLimit} posts • Resets {getResetTimeDisplay()}
                </span>
              </div>
            )}
            <NewPostDialog />
          </div>
        </div>
      </div>

    
      <div className="flex-1 overflow-hidden">
        <PostsFeedView />
      </div>
    </div>
  )
}

