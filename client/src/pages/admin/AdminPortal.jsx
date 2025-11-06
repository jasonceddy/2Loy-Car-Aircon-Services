import { Outlet, redirect, useLoaderData } from "react-router-dom"
import AdminNavbar from "./components/AdminNavbar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "./components/AdminSidebar"
import React from "react"
import axiosClient from "@/axiosClient"

const AdminContext = React.createContext()

export async function loader() {
  try {
    const res = await axiosClient.get("/auth/current-user")
    if (!res.data?.user) throw redirect("/") // no user object, bounce to home

    const { role } = res.data.user
    if (role !== "ADMIN") throw redirect("/")

    return res.data.user
  } catch (err) {
    // if backend throws 401 or network fails → redirect
    throw redirect("/login")
  }
}

export default function AdminPortal() {
  const userData = useLoaderData()
  console.debug('[AdminPortal] userData', userData)

  return (
    <AdminContext.Provider value={userData}>
      <SidebarProvider>
        <div className="min-h-screen w-full flex flex-col relative">
          <AdminNavbar />
          <div className="flex-1 flex">
            <div className="border-r">
              <AdminSidebar />
            </div>
            <Outlet />
          </div>
        </div>
      </SidebarProvider>
    </AdminContext.Provider>
  )
}

export const useAdmin = () => {
  const context = React.useContext(AdminContext)

  if (!context) throw new Error("useAdmin must be used within a AdminProvider")

  return context
}
