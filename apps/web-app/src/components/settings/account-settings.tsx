import { useUserSubscriptions } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { signOut, subscription } from '@/lib/auth-client'
import { env } from '@/lib/env'
import { AccountInfoCard } from './account-info-card'

export function AccountSettings() {
  const { data: subscriptions } = useUserSubscriptions()



  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = '/login'
          }
        }
      })
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }


  return (
    <div className="space-y-6">
      {/* Account Information */}
      <AccountInfoCard />

      {/* Billing & Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Billing & Subscription</CardTitle>
          <CardDescription>
            View and manage your current subscription plan and billing information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display current subscription info */}
          {subscriptions && subscriptions.length > 0 ? (
            <div className="space-y-4">
              {/* Show the first (active) subscription */}
              {(() => {
                const sub = subscriptions[0];
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
                    {/* Display limits if available */}
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
                    {/* Show cancel button if subscription is active/cancellable */}
                    {sub.status === 'active' && (
                      <div className="pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            console.log('sub.id', sub.id)
                            subscription.cancel({
                              returnUrl: env.app.url() + '/todos',
                              subscriptionId: sub.id,
                            });
                          }}
                        >
                          Cancel Subscription
                        </Button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="text-muted-foreground">
              You do not have an active subscription.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="w-full sm:w-auto"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 