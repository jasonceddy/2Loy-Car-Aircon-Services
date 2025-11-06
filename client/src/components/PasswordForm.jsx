// PasswordForm.jsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"

export default function PasswordForm() {
  const [passwordVerified, setPasswordVerified] = useState(false)
  const [serverPasswordError, setServerPasswordError] = useState("")

  // Form for password verification
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { isSubmitting: isSubmittingPassword, errors: passwordErrors },
    reset: resetPassword,
    clearErrors: clearPasswordErrors,
  } = useForm()

  // Form for new password
  const {
    register: registerNewPassword,
    handleSubmit: handleSubmitNewPassword,
    formState: {
      isSubmitting: isSubmittingNewPassword,
      errors: newPasswordErrors,
    },
    setError: setNewPasswordError,
    reset: resetNewPassword,
    clearErrors: clearNewPasswordErrors,
  } = useForm()

  // Handle password verification
  const onVerifyPassword = async (data) => {
    setServerPasswordError("")
    clearPasswordErrors()

    try {
      const response = await axiosClient.post(`/users/verify-password`, data)
      if (response.data.isPasswordValid) {
        setPasswordVerified(true)
        toast.success("Password verified successfully!")
        resetPassword()
      } else {
        setServerPasswordError("Current password is incorrect")
      }
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response.data.message
        setServerPasswordError(message)
      } else {
        toast.error("Something went wrong!")
      }
    }
  }

  // Handle new password submission
  const onChangePassword = async (data) => {
    setServerPasswordError("")
    clearNewPasswordErrors()

    try {
      await axiosClient.patch(`/users/new-password`, data)
      toast.success("Password updated successfully!")
      setPasswordVerified(false)
      resetNewPassword()
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response.data.message

        if (typeof message === "object") {
          Object.entries(message).forEach(([field, msgs]) => {
            setNewPasswordError(field, { type: "server", message: msgs[0] })
          })
        } else {
          setServerPasswordError(message)
        }
      } else {
        toast.error("Something went wrong!")
      }
    }
  }

  // Handle password verification cancel
  const handlePasswordCancel = () => {
    setPasswordVerified(false)
    resetNewPassword()
    resetPassword()
    clearPasswordErrors()
    clearNewPasswordErrors()
    setServerPasswordError("")
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Change Password</h2>

      {!passwordVerified ? (
        // Step 1: Verify current password
        <form
          className="space-y-4"
          onSubmit={handleSubmitPassword(onVerifyPassword)}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="current-password" className="font-medium">
              Current Password
            </label>
            <input
              type="password"
              {...registerPassword("current_password", {
                required: "Current password is required",
              })}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            />
            {passwordErrors.current_password && (
              <p className="mt-1 text-sm text-red-600">
                {passwordErrors.current_password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmittingPassword}
            className="bg-blue-500 text-white py-2 px-5 rounded-xl cursor-pointer hover:scale-105 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmittingPassword ? "Verifying..." : "Verify Password"}
          </button>

          {serverPasswordError && (
            <p className="text-sm mt-2 text-red-600">{serverPasswordError}</p>
          )}
        </form>
      ) : (
        // Step 2: Enter new password
        <form
          className="space-y-4"
          onSubmit={handleSubmitNewPassword(onChangePassword)}
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-green-800 text-sm">
              ✓ Current password verified. You can now enter your new password.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="new-password" className="font-medium">
              New Password
            </label>
            <input
              type="password"
              {...registerNewPassword("new_password", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters long",
                },
              })}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            />
            {newPasswordErrors.new_password && (
              <p className="mt-1 text-sm text-red-600">
                {newPasswordErrors.new_password.message}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSubmittingNewPassword}
              className="bg-green-500 text-white py-2 px-5 rounded-xl cursor-pointer hover:scale-105 duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingNewPassword ? "Updating..." : "Update Password"}
            </button>
            <button
              type="button"
              onClick={handlePasswordCancel}
              className="bg-gray-500 text-white py-2 px-5 rounded-xl cursor-pointer hover:scale-105 duration-200"
            >
              Cancel
            </button>
          </div>

          {serverPasswordError && (
            <p className="text-sm mt-2 text-red-600">{serverPasswordError}</p>
          )}
        </form>
      )}
    </div>
  )
}