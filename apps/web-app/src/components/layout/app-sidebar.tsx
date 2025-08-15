import * as React from "react"
import {
  Home,
  CreditCard,
  Image,
  Settings2,
  Search,
  Users,
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
import { UserProfileBox } from "@/components/layout/user-profile-box"
import {
  Link

} from "@tanstack/react-router"
import { useUserSubscriptions } from "@/api"
import { useActiveOrganization } from "@/lib/auth-client"
import { UpgradeUserSubscriptionDialog } from "@/components/pricing/upgrade-user-dialog"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userSubscriptionData } = useUserSubscriptions()

  const isUserPro = userSubscriptionData?.[0]?.plan === "pro"



  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="px-4">
        <Logo className="h-28 w-64 mx-auto mb-2 mt-2 sm:h-20 sm:w-64" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-2xl font-semibold pl-6">
              <Link to="/feed" className="flex items-center gap-2">
                <Home className="size-4" />
                <span>Feed</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-2xl font-semibold pl-6">
              <Link to="/search" className="flex items-center gap-2">
                <Search className="size-4" />
                <span>Search</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-2xl font-semibold pl-6">
              <Link to="/images" className="flex items-center gap-2">
                <Image className="size-4" />
                <span>Images</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-2xl font-semibold pl-6">
              <Link to="/settings" className="flex items-center gap-2">
                <Settings2 className="size-6" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Fix this when better auth fixes their stripe integration */}
          <SidebarMenuItem>
            {!isUserPro ? (
              <UpgradeUserSubscriptionDialog>
                <SidebarMenuButton className="text-2xl font-semibold pl-6">
                  <CreditCard className="size-6" />
                  <span>Upgrade</span>
                </SidebarMenuButton>
              </UpgradeUserSubscriptionDialog>
            ) : null}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <UserProfileBox />
      </SidebarFooter>
    </Sidebar>
  )
}
