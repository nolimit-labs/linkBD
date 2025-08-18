import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { SearchBar } from './search-bar'
import { UserAccount } from './user-account'

export function AppHeader() {

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-background justify-between">
      {/* Sidebar Trigger */}
      <SidebarTrigger className="ml-0" />

      {/* Search Bar with Dropdown */}
      <div className="flex-1 max-w-md mx-4">
        <SearchBar
          showDropdown={true}
          maxResults={3}
          placeholder="Search people..."
        />
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserAccount />
      </div>
    </header>
  )
}