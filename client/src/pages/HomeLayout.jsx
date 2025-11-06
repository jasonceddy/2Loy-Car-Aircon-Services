import { Outlet, redirect, useLoaderData } from "react-router-dom"
import Navbar from "../components/Navbar"
import React from "react"
import axiosClient from "@/axiosClient"

const TokenContext = React.createContext()

export async function loader() {
  try {
    const { data } = await axiosClient.get("/auth/get-token")

    if (!data?.token) {
      return redirect("/login") // no token → go to login
    }

    const { role } = data.token

    if (role === "ADMIN") return redirect("/admin")
    if (role === "TECHNICIAN") return redirect("/tech")
    if (role === "CUSTOMER") return redirect("/customer")

    return null
  } catch (err) {
    return null
  }
}

export default function HomeLayout() {
  const token = useLoaderData()

  return (
    <TokenContext.Provider value={token}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <Outlet />
      </div>
    </TokenContext.Provider>
  )
}

export const useToken = () => {
  const context = React.useContext(TokenContext)

  if (!context) throw new Error("useToken must be used within a TokenProvider")

  return context
}