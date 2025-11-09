import React, { useEffect, useState } from "react"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import axiosClient from "@/axiosClient"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function TransferModal({ open, onClose, car, onTransferred }) {
  const [history, setHistory] = useState([])
  const [customers, setCustomers] = useState([])
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [moveOpenJobs, setMoveOpenJobs] = useState(false)
  const [moveUnpaidInvoices, setMoveUnpaidInvoices] = useState(false)
  const [reasonText, setReasonText] = useState("")
  const [loading, setLoading] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [creating, setCreating] = useState(false)
  const todayStr = new Date().toISOString().slice(0, 10)
  const [transferDate, setTransferDate] = useState(todayStr)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (!open || !car) return
    // load history and customers
    const load = async () => {
      try {
        const [histRes, custRes, transfersRes] = await Promise.all([
          axiosClient.get(`/cars/${car.id}/history`),
          axiosClient.get(`/users/customers`),
          axiosClient.get(`/cars/${car.id}/transfers`),
        ])
        setHistory(histRes.data.data || [])
        setCustomers(custRes.data.data || [])
        setTransfers(transfersRes.data.data || [])
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [open, car])

  const handleTransfer = async () => {
    // Open review/confirmation if all required fields set
    if (!selectedOwner) return alert('Please choose or create a new owner before transferring.')
    setConfirmOpen(true)
  }

  const submitTransfer = async () => {
    setLoading(true)
    try {
      await axiosClient.post(`/cars/${car.id}/transfer`, {
        newOwnerId: parseInt(selectedOwner),
        moveOpenJobs: Boolean(moveOpenJobs),
        moveUnpaidInvoices: Boolean(moveUnpaidInvoices),
        reason: reasonText || undefined,
        transferDate: transferDate || undefined,
      })
      setLoading(false)
      setConfirmOpen(false)
      onTransferred && onTransferred()
      onClose()
    } catch (err) {
      setLoading(false)
      console.error(err)
      alert(err.response?.data?.message || "Failed to transfer ownership")
    }
  }

  const [transfers, setTransfers] = useState([])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="p-6 max-h-[80vh] overflow-y-auto">
          <DialogHeader className="flex items-start justify-between">
            <DialogTitle>Transfer Ownership - {car?.plateNo}</DialogTitle>
            <XCircle className="cursor-pointer text-gray-500" onClick={onClose} />
          </DialogHeader>

          <div className="space-y-4 mt-2">
          <div className="bg-gray-50 p-3 rounded">
            <div className="font-medium">Vehicle</div>
            <div className="text-sm">{car?.brand} {car?.model} • {car?.year}</div>
            <div className="text-sm text-muted-foreground">Current owner id: {car?.ownerId}</div>
          </div>

          <div>
            <div className="font-medium">Recent Transfers (audit)</div>
            <div className="mt-2 max-h-40 overflow-y-auto space-y-2">
              {transfers.length === 0 && <div className="text-sm text-gray-500">No transfers recorded</div>}
              {transfers.map((t) => (
                <div key={t.id} className="p-2 border rounded bg-white text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <div><strong>{t.admin?.name || 'Unknown admin'}</strong> transferred</div>
                      <div className="text-xs text-gray-600">{t.previousOwner?.name || '—'} → {t.newOwner?.name}</div>
                    </div>
                    <div className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</div>
                  </div>
                  {t.reason && <div className="text-xs text-gray-600 mt-1">Reason: {t.reason}</div>}
                  <div className="text-xs text-gray-600 mt-1">
                    Options: {t.moveOpenJobs ? 'Moved open jobs' : 'Kept open jobs with seller'}; {t.moveUnpaidInvoices ? 'Moved unpaid invoices' : 'Kept unpaid invoices with seller'}
                  </div>
                  {(t.movedJobsCount || t.movedInvoicesCount) && (
                    <div className="text-xs text-gray-600 mt-1">Moved — jobs: {t.movedJobsCount || 0}, invoices: {t.movedInvoicesCount || 0}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="font-medium">Recent services / bookings (read-only)</div>
            <div className="mt-2 max-h-52 overflow-y-auto space-y-2">
              {history.length === 0 && <div className="text-sm text-gray-500">No recent bookings</div>}
              {history.map((b) => (
                <div key={b.id} className="p-2 border rounded bg-white">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">{b.service?.name || b.pack?.name || 'Consult/Generic'}</div>
                    <div className="text-xs text-gray-500">{new Date(b.scheduledAt).toLocaleString()}</div>
                  </div>
                  <div className="text-xs text-gray-600">Status: {b.status}</div>
                  {b.jobs && b.jobs.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">Jobs: {b.jobs.length}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <div className="font-medium">Select new owner</div>
            <div className="mt-2">
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <Select onValueChange={(v) => setSelectedOwner(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name} — {c.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <button className="text-sm text-blue-600 underline" onClick={() => setShowCreate((s) => !s)}>
                    {showCreate ? 'Cancel' : 'Quick create'}
                  </button>
                </div>
              </div>

              {showCreate && (
                <div className="mt-3 p-3 border rounded bg-gray-50 space-y-2">
                  <div>
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Phone" className="w-full p-2 border rounded" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => setShowCreate(false)}>Cancel</button>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                      onClick={async () => {
                        setCreating(true)
                        try {
                          const res = await axiosClient.post('/users', { name: newName, email: newEmail, phone: newPhone, role: 'CUSTOMER' })
                          const created = res.data.user
                          // add to list and auto-select
                          setCustomers((prev) => [created, ...prev])
                          setSelectedOwner(String(created.id))
                          setShowCreate(false)
                          setNewName('')
                          setNewEmail('')
                          setNewPhone('')
                        } catch (err) {
                          alert(err.response?.data?.message || 'Failed to create customer')
                        } finally {
                          setCreating(false)
                        }
                      }}
                      disabled={creating || !newName || !newEmail}
                    >
                      {creating ? 'Creating...' : 'Create & Select'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3">
              <label className="font-medium">Transfer date</label>
              <input type="date" className="mt-1 p-2 border rounded w-full" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} />
            </div>
          </div>

          <div>
            <div className="font-medium">Transfer options</div>
            <div className="mt-2 space-y-3">
              {/* Determine whether there are open jobs or unpaid invoices */}
              {(() => {
                const hasOpenJobs = history.some((b) => b.jobs && b.jobs.some((j) => j.stage && j.stage !== 'COMPLETION'))
                const hasUnpaidInvoices = history.some((b) => b.quote && b.quote.billing && b.quote.billing.status === 'UNPAID')

                return (
                  <>
                    {hasOpenJobs && (
                      <div>
                        <div className="text-sm font-medium">Open jobs / active bookings</div>
                        <div className="mt-1 flex gap-3 items-center">
                          <label className="flex items-center gap-2">
                            <input type="radio" name={`openJobs-${car.id}`} checked={!moveOpenJobs} onChange={() => setMoveOpenJobs(false)} />
                            <span className="text-sm">Keep with seller</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name={`openJobs-${car.id}`} checked={moveOpenJobs} onChange={() => setMoveOpenJobs(true)} />
                            <span className="text-sm">Reassign to buyer</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {hasUnpaidInvoices && (
                      <div>
                        <div className="text-sm font-medium">Unpaid invoices</div>
                        <div className="mt-1 flex gap-3 items-center">
                          <label className="flex items-center gap-2">
                            <input type="radio" name={`unpaidInv-${car.id}`} checked={!moveUnpaidInvoices} onChange={() => setMoveUnpaidInvoices(false)} />
                            <span className="text-sm">Keep with seller</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="radio" name={`unpaidInv-${car.id}`} checked={moveUnpaidInvoices} onChange={() => setMoveUnpaidInvoices(true)} />
                            <span className="text-sm">Reassign to buyer</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {!hasOpenJobs && !hasUnpaidInvoices && (
                      <div className="text-sm text-gray-600">No open jobs or unpaid invoices found. Default transfer options are available.</div>
                    )}
                  </>
                )
              })()}

              <div>
                <div className="text-sm">Reason (optional)</div>
                <textarea value={reasonText} onChange={(e) => setReasonText(e.target.value)} className="w-full mt-1 p-2 border rounded" rows={3} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={!selectedOwner || loading}>
              Review Transfer
            </Button>
          </div>

          {/* Confirmation panel */}
          {confirmOpen && (
            <div className="mt-4 p-4 border rounded bg-white">
              <div className="font-medium mb-2">Review transfer</div>
              <div className="text-sm mb-2">Vehicle: <strong>{car?.plateNo || (car?.brand + ' ' + car?.model)}</strong></div>
              <div className="text-sm mb-2">New Owner: <strong>{customers.find(c => String(c.id) === String(selectedOwner))?.name || '—'}</strong></div>
              <div className="text-sm mb-2">Transfer date: <strong>{transferDate}</strong></div>
              {(() => {
                const openJobsCount = history.reduce((acc, b) => acc + (b.jobs ? b.jobs.filter(j => j.stage && j.stage !== 'COMPLETION').length : 0), 0)
                const unpaidCount = history.reduce((acc, b) => acc + ((b.quote && b.quote.billing && b.quote.billing.status === 'UNPAID') ? 1 : 0), 0)
                return (
                  <div className="space-y-1 mb-2">
                    {openJobsCount > 0 && (
                      <div className="text-sm">Open jobs affected: <strong>{openJobsCount}</strong> — action: <strong>{moveOpenJobs ? 'Reassign to buyer' : 'Keep with seller'}</strong></div>
                    )}
                    {unpaidCount > 0 && (
                      <div className="text-sm">Unpaid invoices affected: <strong>{unpaidCount}</strong> — action: <strong>{moveUnpaidInvoices ? 'Reassign to buyer' : 'Keep with seller'}</strong></div>
                    )}
                    {openJobsCount === 0 && unpaidCount === 0 && (
                      <div className="text-sm">No open jobs or unpaid invoices will be moved.</div>
                    )}
                  </div>
                )
              })()}

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Back</Button>
                <Button onClick={submitTransfer} disabled={loading}>{loading ? 'Transferring...' : 'Confirm and Transfer'}</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
