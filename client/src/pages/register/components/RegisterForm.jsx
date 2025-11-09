import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import axiosClient from "../../../axiosClient"
import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    reset,
  } = useForm() //react hook form
  const navigate = useNavigate() //for navigation
  const [serverError, setServerError] = useState("") //show server error message i.e. invalid credentials and incorrect password

  const onSubmit = async (data) => {
    setServerError("") // reset previous server error
    try {
      await axiosClient.post("/auth/register", data)
      toast.success("Registration Successful! You can now login.")
      navigate("/login")
      reset()
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response.data.message

        // middleware (field validation) zod Errors
        if (typeof message === "object") {
          Object.entries(message).forEach(([field, msgs]) => {
            setError(field, { type: "server", message: msgs[0] })
          })
        }
        // endpoint (general errors)
        else {
          setServerError(message)
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
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
          placeholder="Enter name..."
          required
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="phone"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Phone Number
        </label>
        <input
          {...register("phone")}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter number..."
          required
        />
        {errors.phone && (
          <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
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
          {...register("email", {
            required: "Please enter your email",
            pattern: {
              // simple, commonly used email regex to catch most invalid inputs
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Invalid email address",
            },
          })}
          type="email"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
          placeholder="Enter email..."
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div className="flex flex-col">
        <label
          htmlFor="password"
          className="block mb-2 text-sm font-medium text-gray-900"
        >
          Password
        </label>
        <input
          {...register("password")}
          type="password"
          placeholder="Enter password..."
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 "
          required
        />
        {errors.password && (
          <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center  disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Sign Up"}
        </button>
        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
      </div>
      <p className="text-sm font-light text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
