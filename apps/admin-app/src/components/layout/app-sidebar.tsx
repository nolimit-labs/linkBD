import * as React from "react"
import {
  CreditCard,
  Image,
  Search,
  Settings2,
  User,
  Building2,
  Database,
  FileX,
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
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/layout/logo"
import { UserProfile } from "@/components/layout/user-profile"
import {
  Link
} from "@tanstack/react-router"


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {



  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="flex flex-col items-center">
          <Logo className="mx-auto mb-2 mt-2" />
          <Badge className="mb-4 px-2 py-1 w-full rounded-full bg-primary text-primary-foreground text-xl">
            Admin Panel
          </Badge>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-xl font-semibold pl-6">
              <Link to="/users" className="flex items-center gap-2">
                <User className="size-4" />
                <span>Users</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-xl font-semibold pl-6">
              <Link to="/organizations" className="flex items-center gap-2">
                <Building2 className="size-4" />
                <span>Organizations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-xl font-semibold pl-6">
              <Link to="/migrations" className="flex items-center gap-2">
                <Database className="size-4" />
                <span>Migrations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="text-xl font-semibold pl-6">
              <Link to="/orphaned-resources" className="flex items-center gap-2">
                <FileX className="size-4" />
                <span>Orphaned Resources</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
