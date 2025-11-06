import React from "react"
import { Outlet, redirect, useLoaderData } from "react-router-dom"
import TechnicianNavbar from "./components/TechnicianNavbar"
import axiosClient from "@/axiosClient"

const TechnicianContext = React.createContext()

export async function loader() {
  try {
    const res = await axiosClient.get("/auth/current-user")
    if (!res.data?.user) throw redirect("/") // no user object, bounce to home

    const { role } = res.data.user
    if (role !== "TECHNICIAN") throw redirect("/")

    return res.data.user
  } catch (err) {
    // if backend throws 401 or network fails → redirect
    throw redirect("/login")
  }
}

export default function TechnicianPortal() {
  const userData = useLoaderData()
  return (
    <TechnicianContext.Provider value={userData}>
      <div className="min-h-screen w-full flex flex-col relative">
        <TechnicianNavbar />
        <Outlet />
      </div>
    </TechnicianContext.Provider>
  )
}

export const useTechnician = () => {
  const context = React.useContext(TechnicianContext)

  if (!context)
    throw new Error("useTechnician must be used within a TechnicianProvider")

  return context
}