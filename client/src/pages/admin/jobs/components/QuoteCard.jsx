import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CreditCard, XCircle, Loader2 } from "lucide-react"
import axiosClient from "@/axiosClient"
import { toast } from "react-toastify"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { formatCurrency } from "@/lib/formatter"

export default function QuoteCard({ quote, setQuoteCard }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const cancelQuote = async (id) => {
    setLoading(true)
    try {
      await axiosClient.delete(`/quotes/${id}/cancel`)
      setLoading(false)
      setQuoteCard({ quote: null, open: false })
      navigate(0)
      toast.success("Quote cancelled successfully!")
    } catch (error) {
      toast.error("Something went wrong!")
      setLoading(false)
    }
  }

  const quoteStatus = quote?.quote?.status
  const serviceName = quote?.service?.name || quote?.pack?.name || "Service"
  const serviceDesc = quote?.service?.description || quote?.pack?.description || ""
  const technicianName = quote?.technician?.name || "Not assigned yet"
  const car = quote?.car
  const totalAmount = quote?.service?.cost || quote?.pack?.price || 0

  return (
    <div className="fixed inset-0 h-full w-full flex flex-items bg-black/20 justify-center items-center z-50">
      <Card className="w-full max-w-xl mx-auto mb-4 shadow-lg rounded-2xl">
        <CardHeader className="flex justify-end">
          <XCircle
            className="cursor-pointer"
            onClick={() => setQuoteCard({ quote: null, open: false })}
          />
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <FileText size={18} /> Quote
            </h2>
            <Badge
              className={
                quoteStatus === "APPROVED"
                  ? "bg-green-100 text-green-700"
                  : quoteStatus === "PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }
            >
              {quoteStatus}
            </Badge>
          </div>

          {/* Quote details */}
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <span className="font-medium">Service:</span> {serviceName}
            </p>
            {serviceDesc && <p className="text-gray-600">{serviceDesc}</p>}
            <p>
              <span className="font-medium">Technician:</span> {technicianName}
            </p>
            {car && (
              <p>
                <span className="font-medium">Car:</span> {car.plateNo} – {car.brand} {car.model} ({car.year})
              </p>
            )}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-medium">Total</span>
            <span className="font-bold text-lg">{formatCurrency(totalAmount)}</span>
          </div>

          {/* Actions for pending */}
          {quoteStatus === "PENDING" && (
            <div className="flex items-center justify-end">
              <Button
                size="lg"
                disabled={loading}
                className="mt-2 flex items-center gap-2 bg-red-400 cursor-pointer"
                onClick={() => cancelQuote(quote?.quote?.id)}
              >
                {loading ? <Loader2 className="animate-spin" /> : "Cancel Quote"}
              </Button>
            </div>
          )}

          {/* Billing */}
          {quote?.billing && (
            <div className="pt-2 border-t">
              <p className={`text-sm ${quote.billing.status === "PAID" ? "text-green-600" : "text-red-600"}`}>
                Billing: {quote.billing.status}
              </p>
              {quote.billing.status === "UNPAID" && (
                <Button size="sm" className="mt-2 flex items-center gap-2">
                  <CreditCard size={16} /> Pay Now
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}