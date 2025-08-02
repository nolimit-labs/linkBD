import { createFileRoute } from '@tanstack/react-router'
import { PostsFeedView } from '@/components/posts/posts-feed-view'
import { PageHeader } from '@/components/layout/page-header'
import { useActiveOrganization } from '@/lib/auth-client'
import { Badge } from '@/components/ui/badge'
import { Building2, User, Globe } from 'lucide-react'
import { NewPostDialog } from '@/components/posts/new-post-dialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/(app)/feed')({
  component: FeedPage,
})

function FeedPage() {
  const { data: activeOrg } = useActiveOrganization()
  const [feedType, setFeedType] = useState<'public' | 'personal' | 'organization'>('public')

  const getFeedInfo = () => {
    switch (feedType) {
      case 'public':
        return {
          title: 'Public Feed',
          description: 'Connect with the Bangladeshi diaspora community',
          icon: <Globe className="h-3 w-3" />,
          variant: 'default' as const
        }
      case 'organization':
        return {
          title: `${activeOrg?.name} Feed`,
          description: `Posts from your organization members`,
          icon: <Building2 className="h-3 w-3" />,
          variant: 'default' as const
        }
      default:
        return {
          title: 'My Posts',
          description: 'Your personal posts and updates',
          icon: <User className="h-3 w-3" />,
          variant: 'secondary' as const
        }
    }
  }

  const feedInfo = getFeedInfo()

  return (
    <div className="space-y-6">
      <div className="bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <PageHeader
            title={feedInfo.title}
            description={feedInfo.description}
          />
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                variant={feedType === 'public' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedType('public')}
              >
                Public
              </Button>
              {activeOrg && (
                <Button
                  variant={feedType === 'organization' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFeedType('organization')}
                >
                  {activeOrg.name}
                </Button>
              )}
              <Button
                variant={feedType === 'personal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFeedType('personal')}
              >
                My Posts
              </Button>
            </div>
            <NewPostDialog />
          </div>
        </div>
      </div>

      <div className="px-6">
        <PostsFeedView feedType={feedType} />
      </div>
    </div>
  )
}

