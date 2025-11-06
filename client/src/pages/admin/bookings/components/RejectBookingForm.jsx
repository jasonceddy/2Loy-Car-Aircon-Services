import { useForm } from "react-hook-form"
import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"

export default function RejectBookingForm({
  rejectBooking,
  setRejectBooking,
  fetchBookings,
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    reset,
  } = useForm()

  const [serverError, setServerError] = useState("")

  const onSubmit = async (data) => {
    setServerError("")

    try {
      // combine date + time into one Date object
      await axiosClient.patch(`/bookings/${rejectBooking.id}/reject`, data)
      await fetchBookings()
      toast.success("Rejected successfully!")

      reset()
      setRejectBooking({ id: null, open: false })
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
      {/* Technician Select → only if allowed */}
      <div>
        <label
          htmlFor="reason"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Reason
        </label>
        <textarea
          {...register("reason")}
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 resize-none"
          placeholder="Enter reason..."
          required
        />
        {errors.reason && (
          <p className="mt-2 text-sm text-red-600">{errors.reason.message}</p>
        )}
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 rounded-lg px-5 py-2.5 flex items-center justify-center"
        >
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Reject?"}
        </button>
        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
      </div>
    </form>
  )
}
