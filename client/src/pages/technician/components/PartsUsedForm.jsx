import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { LoaderCircle, Plus, Trash2, Package } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"

export default function PartsUsedForm({
  setShowCompletionModal,
  fetchJobs,
  showCompletionModal,
  setCurrentStage,
}) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitting, errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      partsUsed: [{ partId: "", quantity: 1 }],
    },
  })

  const [serverError, setServerError] = useState("")
  const [loadingData, setLoadingData] = useState(false)
  const [parts, setParts] = useState([])
  const [selectedParts, setSelectedParts] = useState([
    { partId: "", quantity: 1 },
  ])

  // Watch for form changes
  const watchedParts = watch("partsUsed")

  // Fetch parts data
  useEffect(() => {
    setLoadingData(true)
    const fetchParts = async () => {
      try {
        const resParts = await axiosClient.get("/parts/all")
        setParts(resParts.data.parts)
        console.log(resParts.data)
        setLoadingData(false)
      } catch (error) {
        setLoadingData(false)
        toast.error(
          `Error fetching parts: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    }
    if (showCompletionModal.job) {
      fetchParts()
    }
  }, [showCompletionModal.job])

  // Add new part row
  const addPartRow = () => {
    const newParts = [...selectedParts, { partId: "", quantity: 1 }]
    setSelectedParts(newParts)
    setValue("partsUsed", newParts)
  }

  // Remove part row
  const removePartRow = (index) => {
    if (selectedParts.length > 1) {
      const newParts = selectedParts.filter((_, i) => i !== index)
      setSelectedParts(newParts)
      setValue("partsUsed", newParts)
    }
  }

  // Update part selection
  const updatePart = (index, field, value) => {
    const newParts = [...selectedParts]
    newParts[index] = { ...newParts[index], [field]: value }
    setSelectedParts(newParts)
    setValue("partsUsed", newParts)
  }

  // Get available stock for a part
  const getPartStock = (partId) => {
    const part = parts.find((p) => p.id === parseInt(partId))
    return part ? part.stock : 0
  }

  // Get part name
  const getPartName = (partId) => {
    const part = parts.find((p) => p.id === parseInt(partId))
    return part ? part.name : ""
  }

  // Validate if part is already selected
  const isPartAlreadySelected = (partId, currentIndex) => {
    return selectedParts.some(
      (part, index) =>
        part.partId === partId && index !== currentIndex && partId !== ""
    )
  }

  const onSubmit = async (data) => {
    setServerError("")

    // Filter out empty parts and validate
    const validParts = data.partsUsed.filter((part) => part.partId !== "")

    if (validParts.length === 0) {
      setServerError("Please select at least one part")
      return
    }

    // Validate quantities and stock
    for (let i = 0; i < validParts.length; i++) {
      const part = validParts[i]
      const availableStock = getPartStock(part.partId)

      if (parseInt(part.quantity) > availableStock) {
        setServerError(
          `Not enough stock for ${getPartName(
            part.partId
          )}. Available: ${availableStock}`
        )
        return
      }

      if (parseInt(part.quantity) <= 0) {
        setServerError("Quantity must be greater than 0")
        return
      }
    }

    try {
      // Convert partId to numbers and quantities to integers
      const partsPayload = validParts.map((part) => ({
        partId: parseInt(part.partId),
        quantity: parseInt(part.quantity),
      }))

      await axiosClient.post(`/jobs/${showCompletionModal.job.id}/complete`, {
        parts: partsPayload,
      })

      toast.success("Job completed successfully!")
      reset()
      setCurrentStage("COMPLETION")
      await fetchJobs()
      setShowCompletionModal({ job: null, open: false })
    } catch (error) {
      if (error.response?.status === 400) {
        const message = error.response.data.message || error.response.data.error

        if (typeof message === "object") {
          Object.entries(message).forEach(([field, msgs]) => {
            setError(field, { type: "server", message: msgs[0] })
          })
        } else {
          setServerError(message)
        }
      } else {
        console.error(error)
        toast.error("Something went wrong!")
      }
    }
  }

  // Show loading state while fetching data
  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoaderCircle className="animate-spin w-6 h-6" />
        <span className="ml-2">Loading parts...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Package className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Parts Used</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Parts Selection */}
        <div className="space-y-3">
          {selectedParts.map((selectedPart, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
            >
              {/* Part Selection */}
              <div className="flex-1">
                <select
                  {...register(`partsUsed.${index}.partId`)}
                  value={selectedPart.partId}
                  onChange={(e) => updatePart(index, "partId", e.target.value)}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                >
                  <option value="">Select a part...</option>
                  {parts.map((part) => (
                    <option
                      key={part.id}
                      value={part.id}
                      disabled={isPartAlreadySelected(
                        part.id.toString(),
                        index
                      )}
                    >
                      {part.name} (Stock: {part.stock})
                    </option>
                  ))}
                </select>
                {isPartAlreadySelected(selectedPart.partId, index) && (
                  <p className="text-xs text-red-500 mt-1">
                    Part already selected
                  </p>
                )}
              </div>

              {/* Quantity Input */}
              <div className="w-24">
                <input
                  {...register(`partsUsed.${index}.quantity`)}
                  type="number"
                  min="1"
                  max={
                    selectedPart.partId
                      ? getPartStock(selectedPart.partId)
                      : 999
                  }
                  value={selectedPart.quantity}
                  onChange={(e) =>
                    updatePart(index, "quantity", e.target.value)
                  }
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 text-center"
                  placeholder="Qty"
                />
              </div>

              {/* Stock Info */}
              {selectedPart.partId && (
                <div className="text-xs text-gray-500 w-16">
                  Stock: {getPartStock(selectedPart.partId)}
                </div>
              )}

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removePartRow(index)}
                disabled={selectedParts.length === 1}
                className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Part Button */}
        <button
          type="button"
          onClick={addPartRow}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <Plus className="w-4 h-4" />
          <span>Add another part</span>
        </button>

        {/* Error Display */}
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{serverError}</p>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={() => setShowCompletionModal({ job: null, open: false })}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg px-4 py-2 text-center flex items-center justify-center disabled:bg-green-700 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="animate-spin w-4 h-4 mr-2" />
                Completing Job...
              </>
            ) : (
              "Complete Job"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}