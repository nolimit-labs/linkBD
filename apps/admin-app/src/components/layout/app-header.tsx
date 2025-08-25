
import { signOut } from '@/lib/auth-client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { UserAccount } from './user-account'

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
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-background justify-between">
      {/* Sidebar Trigger */}
      <SidebarTrigger className="ml-0" />
      
    
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserAccount />
      </div>
    </header>
  )
}