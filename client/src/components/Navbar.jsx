import { useState, useEffect } from "react"
import {
  BadgeQuestionMark,
  Car,
  FileQuestionMark,
  Home,
  MessageCircle,
  Phone,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import NotificationsDropdown from "@/components/NotificationsDropdown"

export default function Navbar() {
  const location = useLocation()
  const [activeSection, setActiveSection] = useState("hero")

  const navItems = [
    { id: "hero", label: "Home", icon: Home },
    { id: "services", label: "Services", icon: Car },
    { id: "how-it-works", label: "How it works", icon: BadgeQuestionMark },
    { id: "about-us", label: "About Us", icon: MessageCircle },
    { id: "faq", label: "FAQ", icon: FileQuestionMark },
    { id: "contact", label: "Contact", icon: Phone },
  ]

  // Scroll to section function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 80 // Account for sticky navbar height
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((item) => item.id)
      const scrollPosition = window.scrollY + 100 // Offset for better detection

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i])
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    // Only add scroll listener on homepage
    if (location.pathname === "/") {
      window.addEventListener("scroll", handleScroll)
      handleScroll() // Check initial position
    }

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [location.pathname])

  return (
    <header className="bg-gray-700 w-full flex flex-col items-center sticky top-0 z-50">
      <nav className="py-4 flex flex-col w-[65vw] max-[1100px]:w-full max-[1100px]:px-5 gap-5">
        <div className="flex items-center justify-between w-full text-white">
          <Link
            to={"/"}
            className="text-3xl font-bold tracking-tighter max-[550px]:text-xl"
          >
            2Loy <span className="max-[550px]:hidden">Car Aircon</span> Services
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/register"
              className="bg-gray-200 text-gray-700 p-2 rounded-md flex items-center justify-center w-20 max-[550px]:w-15 max-[550px]:text-sm text-center font-semibold hover:bg-gray-300 transition-colors"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="bg-gray-200 text-gray-700 p-2 rounded-md flex items-center justify-center w-20 max-[550px]:w-15 max-[550px]:text-sm text-center font-semibold hover:bg-gray-300 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {location.pathname === "/" && (
          <div className="flex items-center gap-5 text-white overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-2xl text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-gray-600 text-white"
                      : "hover:bg-gray-600 text-gray-200"
                  }`}
                >
                  <Icon className="w-5 h-5 max-[400px]:w-4 max-[400px]:h-5" />
                  <span className="max-[768px]:hidden">{item.label}</span>
                </button>
              )
            })}
          </div>
        )}
        {/* Show notifications only inside app areas: customer, admin, technician */}
        {['/customer', '/admin', '/technician'].some(p => location.pathname.startsWith(p)) && (
          <NotificationsDropdown />
        )}
      </nav>
    </header>
  )
}
