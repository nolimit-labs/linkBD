import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

interface QueryProviderProps {
  children: React.ReactNode
}

const queryClient = new QueryClient()

export function getContext() {
  return {
    queryClient,
  }
}

export function TanstackQueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient with optimized settings
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute default stale time
            gcTime: 5 * 60 * 1000, // 5 minutes garbage collection time
            retry: (failureCount, error: any) => {
              // Don't retry on 4xx errors (client errors)
              if (error?.status >= 400 && error?.status < 500) {
                return false
              }
              // Retry up to 3 times for other errors
              return failureCount < 3
            },
            refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
            refetchOnReconnect: true, // Refetch when reconnecting to internet
          },
          mutations: {
            retry: 1, // Retry mutations once on failure
            onError: (error: any) => {
              console.error('Mutation error:', error)
              // You can add toast notifications here
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
} 