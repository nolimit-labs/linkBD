import { createFileRoute } from '@tanstack/react-router'
import { PostsFeedView } from '@/components/posts/posts-feed-view'
import { PageHeader } from '@/components/layout/page-header'
import { NewPostDialog } from '@/components/posts/new-post-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePostLimits } from '@/api'
import { Clock } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

export const Route = createFileRoute('/(app)/feed')({
  component: FeedPage,
})

function FeedPage() {
  const { data: limits } = usePostLimits()
  const [feedFilter, setFeedFilter] = useState<'all' | 'following'>('all')
  
  const getResetTimeDisplay = () => {
    if (!limits?.hoursUntilReset) return '';
    const hours = limits.hoursUntilReset;
    if (hours === 1) return 'in 1 hour';
    if (hours < 24) return `in ${hours} hours`;
    return 'tomorrow';
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden">
      {/* Left: feed content grows */}
      <div className="flex-1 flex flex-col">
        <div className="bg-background px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <PageHeader
              title="Community Feed"
              description="Connect with the Bangladeshi diaspora community"
            />
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <PostsFeedView filter={feedFilter} />
        </div>
      </div>

      {/* Right: actions/sidebar */}
      <div className="w-[320px] flex flex-col mt-16">
        <div className="p-4 flex flex-col gap-3 w-full">
          <div className="w-full">
            <label className="text-sm text-muted-foreground">Filter</label>
            <Select value={feedFilter} onValueChange={(v) => setFeedFilter(v as 'all' | 'following')}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select feed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="following">Following</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <NewPostDialog />

          {limits && (
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {limits.remainingToday}/{limits.dailyLimit} posts today
                </span>
              </div>
              <div className="mt-1">Resets {getResetTimeDisplay()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

