import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Sparkles, 
  Zap, 
  Shield, 
  TrendingUp,
  Crown
} from 'lucide-react'
import { env } from '@/lib/env'

interface UpgradePlanCardProps {
  onUpgrade?: () => void
  isCurrentPlan?: boolean
}

export function UpgradePlanCard({ onUpgrade, isCurrentPlan = false }: UpgradePlanCardProps) {
  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Pro</CardTitle>
          <Crown className="h-5 w-5 text-primary" />
        </div>
        <p className="text-base text-muted-foreground">Unlock your full potential</p>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">${env.proPlanPrice}</span>
            <span className="text-muted-foreground text-lg ml-2">/per month</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 relative">
        <ul className="space-y-3">
          <li className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="text-sm font-medium">20 posts per day</span>
          </li>
          <li className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="text-sm">Priority support & assistance</span>
          </li>
          <li className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="text-sm">Advanced analytics & insights</span>
          </li>
          <li className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="text-sm">Exclusive Pro features</span>
          </li>
        </ul>
        
        <Button
          className="w-full"
          size="lg"
          disabled={isCurrentPlan}
          onClick={onUpgrade}
        >
          {isCurrentPlan ? 'Current Plan' : (
            <>
              Upgrade to Pro
              <Sparkles className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        
        {!isCurrentPlan && (
          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>✓ Secure payment via Stripe</p>
            <p>✓ Cancel anytime with one click</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}