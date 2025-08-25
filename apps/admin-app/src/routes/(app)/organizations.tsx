import { createFileRoute } from '@tanstack/react-router'
import { OrganizationsTableView } from '@/components/organizations/organizations-table-view'
import { PageHeader } from '@/components/layout/page-header'

export const Route = createFileRoute('/(app)/organizations')({
  component: OrganizationsPage,
})

function OrganizationsPage() {
  const title = 'Organizations'
  const description = 'Manage your organizations'
  
  return (
    <div className="space-y-6 px-6">
      <div className="flex items-start justify-between">
        <PageHeader 
          title={title} 
          description={description} 
        />
      </div>
      
      <div>
        <OrganizationsTableView />
      </div>
    </div>
  )
}