// Settings.jsx - CLEAN AND SIMPLE!
import { Settings2 } from "lucide-react"
import { useAdmin } from "../AdminPortal"
import ProfileForm from "@/components/ProfileForm"
import PasswordForm from "@/components/PasswordForm"

export default function AdminSettings() {
  const user = useAdmin()

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