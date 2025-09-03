import { useUserSubscriptions } from '@/api'
import { CurrentPlanCard } from './current-plan-card'
import { UpgradePlanCard } from './upgrade-plan-card'

interface PricingTableProps {
  onUpgrade?: (planId: string) => void
}

export function PricingTable({ onUpgrade }: PricingTableProps) {
  const { data: subscriptions } = useUserSubscriptions()
  const currentSub = subscriptions?.[0]
  const currentPlan = currentSub?.plan || 'free'
  const isFreePlan = currentPlan === 'free'

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade('pro')
    }
  }

  // Create plan representations for display
  const freePlan = {
    plan: 'free',
    status: 'available',
    limits: { postsPerDay: 1 }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* Free Plan Card */}
      <CurrentPlanCard 
        plan={freePlan}
      />
      
      {/* Pro Plan Card */}
      <UpgradePlanCard 
        onUpgrade={handleUpgrade}
        isCurrentPlan={!isFreePlan}
      />
    </div>
  )
}