// ProfileForm.jsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"

export default function ProfileForm({ user }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [serverError, setServerError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    reset,
    clearErrors,
  } = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  })

  const onSubmit = async (data) => {
    setServerError("")
    clearErrors()

    try {
      await axiosClient.patch(`/users/edit`, data)
      toast.success("Profile updated successfully!")
      setIsEditMode(false)
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

  const handleEditToggle = () => {
    if (isEditMode) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
      })
      clearErrors()
      setServerError("")
      setIsEditMode(false)
    } else {
      setIsEditMode(true)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      {/* HEADER WITH EDIT BUTTON - COMPLETELY OUTSIDE FORM */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Profile Information</h2>
        {!isEditMode && (
          <button
            type="button"
            onClick={handleEditToggle}
            className="bg-blue-500 text-white py-2 px-5 rounded-xl cursor-pointer hover:scale-105 duration-200"
          >
            Edit
          </button>
        )}
      </div>

      {/* FORM STARTS HERE */}
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-medium">
            Name
          </label>
          <input
            type="text"
            {...register("name", {
              required: isEditMode ? "Name is required" : false,
            })}
            className={`border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 ${
              isEditMode
                ? "bg-white border-gray-300"
                : "bg-gray-50 border-gray-300"
            }`}
            readOnly={!isEditMode}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-medium">
            Email
          </label>
          <input
            type="email"
            {...register("email", {
              required: isEditMode ? "Email is required" : false,
              pattern: isEditMode
                ? {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter a valid email address",
                  }
                : undefined,
            })}
            className={`border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 ${
              isEditMode
                ? "bg-white border-gray-300"
                : "bg-gray-50 border-gray-300"
            }`}
            readOnly={!isEditMode}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="font-medium">
            Phone
          </label>
          <input
            type="text"
            {...register("phone")}
            className={`border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 ${
              isEditMode
                ? "bg-white border-gray-300"
                : "bg-gray-50 border-gray-300"
            }`}
            readOnly={!isEditMode}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* SAVE/CANCEL BUTTONS INSIDE FORM - ONLY WHEN IN EDIT MODE */}
        {isEditMode && (
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-500 text-white py-2 px-5 rounded-xl cursor-pointer hover:scale-105 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleEditToggle}
              className="bg-gray-500 text-white py-2 px-5 rounded-xl cursor-pointer hover:scale-105 duration-200"
            >
              Cancel
            </button>
          </div>
        )}

        {serverError && (
          <p className="mt-2 text-sm text-red-600">{serverError}</p>
        )}
      </form>
      {/* FORM ENDS HERE */}
    </div>
  )
}