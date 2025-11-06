import React, { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import axiosClient from "@/axiosClient"
import { formatDateTime } from "@/lib/formatter"
import { toast } from "react-toastify"

export default function NotificationsDropdown({ iconClass = "text-white" }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get("/notifications")
      setItems(res.data.data || [])
    } catch (err) {
      console.error(err)
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const unreadCount = items.filter(i => !i.read).length

  const markRead = async (id) => {
    try {
      await axiosClient.patch(`/notifications/${id}/read`)
      setItems((prev) => prev.map(i => i.id === id ? { ...i, read: true } : i))
    } catch (err) {
      console.error(err)
      toast.error("Failed to mark notification as read")
    }
  }

  return (
    <div className="relative">
      <button onClick={() => { setOpen(!open); if (!open) fetchNotifications() }} className="relative" aria-label="Notifications">
        <Bell className={`w-6 h-6 ${iconClass}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">{unreadCount}</span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-md z-50">
          <div className="p-3 border-b font-semibold text-black">Notifications</div>
          <div className="max-h-64 overflow-y-auto">
            {loading && <div className="p-3">Loading...</div>}
            {!loading && items.length === 0 && <div className="p-3 text-sm text-gray-500">No notifications</div>}
            {!loading && items.map((n) => (
              <div key={n.id} className={`p-3 border-b ${n.read ? 'bg-gray-50' : 'bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-black">{n.title}</div>
                    <div className="text-sm text-black">{n.message}</div>
                    <div className="text-xs text-black/70 mt-1">{formatDateTime(n.createdAt)}</div>
                  </div>
                  {!n.read && <Button onClick={() => markRead(n.id)} size="sm">Mark</Button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
