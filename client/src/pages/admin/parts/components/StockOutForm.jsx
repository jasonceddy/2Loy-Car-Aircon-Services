import { useForm } from "react-hook-form"
import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"

export default function StockOutForm({
  setStockOutModal,
  fetchParts,
  stockOutModal,
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
      await axiosClient.patch(`/parts/${stockOutModal.id}/stock-out`, data)
      toast.success("Part stock-out successfully!")

      reset()
      await fetchParts()
      setStockOutModal({ id: null, open: false })
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
        <label
          htmlFor="quantity"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Quantity
        </label>
        <input
          {...register("quantity")}
          type="number"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter quantity..."
          required
        />
        {errors.quantity && (
          <p className="mt-2 text-sm text-red-600">{errors.quantity.message}</p>
        )}
      </div>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            "Stock In"
          )}
        </button>
        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
      </div>
    </form>
  )
}