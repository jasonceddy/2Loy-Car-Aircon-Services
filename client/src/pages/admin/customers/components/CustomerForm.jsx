import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"

export default function CustomerForm({ setModal, fetchUsers, modal }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    setValue, // Add this to set form values
  } = useForm()

  const [serverError, setServerError] = useState("")
  const [loadingData, setLoadingData] = useState(false) // For loading existing data

  // Fetch existing service data if editing
  useEffect(() => {
    setLoadingData(true)

    setValue("name", modal.user.name)
    setValue("phone", modal.user.phone)
    setValue("email", modal.user.email)
    setLoadingData(false)
  }, [modal.user, setValue])

  const onSubmit = async (data) => {
    setServerError("")
    try {
      await axiosClient.patch(`/users/${modal.user.id}`, data)
      toast.success("User updated successfully!")

      await fetchUsers()
      setModal({ user: null, open: false })
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
          placeholder="Enter user name..."
          required
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Email
        </label>
        <input
          {...register("email")}
          type="email"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter email..."
          required
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="phone"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Phone
        </label>
        <input
          {...register("phone")}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter phone number..."
          required
        />
        {errors.phone && (
          <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Update"}
        </button>
        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
      </div>
    </form>
  )
}