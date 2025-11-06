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
} from "lucide-react"
import { Loader2 } from "lucide-react"
import QuoteCard from "./QuoteCard"
import EditBillingModal from "./EditBillingModal"
import InvoiceModal from "./InvoiceModal"

const stages = ["DIAGNOSTIC", "REPAIR", "TESTING", "COMPLETION"]

export default function Stepper({ booking }) {
  const [expanded, setExpanded] = useState(false)
  const [quoteCard, setQuoteCard] = useState({
    open: false,
    quote: null,
  })
  const [editBilling, setEditBilling] = useState(false)
  const [invoiceModal, setInvoiceModal] = useState(false)

  const onClose = () => setEditBilling(false)
  const onCloseInvoice = () => setInvoiceModal(false)

  const currentStageIndex = stages.indexOf(
    booking.jobs?.[0]?.stage || "DIAGNOSTIC"
  )

  let bookingPreferences = booking?.servicePreferences
  try { if (typeof bookingPreferences === 'string') bookingPreferences = JSON.parse(bookingPreferences) } catch (e) { bookingPreferences = bookingPreferences }
  const isConsult = (bookingPreferences && bookingPreferences.bookingMode === 'consult') || /consult/i.test((booking?.service?.name || booking?.pack?.name || '').toString())

  return (
    <>
      <Card className="w-full max-w-xl mx-auto mb-4 shadow-lg rounded-2xl">
        <CardContent className="p-4 space-y-4">
          {/* Booking Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-lg">
                {(booking.service?.name || booking.pack?.name || "Package")}
                {" – "}
                {booking.car?.plateNo}
              </h2>
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

          {/* Timeline or Consultation flow */}
          {isConsult ? (
            <div className="mt-3">
              {(() => {
                const steps = ["Requested", "In Progress", "Completed"]
                let current = 0
                if (booking.status === "PENDING") current = 0
                else if (booking.status === "CONFIRMED") {
                  const hasCompletion = booking.jobs?.some((j) => j.stage === "COMPLETION")
                  current = hasCompletion ? 2 : 1
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
                  className={`text-sm font-semibold ${
                    booking.quote.billing?.status === "PAID"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Billing: {booking.quote.billing?.status || "UNPAID"}
                </p>
              )}
              {booking.quote.billing &&
                booking.quote.billing?.status === "UNPAID" && (
                  <Button
                    size="sm"
                    className="mt-2 flex items-center gap-2 cursor-pointer hover:scale-105 duration-200"
                    onClick={() => setEditBilling(true)}
                  >
                    <CreditCard size={16} /> Edit Billing
                  </Button>
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

          {/* Expand/Collapse */}
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? "Hide Details" : "View Details"}
            </Button>
          </div>

          {/* Expanded Details */}
          {expanded && (
            <div className="text-sm text-gray-600">
              <p>
                Car: {booking.car.brand} {booking.car.model} ({booking.car.year}
                )
              </p>
              <p>Service: {booking.service?.description || booking.pack?.description || "Package booking"}</p>
              <p>
                Technician: {booking.technician?.name || "Not assigned yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      {quoteCard.open && (
        <QuoteCard quote={quoteCard.quote} setQuoteCard={setQuoteCard} />
      )}
      {editBilling && (
        <EditBillingModal billing={booking.quote?.billing} onClose={onClose} />
      )}
      {invoiceModal && (
        <InvoiceModal booking={booking} onClose={onCloseInvoice} />
      )}
    </>
  )
}
