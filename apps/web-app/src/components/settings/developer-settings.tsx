import { useUser, useUserSubscriptions } from '@/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DeveloperSettings() {
  const { data: user, isLoading: userLoading } = useUser()
  const { data: subscriptions, isLoading: subscriptionsLoading } = useUserSubscriptions()

  const debugData = {
    user: user || null,
    subscriptions: subscriptions || null,
    loading: {
      user: userLoading,
      subscriptions: subscriptionsLoading
    },
    timestamp: new Date().toISOString()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
          <CardDescription>
            Complete debug data including loading states and metadata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
            <code>{JSON.stringify(debugData, null, 2)}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}