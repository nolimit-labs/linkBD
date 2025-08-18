import { User, Building, ChevronsUpDown } from "lucide-react"
import { useCurrentUser } from "@/api/user"
import { cn } from "@/lib/utils"
import { useActiveOrganization } from "@/lib/auth-client"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { AccountSwitcher } from "@/components/layout/account-switcher-dialog"

// Used for displaying current account (user or organization) with a popover

interface CurrentAccountBoxProps {
  className?: string
}

export function CurrentAccountBox({ className }: CurrentAccountBoxProps) {
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false)
  const { data: user } = useCurrentUser()
  const { data: activeOrg } = useActiveOrganization()

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 hover:border-primary border-2 border-transparent transition-all duration-300 ease-in-out cursor-pointer group",
              className
            )}
          >
            {/* Organization/User Avatar */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              {activeOrg ? (
                <Building className="w-5 h-5 text-primary" />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>

            {/* Account Info */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-medium text-foreground truncate">
                {activeOrg ? activeOrg.name : user?.name || 'Personal Account'}
              </p>
              <p className="text-sm text-primary truncate">
                {activeOrg ? 'Business Account' : 'Personal Account'}
              </p>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="end" side="right">
          {/* Account Info Header */}
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">
              {activeOrg ? activeOrg.name : user?.name || 'Personal Account'}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeOrg ? 'Business Account' : user?.email}
            </p>
            {activeOrg && (
              <p className="text-xs text-primary mt-1">
                Managed by {user?.name}
              </p>
            )}
          </div>

          <Separator className="my-2" />

          {/* Menu Items */}
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setShowOrgSwitcher(true)}
            >
              <ChevronsUpDown className="mr-2 h-4 w-4" />
              Switch Account
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Organization Switcher Dialog */}
      {showOrgSwitcher && (
        <AccountSwitcher
          open={showOrgSwitcher}
          onOpenChange={setShowOrgSwitcher}
        />
      )}
    </>
  )
}