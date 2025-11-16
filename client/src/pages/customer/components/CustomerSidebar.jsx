import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  Pickaxe,
  Car,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"

export function CustomerSidebar() {
  const location = useLocation()
  return (
    <Sidebar className="static h-full border-none">
      <SidebarContent className=" bg-white h-full">
        <SidebarGroup>
          <SidebarGroupLabel>Home</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/customer"
                    className={
                      location.pathname === "/customer"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/customer/cars"
                    className={
                      location.pathname === "/customer/cars"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <Car />
                    <span>Vehicles</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/customer/book-a-service"
                    className={
                      location.pathname === "/customer/book-a-service"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <Calendar />
                    <span>Book a Service</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/customer/book-a-package"
                    className={
                      location.pathname === "/customer/book-a-package"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <Inbox />
                    <span>Service Packages</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}