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

interface UpgradeDialogProps {
  children?: React.ReactNode
  triggerClassName?: string
}

export function UpgradeDialog({ children, triggerClassName }: UpgradeDialogProps) {
  const [open, setOpen] = useState(false)

  const handleUpgrade = (planId: string) => {
    setOpen(false)
    subscription.upgrade({
      plan: planId,
      successUrl: `${env.app.url()}/todos`,
      cancelUrl: `${env.app.url()}/todos`,
      returnUrl: `${env.app.url()}/todos`,
      disableRedirect: false,
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className={triggerClassName}>
            <CreditCard className="h-4 w-4 mr-2" />
            Upgrade
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose Your Plan</DialogTitle>
          <DialogDescription>
            Upgrade your account to unlock more features and increased limits
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6">
          <PricingTable onUpgrade={handleUpgrade} />
        </div>
      </DialogContent>
    </Dialog>
  )
}