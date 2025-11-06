// Settings.jsx - CLEAN AND SIMPLE!
import { useCustomer } from "@/pages/customer/CustomerPortal"
import { Settings2 } from "lucide-react"
import ProfileForm from "./ProfileForm"
import PasswordForm from "./PasswordForm"

export default function Settings() {
  const user = useCustomer()

  return (
    <main className="flex-1 p-4 border-t bg-gray-100/50">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Settings2 /> Settings
      </h1>

      <div className="max-w-2xl">
        {/* Profile Form - COMPLETELY SEPARATE */}
        <ProfileForm user={user} />

        {/* Password Form - COMPLETELY SEPARATE */}
        <PasswordForm />
      </div>
    </main>
  )
}