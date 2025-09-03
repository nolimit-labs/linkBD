import { User, Building, ChevronsUpDown, UserCircle } from "lucide-react"
import { useCurrentUser } from "@/api/user"
import { useGetProfile } from "@/api/profile"
import { cn } from "@/lib/utils"
import { useActiveOrganization } from "@/lib/auth-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { AccountSwitcher } from "@/components/layout/account-switcher-dialog"
import { Link } from "@tanstack/react-router"

// Used for displaying current account (user or organization) with a popover

interface CurrentAccountBoxProps {
  className?: string
}

export function CurrentAccountBox({ className }: CurrentAccountBoxProps) {
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false)
  const { data: user } = useCurrentUser()
  const { data: activeOrg } = useActiveOrganization()
  
  // Get profile data for current account (user or active org)
  const currentAccountId = activeOrg?.id || user?.id
  const { data: profileData } = useGetProfile(currentAccountId)
  
  // Determine current account info
  const isOrganization = !!activeOrg
  const currentAccount = {
    id: currentAccountId,
    name: activeOrg ? activeOrg.name : user?.name || 'Personal Account',
    image: profileData?.image,
    description: profileData?.description,
    type: isOrganization ? 'Business Account' : 'Personal Account'
  }


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
            <Avatar className="w-12 h-12 rounded-md">
              <AvatarImage 
                src={currentAccount.image || undefined} 
                className="rounded-md object-cover" 
              />
              <AvatarFallback className="rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {isOrganization ? (
                  <Building className="w-5 h-5 text-primary" />
                ) : (
                  <User className="w-5 h-5 text-primary" />
                )}
              </AvatarFallback>
            </Avatar>

            {/* Account Info */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-medium text-foreground truncate">
                {currentAccount.name}
              </p>
              <p className="text-sm text-primary truncate">
                {currentAccount.type}
              </p>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="end" side="right">
          {/* Account Info Header */}
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">
              {currentAccount.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {isOrganization ? 'Business Account' : user?.email}
            </p>
            {isOrganization && (
              <p className="text-xs text-primary mt-1">
                Managed by {user?.name}
              </p>
            )}
          </div>

          <Separator className="my-2" />

          {/* Menu Items */}
          <div className="space-y-1">
            {/* View My Profile */}
            {user?.id && (
              <Link to="/profile/$id" params={{ id: user.id }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <UserCircle className="mr-2 h-4 w-4" />
                  View My Profile
                </Button>
              </Link>
            )}

            {/* View Organization Profile */}
            {activeOrg && (
              <Link to="/profile/$id" params={{ id: activeOrg.id }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Building className="mr-2 h-4 w-4" />
                  View {activeOrg.name} Profile
                </Button>
              </Link>
            )}

            {/* Separator if we have profile links */}
            {(user?.id || activeOrg) && <Separator className="my-2" />}

            {/* Switch Account */}
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