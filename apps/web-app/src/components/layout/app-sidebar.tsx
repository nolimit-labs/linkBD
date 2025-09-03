import * as React from "react"
import {
  Home,
  CreditCard,
  Image,
  Settings,
  Search,
  Users,
  Building,
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
import { CurrentAccountBox } from "@/components/layout/current-account-box"
import {
  Link

} from "@tanstack/react-router"
import { useUserSubscriptions } from "@/api"
import { env } from "@/lib/env"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userSubscriptionData } = useUserSubscriptions()

  const displayImagesLink = env.isStaging || env.isDevelopment
  const isUserPro = userSubscriptionData?.[0]?.plan === "pro"

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="px-4">
        <Logo className="h-28 w-64 mx-auto mb-2 mt-2 sm:h-20 sm:w-64" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="gap-3">
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-2xl font-semibold pl-6">
              <Link to="/feed" className="flex items-center gap-2">
                <span><Home className="size-6" /></span>
                <span >Feed</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-2xl font-semibold pl-6">
              <Link to="/search" className="flex items-center gap-2">
                <span><Search className="size-6" /></span>
                <span>Search</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-2xl font-semibold pl-6">
              <Link to="/businesses" className="flex items-center gap-2">
                <span><Building className="size-6" /></span>
                <span>Businesses</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {displayImagesLink && (
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="text-2xl font-semibold pl-6">
                <Link to="/images" className="flex items-center gap-2">
                  <span><Image className="size-6" /></span>
                  <span>Images</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-2xl font-semibold pl-6">
              <Link to="/settings" className="flex items-center gap-2">
                <span><Settings className="size-6" /></span>
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>


          {/* Fix this when better auth fixes their stripe integration */}
          {/* <SidebarMenuItem>
            {!isUserPro ? (
              <UpgradeUserSubscriptionDialog>
                <SidebarMenuButton className="text-2xl font-semibold pl-6">
                  <CreditCard className="size-6" />
                  <span>Upgrade</span>
                </SidebarMenuButton>
              </UpgradeUserSubscriptionDialog>
            ) : null}
          </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <CurrentAccountBox />
      </SidebarFooter>
    </Sidebar>
  )
}
