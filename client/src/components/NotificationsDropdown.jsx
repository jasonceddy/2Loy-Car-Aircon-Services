import React, { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import axiosClient from "@/axiosClient"
import { formatDateTime } from "@/lib/formatter"
import { toast } from "react-toastify"

export default function NotificationsDropdown({ iconClass = "text-white", pollInterval = 0 }) {
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

  // optional polling for near-real-time updates (pollInterval in ms)
  useEffect(() => {
    if (!pollInterval || pollInterval <= 0) return
    const id = setInterval(() => {
      // only fetch when dropdown is closed to avoid interfering with user interactions
      if (!open) fetchNotifications()
    }, pollInterval)
    return () => clearInterval(id)
  }, [pollInterval, open])

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

  const markAllRead = async () => {
    if (!items || items.length === 0) return
    const unread = items.filter(i => !i.read)
    if (unread.length === 0) {
      // nothing to do, but clear UI if user expects it to vanish
      setItems([])
      return
    }

    setLoading(true)
    try {
      // mark all unread notifications as read in parallel
      await Promise.all(unread.map((n) => axiosClient.patch(`/notifications/${n.id}/read`)))
      // Clear the client-side list to produce a "cleared" modal as requested
      setItems([])
      toast.success('Notifications cleared')
    } catch (err) {
      console.error('Failed to mark all notifications as read', err)
      toast.error('Failed to clear notifications')
      // fallback: mark whatever we managed locally
      setItems((prev) => prev.map(i => ({ ...i, read: true })))
    } finally {
      setLoading(false)
    }
  }

  const buttonRef = useRef(null)
  const [portalPos, setPortalPos] = useState(null)

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => {
          const willOpen = !open
          setOpen(willOpen)
          if (willOpen) {
            fetchNotifications()
            try {
              const rect = buttonRef.current.getBoundingClientRect()
              const width = 384 // matches w-96
              const right = Math.max(8, window.innerWidth - rect.right)
              const top = rect.bottom + 8
              setPortalPos({ top, right, width })
            } catch (e) {
              setPortalPos(null)
            }
          }
        }}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className={`w-6 h-6 ${iconClass}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">{unreadCount}</span>
        )}
      </button>

      {open && (() => {
        const dropdown = (
          <div
            className="shadow-lg rounded-md"
            style={{
              position: portalPos ? 'fixed' : 'absolute',
              top: portalPos ? portalPos.top : undefined,
              right: portalPos ? portalPos.right : 0,
              width: portalPos ? portalPos.width : undefined,
              maxWidth: '90vw',
              backgroundColor: '#ffffff',
              zIndex: 99999,
            }}
          >
            <div className="p-3 border-b flex items-center justify-between gap-3" style={{ backgroundColor: '#ffffff' }}>
              <div className="font-semibold text-black">Notifications</div>
              <div>
                <button className="text-sm text-gray-600 mr-3" onClick={() => fetchNotifications()} disabled={loading}>Refresh</button>
                <button className="text-sm text-red-600" onClick={markAllRead} disabled={loading || items.length === 0}>Clear all</button>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {loading && <div className="p-3">Loading...</div>}
              {!loading && items.length === 0 && <div className="p-3 text-sm text-gray-500">No notifications</div>}
              {!loading && items.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b relative`}
                  style={{ backgroundColor: n.read ? '#f9fafb' : '#ffffff' }}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 truncate">{n.title}</div>
                      <div className="text-sm text-slate-800 whitespace-normal break-words">{n.message}</div>
                      <div className="text-xs text-slate-600 mt-1">{formatDateTime(n.createdAt)}</div>
                    </div>
                    {!n.read && (
                      <div className="flex-shrink-0">
                        <Button onClick={() => markRead(n.id)} size="sm">Mark</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

        if (typeof document !== 'undefined' && portalPos) {
          return createPortal(dropdown, document.body)
        }

        return dropdown
      })()}
    </div>
  )
}
