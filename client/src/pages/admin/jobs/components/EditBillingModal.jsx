import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Plus, Receipt, CreditCard } from "lucide-react"
import axiosClient from "@/axiosClient"
import { toast } from "react-toastify"
import { formatCurrency } from "@/lib/formatter"
import { useNavigate } from "react-router-dom"

export default function EditBillingModal({ billing, onClose }) {
  const navigate = useNavigate()
  const [payments, setPayments] = useState(billing?.payments || [])
  const [newPayment, setNewPayment] = useState({
    amount: "",
    method: "CASH",
  })
  const [loading, setLoading] = useState(false)

  const totalPaid = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  )
  const remainingBalance = billing.total - totalPaid
  const isFullyPaid = remainingBalance <= 0

  const paymentMethods = [
    { value: "CASH", label: "Cash" },
    { value: "CARD", label: "Credit/Debit Card" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "CHECK", label: "Check" },
    { value: "GCASH", label: "GCash" },
    { value: "PAYMAYA", label: "PayMaya" },
  ]

  const handleAddPayment = async () => {
    setLoading(true)
    try {
      const payment = await axiosClient.post(
        `/billings/${billing.id}/payment`,
        newPayment
      )
      console.log(payment.data)
      setPayments([...payments, payment.data.payment])
      setNewPayment({ amount: "", method: "CASH" })
      toast.success("Payment added successfully!")
      setLoading(false)
    } catch (error) {
      console.log(error)
      toast.error("Something went wrong!")
      setLoading(false)
    }
  }

  const handlePaidBilling = async () => {
    setLoading(true)
    try {
      const paid = await axiosClient.patch(`/billings/${billing.id}`)
      toast.success("Billing paid successfully!")
      onClose()
      navigate(0)
    } catch (error) {
      toast.error("Something went wrong!")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={20} />
            Edit Billing - #{billing.id}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Billing Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-semibold">₱{billing.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Paid:</span>
              <span className="font-semibold text-green-600">
                ₱{totalPaid.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Remaining Balance:</span>
              <span
                className={`font-bold ${
                  remainingBalance > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                ₱{remainingBalance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Payment History</h3>
              <div className="space-y-2">
                {payments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <span className="font-medium">
                        {formatCurrency(payment.amount)}
                      </span>
                      <span className="text-gray-500 ml-2">
                        via {payment.method}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(payment.paidAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Payment */}
          {!isFullyPaid && (
            <div className="space-y-4">
              <h3 className="font-semibold">Add Payment</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="Payment amount"
                    value={newPayment.amount}
                    min={1}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value)) // clamp at 0
                      setNewPayment((prev) => ({
                        ...prev,
                        amount: val.toString(),
                      }))
                    }}
                  />
                </div>
                <Select
                  value={newPayment.method}
                  onValueChange={(value) =>
                    setNewPayment((prev) => ({ ...prev, method: value }))
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button disabled={loading} onClick={handleAddPayment}>
                  <Plus size={16} />
                </Button>
              </div>

              {/* Quick buttons for common amounts */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setNewPayment((prev) => ({
                      ...prev,
                      amount: remainingBalance.toString(),
                    }))
                  }
                >
                  Full Balance (₱{remainingBalance.toFixed(2)})
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>

            <div className="flex gap-3">
              {isFullyPaid && billing.status !== "PAID" && (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handlePaidBilling}
                >
                  <Receipt size={16} className="mr-2" />
                  Mark as Paid & Generate Invoice
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}