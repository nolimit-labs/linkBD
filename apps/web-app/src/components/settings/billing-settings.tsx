import { useUserSubscriptions } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { subscription } from '@/lib/auth-client'
import { env } from '@/lib/env'

export function BillingSettings() {
  const { data: subscriptions } = useUserSubscriptions()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing & Subscription</CardTitle>
        <CardDescription>
          View and manage your current subscription plan and billing information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {subscriptions && subscriptions.length > 0 ? (
          <div className="space-y-4">
            {(() => {
              const sub = subscriptions[0]
              return (
                <>
                  <div>
                    <Label className="text-sm font-medium">Plan</Label>
                    <p className="text-sm text-muted-foreground mt-1">{sub.plan}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <p className="text-sm text-muted-foreground mt-1 capitalize">{sub.status}</p>
                  </div>
                  {sub.limits ? (
                    <div>
                      <Label className="text-sm font-medium">Plan Limits</Label>
                      <div className="mt-1 space-y-1">
                        {Object.entries(sub.limits).map(([key, value]) => (
                          <p key={key} className="text-sm text-muted-foreground">
                            {key}: {value as unknown as string}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-sm font-medium">Plan Limits</Label>
                      <p className="text-sm text-muted-foreground mt-1">Not available</p>
                    </div>
                  )}
                  {sub.status === 'active' && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          subscription.cancel({
                            returnUrl: env.appUrl + '/feed',
                            subscriptionId: sub.id,
                          })
                        }}
                      >
                        Cancel Subscription
                      </Button>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        ) : (
          <div className="text-muted-foreground">You do not have an active subscription.</div>
        )}
      </CardContent>
    </Card>
  )
}



