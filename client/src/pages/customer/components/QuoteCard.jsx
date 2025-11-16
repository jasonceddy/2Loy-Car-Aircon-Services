import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, CreditCard, XCircle, Loader2 } from "lucide-react"
import axiosClient from "@/axiosClient"
import { toast } from "react-toastify"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function QuoteCard({ quote, setQuoteCard }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const acceptQuote = async (id) => {
    setLoading(true)
    try {
      await axiosClient.patch(`/quotes/${id}/accept`)

      setLoading(false)
      setQuoteCard({ quote: null, open: false })
      navigate(0)
      toast.success("Billing accepted successfully!")
    } catch (error) {
      toast.error("Something went wrong!")
      setLoading(false)
    }
  }
  return (
    <div className="fixed inset-0 h-full w-full flex flex-items bg-black/20 justify-center items-center  z-50">
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
              <FileText size={18} /> Billing
            </h2>
            <Badge
              className={
                quote.quote.status === "APPROVED"
                  ? "bg-green-100 text-green-700"
                  : quote.quote.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }
            >
              {quote.quote.status}
            </Badge>
          </div>

          {/* Quote details */}
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <span className="font-medium">Service:</span> {quote.service?.name || quote.pack?.name || "Package"}
            </p>
            <p className="text-gray-600">{quote.service?.description || quote.pack?.description || "Package booking"}</p>
            <p>
              <span className="font-medium">Technician:</span>{" "}
              {quote.technician?.name || "Not assigned yet"}
            </p>
            <p>
              <span className="font-medium">Car:</span> {quote.car.plateNo} –{" "}
              {quote.car.brand} {quote.car.model} ({quote.car.year})
            </p>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-medium">Total</span>
            <span className="font-bold text-lg">₱{quote.service?.cost || quote.pack?.price || 0}</span>
          </div>

          {quote.quote.status === "PENDING" && (
            <div className="flex items-center justify-end">
              <Button
                size="lg"
                disabled={loading}
                className="mt-2 flex items-center gap-2 bg-green-400 cursor-pointer"
                onClick={() => acceptQuote(quote.quote.id)}
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Accept Billing"
                )}
              </Button>
            </div>
          )}

          {/* Billing */}
          {quote.billing && (
            <div className="pt-2 border-t">
              <p
                className={`text-sm ${
                  quote.billing.status === "PAID"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
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
