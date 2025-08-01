import { createFileRoute } from '@tanstack/react-router'
import { TodosTableView } from '@/components/todos/todos-table-view'
import { PageHeader } from '@/components/layout/page-header'
import { useActiveOrganization } from '@/lib/auth-client'
import { Badge } from '@/components/ui/badge'
import { Building2, User } from 'lucide-react'

export const Route = createFileRoute('/(app)/todos')({
  component: TodosPage,
})

function TodosPage() {
  const { data: activeOrg } = useActiveOrganization()
  
  const title = activeOrg ? 'Organization Todos' : 'My Todos'
  const description = activeOrg 
    ? `Manage tasks for ${activeOrg.name}`
    : 'Organize your personal tasks and stay productive'
  
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader 
          title={title} 
          description={description} 
        />
        <Badge variant={activeOrg ? 'default' : 'secondary'} className="flex items-center gap-1.5">
          {activeOrg ? (
            <>
              <Building2 className="h-3 w-3" />
              {activeOrg.name}
            </>
          ) : (
            <>
              <User className="h-3 w-3" />
              Personal
            </>
          )}
        </Badge>
      </div>
      
      <div className="px-6">
        <TodosTableView />
      </div>
    </div>
  )
}

