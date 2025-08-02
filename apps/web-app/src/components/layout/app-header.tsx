import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, Search } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useState } from 'react'

export function AppHeader() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate({
        to: '/search',
        search: { q: searchQuery.trim() }
      })
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4 border-b bg-background justify-between">
      {/* Sidebar Trigger */}
      <SidebarTrigger className="ml-0" />

      {/* Search Bar */}
      {/* <div className="flex-1 max-w-md mx-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 border-2 border-large rounded-lg"
          />
        </form>
      </div> */}

    </header>
  )
}