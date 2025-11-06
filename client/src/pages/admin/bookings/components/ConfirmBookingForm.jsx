import { useForm } from "react-hook-form"
import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"

export default function ConfirmBookingForm({
  confirmBooking,
  setConfirmBooking,
  fetchBookings,
  onConfirmed, // optional callback invoked after successful confirmation
}) {
  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
    reset,
  } = useForm()

  const [serverError, setServerError] = useState("")

  const onSubmit = async (data) => {
    setServerError("")

    try {
      // combine date + time into one Date object
      await axiosClient.patch(`/bookings/${confirmBooking.id}/confirm`, data)
      await fetchBookings()
      toast.success("Booking confirmed successfully!")

      reset()
      setConfirmBooking({ id: null, open: false })

      if (onConfirmed && typeof onConfirmed === 'function') {
        try { onConfirmed(confirmBooking) } catch (e) { console.error('onConfirmed handler failed', e) }
      }
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response.data.message
        if (typeof message === "object") {
          Object.entries(message).forEach(([field, msgs]) => {
            setError(field, { type: "server", message: msgs[0] })
          })
        } else {
          setServerError(message)
        }
      } else {
        toast.error("Something went wrong!")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 rounded-lg px-5 py-2.5 flex items-center justify-center"
        >
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Confirm"}
        </button>
        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
      </div>
    </form>
  )
}
