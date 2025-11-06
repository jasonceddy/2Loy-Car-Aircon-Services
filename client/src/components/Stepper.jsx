import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
  QuoteIcon,
  Receipt,
  Loader2,
} from "lucide-react"
import QuoteCard from "@/pages/customer/components/QuoteCard"
import InvoiceModal from "./InvoiceModal"
import RequestChangeModal from "@/pages/customer/components/RequestChangeModal"
import EditBookingModal from "@/pages/customer/components/EditBookingModal"
import axiosClient from "@/axiosClient"
import { toast } from "react-toastify"

const stages = ["DIAGNOSTIC", "REPAIR", "TESTING", "COMPLETION"]

export default function Stepper({ booking }) {
  const [expanded, setExpanded] = useState(false)
  const [quoteCard, setQuoteCard] = useState({
    open: false,
    quote: null,
  })
  const [invoiceModal, setInvoiceModal] = useState(false)
  const onCloseInvoice = () => setInvoiceModal(false)
  const [requestModal, setRequestModal] = useState({ open: false })
  const [editModal, setEditModal] = useState({ open: false })

  const currentStageIndex = stages.indexOf(
    booking.jobs?.[0]?.stage || "DIAGNOSTIC"
  )

  // Robust consult detection
  const isConsult = (() => {
    if (!booking) return false
    if (booking.bookingMode === 'consult' || booking.isConsult) return true
    try {
      const spRaw = booking.servicePreferences
      if (spRaw) {
        const spStr = typeof spRaw === 'string' ? spRaw : JSON.stringify(spRaw)
        if (spStr && spStr.toLowerCase().includes('consult')) return true
      }
    } catch (e) {}
    const fields = [booking.serviceType, booking.service?.name, booking.pack?.name]
    return fields.some((f) => (f || '').toString().toLowerCase().includes('consult'))
  })()

  return (
    <>
      <Card className={`w-full max-w-xl mx-auto mb-4 shadow-lg rounded-2xl ${(isConsult ? 'border-l-4 border-blue-400' : '')}`}>
        <CardContent className="p-4 space-y-4">
          {/* Booking Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-lg">
                {isConsult ? (
                  <>
                    Consultation — {booking.car?.plateNo}
                  </>
                ) : (
                  <>
                    {(booking.service?.name || booking.pack?.name || "Package")} {" – "}{booking.car?.plateNo}
                  </>
                )}
              </h2>
              {(/consult/i.test((booking?.service?.name || booking?.pack?.name || '').toString()) && (
                <span className="inline-block ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">Consultation</span>
              ))}
              <p className="text-sm text-gray-500">
                Scheduled: {new Date(booking.scheduledAt).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-xs rounded-full ${
                booking.status === "CONFIRMED"
                  ? "bg-green-100 text-green-700"
                  : booking.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {booking.status}
            </span>
          </div>

          {/* Timeline: show simplified view for consultations */}
          {isConsult ? (
            <div className="mt-3">
              {/* Consultation 3-step flow: Requested -> In Progress -> Completed */}
              {(() => {
                const steps = ["Requested", "In Progress", "Completed"]
                // Determine current step index
                let current = 0
                if (booking.status === "PENDING") current = 0
                else if (booking.status === "CONFIRMED") {
                  const hasCompletion = booking.jobs?.some((j) => j.stage === "COMPLETION")
                  current = hasCompletion ? 2 : 1
                } else if (booking.status === "CANCELLED" || booking.status === "REJECTED") {
                  current = 0
                }

                return (
                  <div className="flex items-center gap-6">
                    {steps.map((label, idx) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className={`w-7 h-7 flex items-center justify-center rounded-full ${idx <= current ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                          {idx === 2 ? (
                            <CheckCircle size={14} />
                          ) : idx === 1 ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Clock size={14} />
                          )}
                        </div>
                        <div className="text-xs">{label}</div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          ) : (
            booking.status === "CONFIRMED" && (
              <div className="flex justify-between items-center mt-2">
                {stages.map((stage, index) => (
                  <div key={stage} className="flex-1 text-center relative">
                    <div
                      className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${
                        index <= currentStageIndex
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {index <= currentStageIndex ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Clock size={18} />
                      )}
                    </div>
                    <p className="text-xs mt-1">{stage}</p>
                    {index < stages.length - 1 && (
                      <div
                        className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${
                          index < currentStageIndex
                            ? "bg-green-600"
                            : "bg-gray-300"
                        }`}
                      ></div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* Quote & Billing */}
          {booking.quote && (
            <div className="mt-3 border-t pt-3">
              <h3 className="font-medium flex items-center gap-2">
                <FileText size={16} /> Quote & Billing{" "}
                <span
                  className={`px-3 py-1 text-xs rounded-full ${
                    booking.quote.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : booking.quote.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {" "}
                  {booking.quote.status}
                </span>
              </h3>
              {booking.quote.status === "PENDING" && (
                <p className="text-sm text-gray-600">
                  <Button
                    onClick={() => setQuoteCard({ open: true, quote: booking })}
                    size="sm"
                    className="mt-2 flex items-center gap-2 cursor-pointer hover:scale-105 duration-200"
                  >
                    <QuoteIcon size={16} /> Quote
                  </Button>
                </p>
              )}

              {booking.quote.billing && (
                <p
                  className={`text-sm ${
                    booking.quote.billing?.status === "PAID"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Billing: {booking.quote.billing?.status || "UNPAID"}
                </p>
              )}
              {booking.quote.billing?.status === "PAID" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 cursor-pointer hover:scale-105 duration-200"
                  onClick={() => setInvoiceModal(true)}
                >
                  <Receipt size={16} /> View Invoice
                </Button>
              )}
            </div>
          )}

          {/* Actions: View / Edit / Request Change / Cancel */}
          <div className="flex flex-wrap justify-end items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Hide Details" : "View Details"}
            </Button>

            {/* For consultations we allow editing/requesting/cancelling regardless of scheduledAt (consults may use immediate "now") */}
            {(isConsult || (new Date(booking.scheduledAt) > new Date())) && booking.status !== 'CANCELLED' && booking.status !== 'REJECTED' && (
              <Button size="sm" onClick={() => { setRequestModal({ open: false }); setEditModal({ open: true }); }}>
                {isConsult ? 'Edit Consultation' : 'Edit Booking'}
              </Button>
            )}

            {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (isConsult || new Date(booking.scheduledAt) > new Date()) && (
              <Button size="sm" className="" onClick={() => setRequestModal({ open: true })}>
                {isConsult ? 'Request Change' : 'Request Change'}
              </Button>
            )}

            {(isConsult || new Date(booking.scheduledAt) > new Date()) && booking.status !== 'CANCELLED' && booking.status !== 'REJECTED' && (
              <Button size="sm" variant="destructive" onClick={async () => {
                const confirmText = isConsult ? 'Cancel this consultation?' : 'Cancel this booking?'
                if (!confirm(confirmText)) return
                try {
                  await axiosClient.patch(`/bookings/${booking.id}/cancel`)
                  toast.success(isConsult ? 'Consultation cancelled' : 'Booking cancelled')
                  // ideally refresh parent state; fallback to reload
                  window.location.reload()
                } catch (err) {
                  toast.error(err.response?.data?.message || err.message)
                }
              }}>
                {isConsult ? 'Cancel Consultation' : 'Cancel Booking'}
              </Button>
            )}
          </div>

          {/* Expanded Details */}
          {expanded && (
            <div className="text-sm text-gray-600">
                <p>
                  Car: {booking.car?.brand} {booking.car?.model} ({booking.car?.year}
                  )
                </p>
                {!isConsult && (
                  <p>
                    Service: {booking.service?.description || booking.pack?.description || "Package booking"}
                  </p>
                )}
              <p>
                Technician: {booking.technician?.name || "Not assigned yet"}
              </p>
              {booking.changeRequests && booking.changeRequests.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-semibold">Change Request History</h4>
                  <ul className="text-sm text-gray-700">
                    {booking.changeRequests.map((r) => (
                      <li key={r.id} className="mt-1">
                        {new Date(r.requestedAt).toLocaleString()} — {r.status} by {r.requester?.name}
                        {r.reason && <span className="text-gray-500"> — {r.reason}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {quoteCard.open && (
        <QuoteCard quote={quoteCard.quote} setQuoteCard={setQuoteCard} />
      )}
      {invoiceModal && (
        <InvoiceModal booking={booking} onClose={onCloseInvoice} />
      )}
      {requestModal.open && (
        <RequestChangeModal open={requestModal.open} onClose={() => setRequestModal({ open: false })} booking={booking} onRequested={() => { /* could refresh list */ }} />
      )}
      {editModal.open && (
        <EditBookingModal booking={booking} open={editModal.open} onClose={() => setEditModal({ open: false })} onSaved={() => { /* optionally refresh */ }} />
      )}
    </>
  )
}