import {
  Calendar,
  Home,
  Pickaxe,
  Book,
  Wrench,
  UserCheck,
  ToolCase,
  User,
  Briefcase,
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

export function AdminSidebar() {
  const location = useLocation()
  return (
    <Sidebar className="static h-full border-none">
      <SidebarContent className=" bg-white h-full border-none">
        <SidebarGroup>
          <SidebarGroupLabel>Home</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/admin"
                    className={
                      location.pathname === "/admin" ? "bg-sidebar-accent" : ""
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
          <SidebarGroupLabel>Manage Users</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/admin/users"
                    className={
                      location.pathname === "/admin/users"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <User />
                    <span>Users</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/admin/customers"
                    className={
                      location.pathname === "/admin/customers"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <UserCheck />
                    <span>Customers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/admin/technicians"
                    className={
                      location.pathname === "/admin/technicians"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <ToolCase />
                    <span>Technicians</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Manage Activities</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/admin/services"
                    className={
                      location.pathname === "/admin/services"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <Pickaxe />
                    <span>Services</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* New Menu Item for Packs */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/admin/packs"
                    className={
                      location.pathname === "/admin/packs"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <Pickaxe />
                    <span>Packs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/admin/bookings"
                    className={
                      location.pathname === "/admin/bookings"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <Book />
                    <span>Bookings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/admin/change-requests"
                    className={
                      location.pathname === "/admin/change-requests"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <Calendar />
                    <span>Change Request Log</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/admin/consultations"
                    className={
                      location.pathname === "/admin/consultations"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <Calendar />
                    <span>Consultations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/admin/jobs"
                    className={
                      location.pathname === "/admin/jobs"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <Briefcase />
                    <span>Jobs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/admin/parts"
                    className={
                      location.pathname === "/admin/parts"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <Wrench />
                    <span>Parts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Logs</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/admin/logs"
                    className={
                      location.pathname === "/admin/logs"
                        ? "bg-sidebar-accent"
                        : ""
                    }
                  >
                    <Calendar />
                    <span>Logs</span>
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
