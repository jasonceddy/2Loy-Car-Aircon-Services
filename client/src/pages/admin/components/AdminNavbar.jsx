import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Link, useNavigate } from "react-router-dom"
import { useAdmin } from "../AdminPortal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings } from "lucide-react"
import axiosClient from "@/axiosClient"
import { toast } from "react-toastify"

export default function AdminNavbar() {
  const navigate = useNavigate()
  const signOut = async () => {
    try {
      await axiosClient.get("/auth/logout")
      toast.success("Logout successful!")
      navigate("/login")
    } catch (error) {
      console.log(error)
    }
  }
  const { name } = useAdmin()
  return (
    <header className="p-4">
      <nav className="max-w-full mx-auto flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-gradient-to-r from-white/30 via-blue-50/20 to-white/20 backdrop-blur-lg border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <SidebarTrigger className={"hidden md:block"} />
          <Link to={"/admin"} className="flex items-center gap-3">
            {/* Small SVG monogram */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shadow-md">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h6l2 6 6-12h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="text-base font-bold text-slate-900">2LOY</div>
              <div className="text-xs text-slate-600">Car Aircon Services</div>
            </div>
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 cursor-pointer rounded-md transition">
              <Avatar>
                <AvatarFallback className="bg-blue-700 font-semibold flex items-center justify-center ring-2 ring-white/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </AvatarFallback>
              </Avatar>
              <span className="capitalize max-[768px]:hidden text-sm text-slate-800">
                {name.split(" ").slice(0, 1)}
              </span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="flex items-center gap-1 cursor-pointer"
              asChild
            >
              <Link
                to="/admin/settings"
                className="flex items-center gap-1 cursor-pointer"
              >
                <Settings /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-1 cursor-pointer"
              asChild
            >
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 cursor-pointer w-full"
              >
                <LogOut />
                Logout
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    </header>
  )
}