import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { subscription } from '@/lib/auth-client'
import { env } from '@/lib/env'
import { Check, Crown, Calendar } from 'lucide-react'

interface CurrentPlanCardProps {
  plan: {
    plan: string
    status: string
    limits?: Record<string, any>
    id?: string
  }
  showManageBilling?: boolean
}

export function CurrentPlanCard({ plan, showManageBilling = false }: CurrentPlanCardProps) {
  const isFreePlan = plan.plan === 'free'
  const isComplementary = plan.plan === 'pro_complementary'
  const isPaidPro = plan.plan === 'pro'
  
  // Format plan name for display
  const formatPlanName = (planName: string) => {
    if (planName === 'pro_complementary') return 'Pro Complementary'
    return planName
  }

  const handleManageBilling = () => {
    subscription.billingPortal({
      returnUrl: env.appUrl + '/settings',
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Current Plan</CardTitle>
          {!isFreePlan && <Crown className="h-5 w-5 text-primary" />}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold capitalize">{formatPlanName(plan.plan)}</span>
            {!isFreePlan && (
              <Badge variant="default" className="ml-2">PRO</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {isFreePlan ? 'Perfect for getting started' : 
             isComplementary ? 'This was gifted to you by the linkBD team' : ''}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Plan Features */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Your benefits:</p>
            <ul className="space-y-2">
              {plan.limits && Object.entries(plan.limits).map(([key, value]) => {
                const formatLimit = (limitKey: string, limitValue: any) => {
                  if (limitKey === 'postsPerDay') {
                    return `${limitValue} ${limitValue === 1 ? 'post' : 'posts'} per day`;
                  }
                  return `${limitKey}: ${limitValue}`;
                };
                
                return (
                  <li key={key} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{formatLimit(key, value)}</span>
                  </li>
                );
              })}
              {isFreePlan ? (
                <>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Basic community access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Standard support</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">Advanced features</span>
                  </li>
                </>
              )}
            </ul>
          </div>


          {/* Action Button - Only for paid Pro plans in settings */}
          {showManageBilling && plan.status === 'active' && isPaidPro && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleManageBilling}
            >
              Manage Billing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}