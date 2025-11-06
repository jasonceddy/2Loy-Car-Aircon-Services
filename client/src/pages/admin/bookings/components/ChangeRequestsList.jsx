import React, { useEffect, useState } from "react"
import axiosClient from "@/axiosClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime, formatCurrency } from "@/lib/formatter"
import { toast } from "react-toastify"

export default function ChangeRequestsList() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try {
      const res = await axiosClient.get("/bookings/change-requests")
      setRequests(res.data.data)
    } catch (err) {
      toast.error("Failed to load change requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const approve = async (bookingId, id) => {
    if (!confirm(`Approve change request ${id} for booking ${bookingId}? This will update the booking date/time.`)) return
    try {
      await axiosClient.patch(`/bookings/${bookingId}/change-request/approve`, { changeRequestId: id })
      toast.success("Approved")
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
  }

  const reject = async (id) => {
    if (!confirm(`Reject change request ${id}? The booking will remain unchanged.`)) return
    try {
      await axiosClient.patch(`/bookings/change-requests/${id}/reject`)
      toast.success("Rejected")
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Change Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading...</p>}
          {!loading && requests.filter(r => r.status === 'PENDING').length === 0 && <p>No pending change requests.</p>}
          <div className="space-y-3">
            {requests.filter(r => r.status === 'PENDING').map((r) => (
              <div key={r.id} className="p-3 border rounded-md flex justify-between items-center">
                <div>
                  <div className="font-semibold">Booking #{r.bookingId} — {r.booking.customer?.name}</div>
                  <div className="text-sm text-gray-600">Requested: {formatDateTime(r.requestedAt)} by {r.requester?.name}</div>
                  {r.reason && <div className="text-sm text-gray-600">Reason: {r.reason}</div>}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => approve(r.bookingId, r.id)}>Approve</Button>
                  <Button variant="destructive" onClick={() => reject(r.id)}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Request History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading...</p>}
          {!loading && requests.filter(r => r.status !== 'PENDING').length === 0 && <p>No history yet.</p>}
          <div className="space-y-3">
            {requests.filter(r => r.status !== 'PENDING').map((r) => (
              <div key={r.id} className="p-3 border rounded-md flex justify-between items-center">
                <div>
                  <div className="font-semibold">Booking #{r.bookingId} — {r.booking.customer?.name}</div>
                  <div className="text-sm text-gray-600">Requested: {formatDateTime(r.requestedAt)} by {r.requester?.name}</div>
                  <div className="text-sm text-gray-600">Status: <span className={r.status === 'APPROVED' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{r.status}</span></div>
                  {r.reason && <div className="text-sm text-gray-600">Reason: {r.reason}</div>}
                  <div className="text-xs text-gray-500 mt-1">Updated: {formatDateTime(r.updatedAt || r.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
