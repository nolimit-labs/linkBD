import { useCurrentUser, useUserSubscriptions } from '@/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from '@/lib/auth-client'

export function DeveloperSettings() {
  const { data: user } = useCurrentUser()
  const { data: subscriptions } = useUserSubscriptions()
  const { data: session } = useSession()

  const debugData = {
    session: session || null,
    user: user || null,
    subscriptions: subscriptions || null,
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