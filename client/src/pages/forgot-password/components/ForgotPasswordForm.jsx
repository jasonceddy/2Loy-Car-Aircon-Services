import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import axiosClient from "../../../axiosClient"
import { useState, useEffect } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
export default function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    reset,
  } = useForm() //react hook form

  const [serverError, setServerError] = useState("") //show server error message i.e. invalid credentials and incorrect password
  const [success, setSuccess] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const navigate = useNavigate()
  const onSubmit = async (data) => {
    setServerError("") // reset previous server error
    try {
      await axiosClient.post("/auth/forgot-password", data)
      reset()
      toast.success("Email sent successfully!")
      setSuccess(true)
      setTimeLeft(300) // 5 minutes in seconds
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

  // Save expiry only once when success starts
  useEffect(() => {
    if (success) {
      const existingExpiry = localStorage.getItem("forgotExpiry")
      if (!existingExpiry) {
        const expiry = Date.now() + 300 * 1000 // 5 minutes
        localStorage.setItem("forgotExpiry", expiry)
        setTimeLeft(300)
      }
    }
  }, [success])

  // Restore countdown on reload
  useEffect(() => {
    const expiry = localStorage.getItem("forgotExpiry")
    if (expiry) {
      const diff = Math.floor((expiry - Date.now()) / 1000)
      if (diff > 0) {
        setTimeLeft(diff)
        setSuccess(true) // ensure message still shows
      } else {
        localStorage.removeItem("forgotExpiry")
        navigate("/") // if expired already, redirect immediately
      }
    }
  }, [navigate])

  // Countdown interval
  useEffect(() => {
    if (!timeLeft) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          localStorage.removeItem("forgotExpiry")
          navigate("/")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, navigate])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
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
        <button
          type="submit"
          disabled={isSubmitting || success}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center  disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Send"}
        </button>
        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
        {success && (
          <p className="text-sm mt-1 text-green-600">
            Email sent! Reset link valid for {minutes}:
            {seconds.toString().padStart(2, "0")}
          </p>
        )}
      </div>
    </form>
  )
}
