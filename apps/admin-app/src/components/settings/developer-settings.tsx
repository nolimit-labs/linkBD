import { useBilling, useCurrentUserProfile, useUserSubscriptions } from '@/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DeveloperSettings() {
  const { data: user, isLoading: userLoading } = useCurrentUserProfile()
  const { data: billing, isLoading: billingLoading } = useBilling()

  const debugData = {
    user: user || null,
    billing: billing || null,
    loading: {
      user: userLoading,
      billing: billingLoading
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