
import { createFileRoute, Navigate, Outlet } from '@tanstack/react-router'
import { useSession } from '@/lib/auth-client'
import { LoadingSpinner } from '@/components/layout/loading-spinner'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'

export const Route = createFileRoute('/(app)')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: session, isPending: isSessionPending } = useSession()

  if (isSessionPending) {
    return <LoadingSpinner fullScreen={true} />
  }

  // Redirect to login if not authenticated
  if (!session?.user) {
    return <Navigate to="/sign-in" />
  }

  // User is authenticated - show the app layout
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <SidebarInset className="flex-1 overflow-y-auto overflow-x-hidden w-full">
          <AppHeader />
          <main className="flex-1 overflow-y-auto overflow-x-hidden w-full min-w-0 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted">
            <div className="container max-w-8xl mx-auto p-6">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

