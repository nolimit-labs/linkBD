import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AccountSettings } from '@/components/settings/account-settings'
import { SystemSettings } from '@/components/settings/system-settings'
import { DeveloperSettings } from '@/components/settings/developer-settings'
import { OrganizationSettings } from '@/components/settings/organization-settings'
import { useState } from 'react'
import { useActiveOrganization } from '@/lib/auth-client'

export const Route = createFileRoute('/(app)/settings')({
  component: SettingsPage,
})

const tabHeaders = {
  account: {
    title: "Account Settings",
    description: "Manage your account information and billing"
  },
  organization: {
    title: "Organization Settings",
    description: "Manage your organization's settings and members"
  },
  system: {
    title: "System Settings",
    description: "Configure your settings related to the application"
  },
  developer: {
    title: "Developer Settings",
    description: "Advanced options and debugging tools for developers"
  }
}

type TabType = 'account' | 'organization' | 'system' | 'developer'

function SettingsPage() {
  const { data: activeOrg } = useActiveOrganization()
  const [activeTab, setActiveTab] = useState<TabType>('account')
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title={activeTab === 'organization' && !activeOrg ? tabHeaders.account.title : tabHeaders[activeTab].title} 
        description={activeTab === 'organization' && !activeOrg ? tabHeaders.account.description : tabHeaders[activeTab].description} 
      />
      
      <div className="px-6">
        <div className="max-w-full">
          <Tabs defaultValue="account" value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="account" className="flex-1">Account</TabsTrigger>
              {activeOrg && (
                <TabsTrigger value="organization" className="flex-1">Organization</TabsTrigger>
              )}
              <TabsTrigger value="system" className="flex-1">System</TabsTrigger>
              <TabsTrigger value="developer" className="flex-1">Developer</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <AccountSettings />
            </TabsContent>
            {activeOrg && (
              <TabsContent value="organization">
                <OrganizationSettings />
              </TabsContent>
            )}
            <TabsContent value="system">
              <SystemSettings />
            </TabsContent>
            <TabsContent value="developer">
              <DeveloperSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}