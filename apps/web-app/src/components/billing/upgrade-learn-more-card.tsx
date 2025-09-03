import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Shield, 
  TrendingUp,
  Crown
} from 'lucide-react'
import { UpgradeUserSubscriptionDialog } from './upgrade-user-dialog'
import { env } from '@/lib/env'

export function UpgradeLearnMoreCard() {
  return (
    <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 relative overflow-hidden">
      <div className="absolute -top-20 -right-20 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 bg-primary/10 rounded-full blur-3xl" />
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Upgrade to Pro</CardTitle>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">${env.proPlanPrice}</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Unlock your full potential
          </p>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-4">
          {/* Benefits */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">What you'll get:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">20x more posts per day</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">Priority support & assistance</span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">Advanced analytics & insights</span>
              </li>
              <li className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">Exclusive Pro features</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-3 pt-2">
            <UpgradeUserSubscriptionDialog>
              <Button 
                className="w-full" 
                size="lg"
              >
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </UpgradeUserSubscriptionDialog>
            <p className="text-xs text-center text-muted-foreground">
              Cancel anytime • No hidden fees
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}