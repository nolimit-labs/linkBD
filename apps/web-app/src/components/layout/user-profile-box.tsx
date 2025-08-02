import { User, Building, Settings, ChevronsUpDown, LogOut } from "lucide-react"
import { useCurrentUser } from "@/api/user"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import { useActiveOrganization, signOut } from "@/lib/auth-client"
import { useState } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AccountSwitcher } from "./account-switcher-dialog"

interface UserProfileProps {
  className?: string
}

export function UserProfileBox({ className }: UserProfileProps) {
  const { data: user } = useCurrentUser()
  const { data: activeOrg } = useActiveOrganization()
  const [showOrgSwitcher, setShowOrgSwitcher] = useState(false)

  const accountLabel = activeOrg ? activeOrg.name : "Personal Account"

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = '/sign-in'
          }
        }
      })
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
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
            {/* User/Organization Avatar */}
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              {activeOrg ? (
                <Building className="w-5 h-5 text-primary" />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-medium text-foreground truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-sm text-primary truncate">
                {accountLabel}
              </p>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="end" side="right">
          {/* User Info Header */}
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          <Separator className="my-2" />

          {/* Menu Items */}
          <div className="space-y-1">
            {/* <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => setShowOrgSwitcher(true)}
            >
              <ChevronsUpDown className="mr-2 h-4 w-4" />
              Switch Profile
            </Button> */}

            <Link to="/settings">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <Settings className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </Link>
          </div>

          <Separator className="my-2" />

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-primary hover:text-primary"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </PopoverContent>
      </Popover>

      {/* Organization Switcher Popover , will turn on later */}
      {/* {showOrgSwitcher && (
        <AccountSwitcher
          open={showOrgSwitcher}
          onOpenChange={setShowOrgSwitcher}
        />
      )} */}
    </>
  )
} 