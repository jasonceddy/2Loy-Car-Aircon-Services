import { useForm, Controller } from "react-hook-form"
import { useState, useEffect } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

export default function PartForm({ setModal, fetchParts, modal }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    reset,
    setValue,
    control,
  } = useForm()

  const [serverError, setServerError] = useState("")
  const [loadingData, setLoadingData] = useState(false)

  // Load existing data when editing
  useEffect(() => {
    setLoadingData(true)

    if (modal.part) {
      setValue("name", modal.part.name)
      setValue("threshold", modal.part.threshold.toString())
      setValue("price", (modal.part.price ?? 0).toString())
      setValue("uom", modal.part.uom || "pc")
      setValue("serialNumber", modal.part.serialNumber || "")

      setLoadingData(false)
    } else {
      reset()
      setValue("uom", "pc")
      setLoadingData(false)
    }
  }, [modal.part, setValue, reset])

  const onSubmit = async (data) => {
    setServerError("")
    try {
      if (modal.part) {
        // UPDATE
        await axiosClient.patch(`/parts/${modal.part.id}`, data)
        toast.success("Part updated successfully!")
      } else {
        // CREATE
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

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderCircle className="animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">

      {/* NAME */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Name
        </label>
        <input
          {...register("name")}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 w-full"
          placeholder="Enter part name..."
          required
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      {/* STOCK (CREATE ONLY) */}
      {!modal.part && (
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Stock
          </label>
          <input
            {...register("stock")}
            type="number"
            className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 w-full"
            placeholder="Enter stock..."
            required
          />
          {errors.stock && (
            <p className="mt-2 text-sm text-red-600">{errors.stock.message}</p>
          )}
        </div>
      )}

      {/* PRICE */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Price
        </label>
        <input
          {...register("price")}
          type="number"
          step="0.01"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 w-full"
          placeholder="Enter part price..."
          required
        />
        {errors.price && (
          <p className="mt-2 text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      {/* UOM DROPDOWN */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Unit of Measurement (UoM)
        </label>

        <Controller
          name="uom"
          control={control}
          defaultValue="pc"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="pc">pc (piece)</SelectItem>
                <SelectItem value="set">set</SelectItem>
                <SelectItem value="bottle">bottle</SelectItem>
                <SelectItem value="can">can</SelectItem>
                <SelectItem value="meter">meter</SelectItem>
                <SelectItem value="roll">roll</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        {errors.uom && (
          <p className="mt-2 text-sm text-red-600">{errors.uom.message}</p>
        )}
      </div>

      {/* SERIAL NUMBER */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Serial Number (Optional)
        </label>
        <input
          {...register("serialNumber")}
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 w-full"
          placeholder="Enter serial number..."
        />
        {errors.serialNumber && (
          <p className="mt-2 text-sm text-red-600">
            {errors.serialNumber.message}
          </p>
        )}
      </div>

      {/* THRESHOLD */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Threshold
        </label>
        <input
          {...register("threshold")}
          type="number"
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 w-full"
          placeholder="Enter threshold..."
          required
        />
        {errors.threshold && (
          <p className="mt-2 text-sm text-red-600">{errors.threshold.message}</p>
        )}
      </div>

      {/* BUTTON */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full text-white bg-gray-600 hover:bg-gray-700 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center disabled:bg-gray-700"
        >
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" />
          ) : modal.part ? (
            "Update"
          ) : (
            "Save"
          )}
        </button>

        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
      </div>
    </form>
  )
}

