import { useUserSubscriptions } from '@/api'
import { Card, CardContent } from '@/components/ui/card'
import { CurrentPlanCard } from '@/components/billing/current-plan-card'
import { UpgradeLearnMoreCard } from '@/components/billing/upgrade-learn-more-card'
import { env } from '@/lib/env'
import { subscription } from '@/lib/auth-client'

export function BillingSettings() {
  const { data: subscriptions } = useUserSubscriptions()
  
  const currentSub = subscriptions?.[0]
  const isFreePlan = currentSub?.plan === 'free'

  return (
    <div className="space-y-6">
      {currentSub ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Current Plan Card */}
          <CurrentPlanCard 
            plan={currentSub} 
            showManageBilling={true}
          />

          {/* Upgrade Card - Only show for free plan */}
          {isFreePlan && (
            <UpgradeLearnMoreCard />
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Loading subscription information...</p>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
}