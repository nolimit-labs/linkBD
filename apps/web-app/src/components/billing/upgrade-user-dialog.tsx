import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PricingTable } from './pricing-table'
import { CreditCard } from 'lucide-react'
import { subscription } from '@/lib/auth-client'
import { env } from '@/lib/env'
import { useCurrentUserProfile } from '@/api/user'

interface UpgradeUserSubscriptionDialogProps {
  children?: React.ReactNode
  triggerClassName?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function UpgradeUserSubscriptionDialog({ 
  children, 
  triggerClassName, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: UpgradeUserSubscriptionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen
  const { data: user } = useCurrentUserProfile()

  const handleUpgrade = (planId: string) => {
    if (!user?.id) {
      console.error('No user found')
      return
    }

    setOpen(false)
    subscription.upgrade({
      plan: 'pro',
      successUrl: `${env.appUrl}/settings?upgraded=true`,
      cancelUrl: `${env.appUrl}/settings`,
      returnUrl: `${env.appUrl}/settings`,
      disableRedirect: false,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} >
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      {!children && !controlledOpen && (
        <DialogTrigger asChild>
          <Button className={triggerClassName}>
            <CreditCard className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-6xl sm:max-w-6xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-base">
            Unlock premium features and increased limits for the Bangladeshi diaspora community
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          <PricingTable onUpgrade={handleUpgrade} />
        </div>
      </DialogContent>
    </Dialog>
  )
}