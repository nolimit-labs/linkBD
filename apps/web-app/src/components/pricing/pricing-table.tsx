import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { subscription } from '@/lib/auth-client'
import { env } from '@/lib/env'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '5 todos',
      '5 file uploads',
      'Basic support'
    ],
    buttonText: 'Current Plan',
    planId: 'free',
    disabled: true
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'For power users who need more',
    features: [
      '20 todos',
      '20 file uploads',
      'Priority support',
      'Advanced features'
    ],
    buttonText: 'Upgrade to Pro',
    planId: 'pro',
    disabled: false
  }
]

interface PricingTableProps {
  onUpgrade?: (planId: string) => void
}

export function PricingTable({ onUpgrade }: PricingTableProps) {
  const handleUpgrade = (planId: string) => {
    if (onUpgrade) {
      onUpgrade(planId)
    } else {
      subscription.upgrade({
        plan: planId,
        successUrl: `${env.appUrl}/todos`,
        cancelUrl: `${env.appUrl}/todos`,
        returnUrl: `${env.appUrl}/todos`,
        disableRedirect: false,
      })
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {plans.map((plan) => (
        <Card key={plan.name} className={plan.name === 'Pro' ? 'border-primary' : ''}>
          <CardHeader>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground ml-2">/{plan.period}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="w-full"
              variant={plan.name === 'Pro' ? 'default' : 'outline'}
              disabled={plan.disabled}
              onClick={() => handleUpgrade(plan.planId)}
            >
              {plan.buttonText}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}