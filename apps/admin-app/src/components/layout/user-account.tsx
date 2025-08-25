import { User, Building, Settings, LogOut } from "lucide-react"
import { useCurrentUserProfile } from "@/api/user"
import { Link } from "@tanstack/react-router"
import { cn } from "@/lib/utils"
import {  signOut } from "@/lib/auth-client"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface UserAccountProps {
  className?: string
}

export function UserAccount({ className }: UserAccountProps) {
  const { data: user } = useCurrentUserProfile()

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
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
            className
          )}
        >
          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
            <User className="w-4 h-4 text-primary" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end" side="bottom">
        {/* User Info Header */}
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.name || 'User'}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
         
        </div>

        {/* <Separator className="my-2" /> */}

        {/* Menu Items */}
        {/* <div className="space-y-1">
          <Link to="/settings">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div> */}

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
  )
}