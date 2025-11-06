import { useForm } from "react-hook-form"
import { useState } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"

export default function DeleteCustomerForm({
  setDeleteModal,
  fetchUsers,
  deleteModal,
}) {
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()

  const [serverError, setServerError] = useState("")

  const onSubmit = async () => {
    setServerError("")
    try {
      await axiosClient.delete(`/users/${deleteModal.id}`)
      toast.success("User deleted successfully!")
      await fetchUsers()
      setDeleteModal({ id: null, open: false })
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response.data.message

        setServerError(message)
      } else {
        toast.error("Something went wrong!")
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center flex items-center justify-center disabled:bg-gray-700 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Delete"}
        </button>
        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
      </div>
    </form>
  )
}