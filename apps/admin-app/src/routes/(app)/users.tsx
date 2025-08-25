import { createFileRoute } from '@tanstack/react-router'
import { UsersTableView } from '@/components/users/users-table-view'
import { PageHeader } from '@/components/layout/page-header'

export const Route = createFileRoute('/(app)/users')({
  component: UsersPage,
})

function UsersPage() {
  const title = 'Users'
  const description = 'Manage your users'
  
  return (
    <div className="space-y-6 px-6">
      <div className="flex items-start justify-between">
        <PageHeader 
          title={title} 
          description={description} 
        />
      </div>
      
      <div>
        <UsersTableView />
      </div>
    </div>
  )
}

