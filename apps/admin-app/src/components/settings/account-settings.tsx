import { useUserSubscriptions, useBilling } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { signOut, subscription } from '@/lib/auth-client'
import { env } from '@/lib/env'
import { AccountInfoCard } from './account-info-card'
import { useNavigate } from '@tanstack/react-router'
import type { Subscription } from '@better-auth/stripe'

export function AccountSettings() {
  const { data: billing, isLoading: isBillingLoading } = useBilling()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            navigate({ to: '/sign-in' })
          }
        }
      })
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  console.log("billing", billing)


  return (
    <div className="space-y-6">
      {/* Account Information */}
      <AccountInfoCard />

      {/* Billing & Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Billing & Usage</CardTitle>
          <CardDescription>
            View your current plan, usage metrics, and manage your subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isBillingLoading ? (
            <div className="text-muted-foreground">Loading billing data...</div>
          ) : billing ? (
            <div className="space-y-6">
              {/* Plan & Status */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{billing.subscription?.plan?.name || 'Free'} Plan</div>
                  {billing.subscription && (
                    <div className="text-sm text-muted-foreground capitalize">
                      Status: {billing.subscription.status || 'Active'}
                    </div>
                  )}
                </div>
                {billing.subscription?.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      subscription.cancel({
                        returnUrl: env.app.url() + '/todos',
                        subscriptionId: billing.subscription.id,
                      });
                    }}
                  >
                    Cancel Subscription
                  </Button>
                )}
              </div>

              {/* Usage Metrics */}
              <div>
                <Label className="text-base font-medium">Current Usage</Label>
                <div className="mt-3 space-y-4">
                  {/* Todos Usage */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">Todos</div>
                      <div className="text-xs text-muted-foreground">Total todos created</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-semibold">
                        {billing.usage?.todos || 0}/{billing.subscription?.limits?.todos || '∞'}
                      </div>
                      {billing.subscription?.limits?.todos && (
                        <div className="w-20 bg-secondary rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all" 
                            style={{ 
                              width: `${Math.min(100, ((billing.usage?.todos || 0) / billing.subscription.limits.todos) * 100)}%` 
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Images Usage */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">Images</div>
                      <div className="text-xs text-muted-foreground">Files uploaded</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-semibold">
                          {billing.usage?.files || 0}/{billing.subscription?.limits?.files || '∞'}
                      </div>
                      {billing.subscription?.limits?.files && (
                        <div className="w-20 bg-secondary rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all" 
                            style={{ 
                              width: `${Math.min(100, ((billing.usage?.files || 0) / billing.subscription.limits.files) * 100)}%` 
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              {billing.subscription?.features && billing.subscription.features.length > 0 && (
                <div>
                  <Label className="text-base font-medium">Plan Features</Label>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {billing.subscription.features.map((feature: string, index: number) => (
                      <div key={index} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <div>No billing data available</div>
              <div className="text-xs mt-1">Unable to load your billing information</div>
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