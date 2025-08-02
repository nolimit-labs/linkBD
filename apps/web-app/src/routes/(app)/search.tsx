import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useSearch } from '@/api'
import { PageHeader } from '@/components/layout/page-header'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Search as SearchIcon, Users, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

export const Route = createFileRoute('/(app)/search')({
  component: SearchPage,
})

function SearchPage() {
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)

  const { data: searchResults, isLoading } = useSearch(debouncedQuery)

  const hasResults = searchResults && searchResults.users && searchResults.users.length > 0

  return (
    <div className="space-y-6">
      <div className="bg-background px-6 py-4">
        <PageHeader
          title="Search People"
          description="Find and connect with members of the linkBD community"
        />

        <div className="mt-6">
          {/* Search Input */}
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for people by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Loading State */}
        {isLoading && debouncedQuery && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Searching...</span>
          </div>
        )}

        {/* No Query State */}
        {!debouncedQuery && (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Start typing to search the linkBD community
            </p>
          </div>
        )}

        {/* No Results State */}
        {debouncedQuery && !isLoading && !hasResults && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No results found for "{debouncedQuery}"
            </p>
          </div>
        )}

        {/* Results */}
        {searchResults && hasResults && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              People ({searchResults.users.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.users.map((user) => (
                <Link
                  key={user.id}
                  to="/users/$userId"
                  params={{ userId: user.id }}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback>
                            {user.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{user.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}