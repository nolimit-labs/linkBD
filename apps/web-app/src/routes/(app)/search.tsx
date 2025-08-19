import { createFileRoute, Link, useSearch as useRouterSearch } from '@tanstack/react-router'
import { useSearch } from '@/api'
import { PageHeader } from '@/components/layout/page-header'
import { SearchBar } from '@/components/layout/search-bar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Search as SearchIcon, Users, Building2, Loader2 } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'

type SearchParams = {
  q?: string
}

export const Route = createFileRoute('/(app)/search')({
  component: SearchPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      q: typeof search.q === 'string' ? search.q : undefined,
    }
  },
})

function SearchPage() {
  const { q } = useRouterSearch({ from: '/(app)/search' })
  const debouncedQuery = useDebounce(q || '', 300)

  const { data: searchResults, isLoading } = useSearch(debouncedQuery)

  const hasResults = searchResults && (
    (searchResults.users && searchResults.users.length > 0) || 
    (searchResults.organizations && searchResults.organizations.length > 0)
  )

  return (
    <div className="space-y-6">
      <div className="px-6 py-4">
        <PageHeader
          title="Search"
          description="Find people and businesses in the linkBD community"
        />

        <div className="mt-6">
          {/* Search Input */}
          <div className="max-w-2xl">
            <SearchBar
              showDropdown={false}
              placeholder="Search for people and businesses by name..."
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* Loading State */}
        {isLoading && q && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Searching...</span>
          </div>
        )}

        {/* No Query State */}
        {!q && (
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Start typing to search the linkBD community
            </p>
          </div>
        )}

        {/* No Results State */}
        {q && !isLoading && !hasResults && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No results found for "{q}"
            </p>
          </div>
        )}

        {/* Results */}
        {searchResults && hasResults && (
          <div className="space-y-8">
            {/* Users Section */}
            {searchResults.users && searchResults.users.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  People ({searchResults.users.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.users.map((user) => (
                    <Link
                      key={user.id}
                      to="/profile/$id"
                      params={{ id: user.id }}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.imageUrl || undefined} />
                              <AvatarFallback>
                                {user.name?.charAt(0) || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{user.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                Person
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

            {/* Organizations Section */}
            {searchResults.organizations && searchResults.organizations.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Businesses ({searchResults.organizations.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.organizations.map((org) => (
                    <Link
                      key={org.id}
                      to="/profile/$id"
                      params={{ id: org.id }}
                      className="block"
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={org.imageUrl || undefined} />
                              <AvatarFallback>
                                <Building2 className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{org.name}</h3>
                              <p className="text-sm text-muted-foreground truncate">
                                Business
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
        )}
      </div>
    </div>
  )
}