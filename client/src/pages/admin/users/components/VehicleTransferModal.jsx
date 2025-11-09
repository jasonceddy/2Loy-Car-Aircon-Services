import { useEffect, useState } from "react"
import axiosClient from "@/axiosClient"
import { toast } from "react-toastify"
import { Loader2, User } from "lucide-react"

export default function VehicleTransferModal({ open, setOpen, user, onComplete }) {
  const [cars, setCars] = useState([])
  const [loadingCars, setLoadingCars] = useState(false)
  const [selectedCarId, setSelectedCarId] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [customers, setCustomers] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [newOwnerId, setNewOwnerId] = useState(null)
  const [createMode, setCreateMode] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newOwnerData, setNewOwnerData] = useState({ name: "", email: "", phone: "" })
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [moveOpenJobs, setMoveOpenJobs] = useState(false)
  const [moveUnpaidInvoices, setMoveUnpaidInvoices] = useState(false)
  const [hasOpenJobs, setHasOpenJobs] = useState(false)
  const [hasUnpaidInvoices, setHasUnpaidInvoices] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    fetchCars()
    fetchCustomers()
  }, [open])

  useEffect(() => {
    if (!selectedCarId) return
    fetchCarHistory(selectedCarId)
  }, [selectedCarId])

  const fetchCars = async () => {
    setLoadingCars(true)
    try {
      const res = await axiosClient.get(`/users/${user.id}/cars`)
      setCars(res.data.data || [])
    } catch (e) {
      toast.error("Failed to fetch cars")
    } finally {
      setLoadingCars(false)
    }
  }

  const fetchCustomers = async () => {
    setLoadingCustomers(true)
    try {
      // fetch up to 1000 customers for selection; adjust if dataset larger
      const res = await axiosClient.get(`/users/customers?limit=1000`)
      setCustomers(res.data.data || [])
    } catch (e) {
      toast.error("Failed to fetch customers")
    } finally {
      setLoadingCustomers(false)
    }
  }

  const fetchCarHistory = async (carId) => {
    setLoadingHistory(true)
    try {
      const res = await axiosClient.get(`/cars/${carId}/history`)
      const bookings = res.data.data || []
      setHistory(bookings.slice(0, 8))

      // determine presence of open jobs/unpaid invoices
      const openJobs = bookings.some((b) => {
        if (b.status === "PENDING" || b.status === "CONFIRMED") return true
        if (b.jobs && b.jobs.some((j) => j.stage !== "COMPLETION")) return true
        return false
      })
      const unpaid = bookings.some((b) => b.quote && b.quote.billing && b.quote.billing.status === "UNPAID")
      setHasOpenJobs(openJobs)
      setHasUnpaidInvoices(unpaid)
    } catch (e) {
      toast.error("Failed to fetch car history")
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleCreateOwner = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const payload = { ...newOwnerData, role: "CUSTOMER" }
      const res = await axiosClient.post(`/users`, payload)
      const created = res.data.user
      setNewOwnerId(created.id)
      toast.success("New owner created")
      setCreateMode(false)
      // refresh customers
      fetchCustomers()
    } catch (e) {
      toast.error("Failed to create owner")
    } finally {
      setCreating(false)
    }
  }

  const handleTransfer = async () => {
    if (!selectedCarId) return toast.error("Select a vehicle")
    if (!newOwnerId) return toast.error("Select or create the new owner")
    setSubmitting(true)
    try {
      const payload = {
        newOwnerId: parseInt(newOwnerId),
        moveOpenJobs: moveOpenJobs,
        moveUnpaidInvoices: moveUnpaidInvoices,
        transferDate: transferDate,
      }
      const res = await axiosClient.post(`/cars/${selectedCarId}/transfer`, payload)
      toast.success(res.data.message || "Transfer successful")
      setOpen(false)
      if (onComplete) onComplete(res.data)
    } catch (e) {
      const msg = e.response?.data?.message || "Failed to transfer"
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg w-full max-w-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <User /> Transfer vehicle ownership
          </h2>
          <div className="flex items-center gap-2">
            <button
              className="text-sm text-gray-600 hover:underline"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Vehicle</label>
            {loadingCars ? (
              <div className="py-2"><Loader2 className="animate-spin" /></div>
            ) : (
              <select
                className="w-full border rounded px-2 py-1"
                value={selectedCarId || ""}
                onChange={(e) => setSelectedCarId(e.target.value)}
              >
                <option value="">Select Vehicle...</option>
                {cars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.plateNo} — {c.brand} {c.model} {c.year}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Service summary (recent)</label>
            <div className="max-h-40 overflow-auto border rounded mt-2 p-2">
              {loadingHistory ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin" /></div>
              ) : history.length === 0 ? (
                <p className="text-sm text-gray-500">No recent services found for this vehicle.</p>
              ) : (
                <ul className="space-y-2">
                  {history.map((b) => (
                    <li key={b.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="text-sm">
                        <div className="font-medium">{(b.service && b.service.name) || (b.pack && b.pack.name) || 'Service'}</div>
                        <div className="text-xs text-gray-600">{new Date(b.scheduledAt).toLocaleDateString()}</div>
                      </div>
                      <div className="text-sm text-right">
                        <div>{b.status}</div>
                        <div className="text-xs text-gray-600">Billed: {b.quote && b.quote.customer ? b.quote.customer.name : b.customer?.name}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">New owner</label>
            <div className="flex gap-2 mt-1">
              <select
                className="flex-1 border rounded px-2 py-1"
                value={newOwnerId || ""}
                onChange={(e) => setNewOwnerId(e.target.value)}
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.email || c.phone}</option>
                ))}
              </select>
              <button
                className="text-sm px-3 py-1 border rounded"
                onClick={() => setCreateMode((s) => !s)}
              >
                {createMode ? "Cancel" : "Create"}
              </button>
            </div>

            {createMode && (
              <form className="mt-2 space-y-2" onSubmit={handleCreateOwner}>
                <input required placeholder="Name" className="w-full border rounded px-2 py-1" value={newOwnerData.name} onChange={(e)=>setNewOwnerData(prev=>({...prev,name:e.target.value}))} />
                <input required placeholder="Email" className="w-full border rounded px-2 py-1" value={newOwnerData.email} onChange={(e)=>setNewOwnerData(prev=>({...prev,email:e.target.value}))} />
                <input placeholder="Phone" className="w-full border rounded px-2 py-1" value={newOwnerData.phone} onChange={(e)=>setNewOwnerData(prev=>({...prev,phone:e.target.value}))} />
                <div className="flex gap-2">
                  <button type="submit" disabled={creating} className="px-3 py-1 bg-blue-600 text-white rounded">{creating? 'Creating...' : 'Create owner'}</button>
                </div>
              </form>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Transfer date</label>
            <input type="date" className="border rounded px-2 py-1 mt-1" value={transferDate} onChange={(e)=>setTransferDate(e.target.value)} />
          </div>

          {(hasOpenJobs || hasUnpaidInvoices) && (
            <div className="border rounded p-3 bg-gray-50">
              <div className="text-sm font-medium mb-2">Open items detected</div>
              {hasOpenJobs && (
                <div className="flex items-center gap-2">
                  <input id="moveJobs" type="checkbox" checked={moveOpenJobs} onChange={(e)=>setMoveOpenJobs(e.target.checked)} />
                  <label htmlFor="moveJobs" className="text-sm">Move open jobs/bookings to new owner</label>
                </div>
              )}
              {hasUnpaidInvoices && (
                <div className="flex items-center gap-2 mt-2">
                  <input id="moveInvoices" type="checkbox" checked={moveUnpaidInvoices} onChange={(e)=>setMoveUnpaidInvoices(e.target.checked)} />
                  <label htmlFor="moveInvoices" className="text-sm">Move unpaid invoices to new owner</label>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 border rounded" onClick={()=>setOpen(false)}>Cancel</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleTransfer} disabled={submitting}>{submitting ? 'Transferring...' : 'Confirm Transfer'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
