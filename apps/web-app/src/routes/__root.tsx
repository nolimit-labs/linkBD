import { createRootRoute, createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import Header from '@/components/layout/marketing-header';
import { Toaster } from 'sonner';

import type { QueryClient } from '@tanstack/react-query';

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        {/* Main Content */}
        <main>
          <Outlet />
        </main>

        <Toaster />
        {/* Dev Tools */}
        {/* <TanStackRouterDevtools /> */}
      </div>
    </>
  )
} 