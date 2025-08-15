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
import { subscription, useActiveOrganization, useSession } from '@/lib/auth-client'
import { env } from '@/lib/env'

interface UpgradeOrganizationDialogProps {
  children?: React.ReactNode
  triggerClassName?: string
}

export function UpgradeOrganizationDialog({ children, triggerClassName }: UpgradeOrganizationDialogProps) {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()


  const handleUpgrade = (planId: string) => {
    if (!session?.session?.activeOrganizationId) {
      console.error('No active organization found')
      return
    }

    console.log("Upgrading organization", session.session.activeOrganizationId, planId)
    setOpen(false)
    subscription.upgrade({
      plan: planId,
      referenceId: session.session.activeOrganizationId,
      successUrl: `${env.appUrl}/feed`,
      cancelUrl: `${env.appUrl}/feed`,
      returnUrl: `${env.appUrl}/feed`,
      disableRedirect: false,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger >
        {children || (
          <Button className={triggerClassName}>
            <CreditCard className="h-4 w-4 mr-2" />
            Upgrade Business
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Upgrade Your Business Account</DialogTitle>
          <DialogDescription>
            Unlock advanced features and increased limits for your business account
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <PricingTable onUpgrade={handleUpgrade} />
        </div>
      </DialogContent>
    </Dialog>
  )
}