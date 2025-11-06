import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"

export default function PartForm({ setModal, fetchParts, modal }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    reset,
    setValue, // Add this to set form values
  } = useForm()

  const [serverError, setServerError] = useState("")
  const [loadingData, setLoadingData] = useState(false) // For loading existing data

  // Fetch existing service data if editing
  useEffect(() => {
    setLoadingData(true)
    if (modal.part) {
      // Populate form with existing data
      setValue("name", modal.part.name)
      setValue("threshold", modal.part.threshold.toString())
      setValue("price", (modal.part.price ?? 0).toString())

      setLoadingData(false)
    } else {
      reset()
      setLoadingData(false)
    }
  }, [modal.part, setValue, reset])

  const onSubmit = async (data) => {
    setServerError("")
    try {
      if (modal.part) {
        // Update existing service
        await axiosClient.patch(`/parts/${modal.part.id}`, data)
        toast.success("Part updated successfully!")
      } else {
        // Create new service
        await axiosClient.post("/parts", data)
        toast.success("Part added successfully!")
      }

      reset()
      await fetchParts()
      setModal({ part: null, open: false })
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

  // Show loading state while fetching data
  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderCircle className="animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
      {/* existing form fields remain the same */}
      <div>
        <label
          htmlFor="name"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Name
        </label>
        <input
          {...register("name")}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter part name..."
          required
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {!modal.part && (
        <div>
          <label
            htmlFor="stock"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Stock
          </label>
          <input
            {...register("stock")}
            type="number"
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
            placeholder="Enter stock..."
            required
          />
          {errors.stock && (
            <p className="mt-2 text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>
      )}

      <div>
        <label
          htmlFor="price"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Price
        </label>
        <input
          {...register("price")}
          type="number"
          step="0.01"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter part price..."
          required
        />
        {errors.price && (
          <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="threshold"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Threshold
        </label>
        <input
          {...register("threshold")}
          type="number"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter threshold..."
          required
        />
        {errors.threshold && (
          <p className="mt-2 text-sm text-red-600">
            {errors.threshold.message}
          </p>
        )}
      </div>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {
            isSubmitting ? (
              <LoaderCircle className="animate-spin" />
            ) : modal.part ? (
              "Update"
            ) : (
              "Save"
            ) // Dynamic button text
          }
        </button>
        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
      </div>
    </form>
  )
}