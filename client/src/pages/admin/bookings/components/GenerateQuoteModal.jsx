import { Car, Pickaxe, User, XCircle } from "lucide-react"
import { useState } from "react"
import axiosClient from "@/axiosClient"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

export default function GenerateQuoteModal({
  quoteModal,
  setQuoteModal,
  fetchBookings,
}) {
  const [amount, setAmount] = useState(
    quoteModal.booking?.service?.cost || quoteModal.booking?.pack?.price || ""
  )
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleGenerate = async () => {
    if (!amount) {
      toast.error("Please enter an amount")
      return
    }
    setLoading(true)
    try {
      const res = await axiosClient.post(`/quotes/${quoteModal.booking.id}/generate`, {
        amount: parseFloat(amount),
      })
      toast.success(res.data?.message || "Quote generated")
      setQuoteModal({ booking: null, open: false })
      if (fetchBookings) fetchBookings()
      // Navigate to admin dashboard (revenue summary)
      navigate("/admin")
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 h-full w-full flex flex-items bg-black/20 justify-center  z-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 flex-1">
        <div className="w-full bg-white rounded-lg shadow border border-black md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl flex items-center gap-1">
                Details
              </h1>
              <XCircle
                className="cursor-pointer"
                onClick={() => setQuoteModal({ booking: null, open: false })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-1">
                  <User /> Customer
                </h2>
                <p>Name: {quoteModal.booking.customer.name}</p>
                <p>Email: {quoteModal.booking.customer.email}</p>
                <p>Phone: {quoteModal.booking.customer.phone}</p>
              </div>

              <div>
                <h2 className="text-lg font-bold flex items-center gap-1">
                  <Car /> Car
                </h2>
                <p>Plate No: {quoteModal.booking.car.plateNo}</p>
                <p>Brand: {quoteModal.booking.car.brand}</p>
                <p>Model: {quoteModal.booking.car.model}</p>
                <p>Year: {quoteModal.booking.car.year}</p>
                <p>Notes: {quoteModal.booking.car.notes}</p>
              </div>

              <div>
                <h2 className="text-lg font-bold flex items-center gap-1">
                  <Pickaxe /> Service
                </h2>
                <p>
                  Service: {quoteModal.booking.service?.name || quoteModal.booking.pack?.name || "Package"}
                </p>
                <p>
                  Cost: {quoteModal.booking.service?.cost || quoteModal.booking.pack?.price || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border py-2 px-3"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => setQuoteModal({ booking: null, open: false })}
                  disabled={loading}
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate Quote"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}