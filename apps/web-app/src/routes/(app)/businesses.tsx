import { createFileRoute } from '@tanstack/react-router'
import { useSearch, useOrganizations, useFeaturedOrganizations } from '@/api'
import { PageHeader } from '@/components/layout/page-header'
import { SearchBar } from '@/components/layout/search-bar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Building2, Loader2, Search as SearchIcon, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useDebounce } from '@/hooks/use-debounce'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { FeaturedBusinessCard } from '@/components/businesses/featured-business-card'

export const Route = createFileRoute('/(app)/businesses')({
  component: BusinessesPage,
})

function BusinessesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedQuery = useDebounce(searchQuery, 300)

  // Get featured organizations by default
  const { data: featuredOrgs, isLoading: featuredLoading } = useFeaturedOrganizations(4)
  
  // Search only for organizations when there's a query
  const { data: searchResults, isLoading: searchLoading } = useSearch(debouncedQuery, 'organization')

  // Show logic: search takes priority, then featured
  const businesses = searchQuery 
    ? searchResults?.organizations || []
    : featuredOrgs?.organizations || []
  
  const isLoading = searchQuery ? searchLoading : featuredLoading
  const showingFeatured = !searchQuery && featuredOrgs?.organizations && featuredOrgs.organizations.length > 0

  return (
    <div className="space-y-6">
      <div className="px-6 py-4">
        <PageHeader
          title="Businesses"
          description="Discover businesses in the linkBD community"
        />

        <div className="mt-6">
          {/* Search Input */}
          <div className="max-w-2xl">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search businesses by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {isLoading && searchQuery && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        {/* No Results State */}
        {searchQuery && !isLoading && businesses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No businesses found for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Results Grid */}
        {businesses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {searchQuery 
                ? `Search Results (${businesses.length})` 
                : showingFeatured 
                  ? `Featured Businesses (${businesses.length})`
                  : `All Businesses (${businesses.length})`}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {businesses.map((business) => (
                showingFeatured ? (
                  <FeaturedBusinessCard key={business.id} business={business} />
                ) : (
                  <Link
                    key={business.id}
                    to="/profile/$id"
                    params={{ id: business.id }}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          <Avatar className="h-20 w-20 mb-4">
                            <AvatarImage src={business.imageUrl || undefined} />
                            <AvatarFallback>
                              <Building2 className="h-10 w-10" />
                            </AvatarFallback>
                          </Avatar>
                          <h3 className="font-semibold text-lg">{business.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">Business</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}