import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useSearch } from '@/api'
import { useDebounce } from '@/hooks/use-debounce'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search as SearchIcon, Loader2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
    /** Show dropdown with results instead of navigating to search page */
    showDropdown?: boolean
    /** Maximum results to show in dropdown */
    maxResults?: number
    /** Additional CSS classes */
    className?: string
    /** Placeholder text */
    placeholder?: string
}

export function SearchBar({
    showDropdown = false,
    maxResults = 3,
    className,
    placeholder = "Search people..."
}: SearchBarProps) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const debouncedQuery = useDebounce(query, 300)
    const navigate = useNavigate()
    const searchRef = useRef<HTMLDivElement>(null)

    const { data: searchResults, isLoading } = useSearch(debouncedQuery)

    const users = searchResults?.users?.slice(0, maxResults) || []
    const hasResults = users.length > 0

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Show dropdown when there are results and we're in dropdown mode
    useEffect(() => {
        if (showDropdown && debouncedQuery && (hasResults || isLoading)) {
            setIsOpen(true)
        } else if (!showDropdown) {
            setIsOpen(false)
        }
    }, [showDropdown, debouncedQuery, hasResults, isLoading])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!showDropdown && query.trim()) {
            navigate({
                to: '/search',
                search: { q: query.trim() }
            })
        }
    }

    const handleUserClick = () => {
        setIsOpen(false)
        setQuery('')
    }

    return (
        <div ref={searchRef} className={cn("relative", className)}>
            <form onSubmit={handleSubmit} className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 pr-4"
                    onFocus={() => {
                        if (showDropdown && debouncedQuery && (hasResults || isLoading)) {
                            setIsOpen(true)
                        }
                    }}
                />
            </form>

            {/* Dropdown Results */}
            {showDropdown && isOpen && debouncedQuery && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">Searching...</span>
                        </div>
                    )}

                    {!isLoading && !hasResults && (
                        <div className="py-4 px-3 text-center text-sm text-muted-foreground">
                            No results found for "{debouncedQuery}"
                        </div>
                    )}

                    {!isLoading && hasResults && (
                        <>
                            <div className="py-2 px-3 border-b bg-muted/30">
                                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    People ({users.length})
                                </div>
                            </div>

                            {users.map((user) => (
                                <Link
                                    key={user.id}
                                    to="/profile/$id"
                                    params={{ id: user.id }}
                                    onClick={handleUserClick}
                                    className="flex items-center gap-3 py-3 px-3 hover:bg-muted/50 transition-colors"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatarUrl || undefined} />
                                        <AvatarFallback className="text-xs">
                                            {user.name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </Link>
                            ))}

                            {searchResults && searchResults.users.length > maxResults && (
                                <Link
                                    to="/search"
                                    search={{ q: debouncedQuery }}
                                    onClick={handleUserClick}
                                    className="block py-3 px-3 text-center text-sm text-primary hover:bg-muted/50 transition-colors border-t"
                                >
                                    View all {searchResults.users.length} results
                                </Link>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}