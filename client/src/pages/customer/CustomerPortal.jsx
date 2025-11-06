import { Outlet, redirect, useLoaderData } from "react-router-dom"
import { SidebarProvider } from "@/components/ui/sidebar"
import React from "react"
import axiosClient from "@/axiosClient"
import CustomerNavbar from "./components/CustomerNavbar"
import { CustomerSidebar } from "./components/CustomerSidebar"

const CustomerContext = React.createContext()

export async function loader() {
  try {
    const res = await axiosClient.get("/auth/current-user")
    if (!res.data?.user) throw redirect("/") // no user object, bounce to home

    const { role } = res.data.user
    if (role !== "CUSTOMER") throw redirect("/")

    return res.data.user
  } catch (err) {
    // if backend throws 401 or network fails → redirect
    throw redirect("/login")
  }
}

export default function CustomerPortal() {
  const userData = useLoaderData()

  return (
    <CustomerContext.Provider value={userData}>
      <SidebarProvider>
        <div className="min-h-screen w-full flex flex-col relative">
          <CustomerNavbar />
          <div className="flex-1 flex">
            <div className="border-r">
              <CustomerSidebar />
            </div>
            <Outlet />
          </div>
        </div>
      </SidebarProvider>
    </CustomerContext.Provider>
  )
}

export const useCustomer = () => {
  const context = React.useContext(CustomerContext)

  if (!context)
    throw new Error("useCustomer must be used within a CustomerProvider")

  return context
}
