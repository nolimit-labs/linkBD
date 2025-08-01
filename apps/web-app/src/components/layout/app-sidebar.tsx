import * as React from "react"
import {
  CheckSquare,
  CreditCard,
  Image,
  Settings2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/layout/logo"
import { UserProfile } from "@/components/layout/user-profile"
import {
  Link

} from "@tanstack/react-router"
import { UpgradeDialog } from "@/components/pricing/upgrade-dialog"
import { useUserSubscriptions } from "@/api"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: subscriptionData } = useUserSubscriptions()

  const isPro = subscriptionData?.[0]?.plan === "pro"



  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <Logo textSize="text-5xl" className="mx-auto mb-4 mt-2" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-xl font-semibold pl-6">
              <Link to="/todos" className="flex items-center gap-2">
                <CheckSquare className="size-4" />
                <span>Todos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-xl font-semibold pl-6">
              <Link to="/images" className="flex items-center gap-2">
                <Image className="size-4" />
                <span>Images</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-xl font-semibold pl-6">
              <Link to="/settings" className="flex items-center gap-2">
                <Settings2 className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        
          <SidebarMenuItem>
            {!isPro && (
            <UpgradeDialog>
              <SidebarMenuButton className="text-xl font-semibold pl-6">
                <CreditCard className="size-4" />
                <span>Upgrade</span>
              </SidebarMenuButton>
            </UpgradeDialog>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  )
}
