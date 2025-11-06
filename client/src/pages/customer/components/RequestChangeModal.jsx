import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import axiosClient from "@/axiosClient"
import { toast } from "react-toastify"
import { format } from "date-fns"

export default function RequestChangeModal({ open, onClose, booking, onRequested }) {
  const [date, setDate] = useState(booking ? new Date(booking.scheduledAt) : null)
  const [time, setTime] = useState(booking ? new Date(booking.scheduledAt).toTimeString().slice(0,5) : "")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!date || !time) return toast.error("Please choose date and time")
    const [hours, minutes] = time.split(":")
    const sched = new Date(date)
    sched.setHours(parseInt(hours,10), parseInt(minutes,10),0,0)

    setLoading(true)
    try {
      const res = await axiosClient.post(`/bookings/${booking.id}/change-request`, { requestedAt: sched.toISOString() })
      toast.success("Change request submitted")
      onRequested && onRequested(res.data)
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Request Change for Booking #{booking?.id}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X size={18} /></Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Date</label>
              <Input type="date" value={date ? format(date, 'yyyy-MM-dd') : ""} onChange={(e) => setDate(new Date(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium">Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Sending...' : 'Request Change'}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
