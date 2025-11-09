import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"

export default function CustomerForm({ setModal, fetchUsers, modal }) {
  const editing = Boolean(modal?.user)

  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })

  const [serverError, setServerError] = useState("")
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    setLoadingData(true)
    if (editing && modal.user) {
      setValue("name", modal.user.name || "")
      setValue("phone", modal.user.phone || "")
      setValue("email", modal.user.email || "")
    } else {
      reset({ name: "", email: "", phone: "" })
    }
    setLoadingData(false)
  }, [editing, modal.user, reset, setValue])

  const onSubmit = async (data) => {
    setServerError("")
    try {
      if (editing) {
        await axiosClient.patch(`/users/${modal.user.id}`, {
          name: data.name?.trim(),
          email: data.email?.trim(),
          phone: data.phone?.trim(),
        })
        toast.success("Customer updated successfully!")
      } else {
        await axiosClient.post("/users", {
          name: data.name?.trim(),
          email: data.email?.trim(),
          phone: data.phone?.trim(),
          role: "CUSTOMER",
          blocked: false,
        })
        toast.success("Customer added successfully!")
      }

      reset()
      await fetchUsers()
      setModal({ user: null, open: false })
    } catch (error) {
      if (error?.response?.status === 400) {
        const message = error.response.data.message
        if (typeof message === "object") {
          Object.entries(message).forEach(([field, msgs]) => {
            setError(field, { type: "server", message: msgs?.[0] || "Invalid value" })
          })
        } else {
          setServerError(message || "Validation failed")
        }
      } else {
        toast.error(error?.response?.data?.message || "Something went wrong!")
      }
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderCircle className="animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">Name</label>
        <input
          {...register("name", { required: "Name is required" })}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter customer name..."
          required
        />
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">Email</label>
        <input
          {...register("email", { required: "Email is required" })}
          type="email"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter email..."
          required
        />
        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">Phone</label>
        <input
          {...register("phone", { required: "Phone is required" })}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter phone number..."
          required
        />
        {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : editing ? "Update" : "Save"}
        </button>
        {serverError && <p className="text-sm mt-1 text-red-600">{serverError}</p>}
      </div>
    </form>
  )
}
