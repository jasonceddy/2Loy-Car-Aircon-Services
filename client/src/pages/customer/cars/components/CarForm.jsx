import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"

export default function CarForm({ setModal, fetchCars, modal }) {
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

  // Fetch existing car data if editing
  useEffect(() => {
    setLoadingData(true)
    if (modal.car) {
      // Populate form with existing data
      setValue("plateNo", modal.car.plateNo)
      setValue("brand", modal.car.brand)
      setValue("model", modal.car.model)
      setValue("year", modal.car.year.toString())
      setValue("notes", modal.car.notes)

      setLoadingData(false)
    } else {
      reset()
      setLoadingData(false)
    }
  }, [modal.car, setValue, reset])

  const onSubmit = async (data) => {
    setServerError("")
    try {
      if (modal.car) {
        // Update existing car
        await axiosClient.patch(`/cars/${modal.car.id}`, data)
        toast.success("Car updated successfully!")
      } else {
        // Create new car
        await axiosClient.post("/cars", data)
        toast.success("Car added successfully!")
      }

      reset()
      await fetchCars()
      setModal({ car: null, open: false })
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
          htmlFor="plateNo"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Plate Number
        </label>
        <input
          {...register("plateNo")}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter plate number..."
          required
        />
        {errors.plateNo && (
          <p className="mt-2 text-sm text-red-600">{errors.plateNo.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="brand"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Brand
        </label>
        <input
          {...register("brand")}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter car brand..."
          required
        />
        {errors.brand && (
          <p className="mt-2 text-sm text-red-600">{errors.brand.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="model"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Model
        </label>
        <input
          {...register("model")}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter car model..."
          required
        />
        {errors.model && (
          <p className="mt-2 text-sm text-red-600">{errors.model.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="year"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Year
        </label>
        <input
          {...register("year")}
          type="number"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter year..."
          required
        />
        {errors.year && (
          <p className="mt-2 text-sm text-red-600">{errors.year.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Notes
        </label>
        <textarea
          {...register("notes")}
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 resize-none"
          placeholder="Enter notes..."
          required
        />
        {errors.notes && (
          <p className="mt-2 text-sm text-red-600">{errors.notes.message}</p>
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
            ) : modal.id ? (
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
