import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function AppHeader() {
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
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-background">
      {/* Sidebar Trigger */}
      <SidebarTrigger className="ml-0" />
      
      {/* Spacer to push actions to the right */}
      <div className="flex-1" />
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link to="/settings">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </Link>
        
        <ThemeToggle />
        
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  )
}