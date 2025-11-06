import { useState } from "react"
import {
  Car,
  Clock,
  User,
  FileText,
  ChevronRight,
  Plus,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/formatter"
import axiosClient from "@/axiosClient"
import { toast } from "react-toastify"
import { useForm } from "react-hook-form"
import PartsUsedModal from "./PartsUsedModal"
import ViewDetailsModal from "./ViewDetailsModal"

export default function TechnicianJobCard({ job, fetchJobs }) {
  const {
    register,
    reset,
    formState: { isSubmitting, errors },
    handleSubmit,
  } = useForm()
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [currentStage, setCurrentStage] = useState(job.stage)
  const [serverError, setServerError] = useState("")
  const [showCompletionModal, setShowCompletionModal] = useState({
    open: false,
    job: null,
  })
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const stages = [
    { key: "DIAGNOSTIC", label: "Diagnostic", icon: "🔍" },
    { key: "REPAIR", label: "Repair", icon: "🔧" },
    { key: "TESTING", label: "Testing", icon: "✅" },
    { key: "COMPLETION", label: "Complete", icon: "🎉" },
  ]

  const currentStageIndex = stages.findIndex((s) => s.key === currentStage)

  // servicePreferences may be stored as JSON or as an object. Parse defensively.
  let bookingPreferences = job?.booking?.servicePreferences
  try {
    if (typeof bookingPreferences === 'string') {
      bookingPreferences = JSON.parse(bookingPreferences)
    }
  } catch (e) {
    // ignore parse errors and treat as non-consult
    bookingPreferences = bookingPreferences
  }

  const isConsult = (bookingPreferences && bookingPreferences.bookingMode === 'consult') || /consult/i.test((job?.booking?.service?.name || job?.booking?.pack?.name || '').toString())

  // Modified handleStageUpdate function
  const handleStageUpdate = async (newStage) => {
    // If COMPLETION is selected, show modal instead of updating
    if (newStage === "COMPLETION") {
      setShowCompletionModal((prev) => ({ ...prev, open: true, job }))
      return // Don't proceed with the API call
    }

    // For other stages, proceed normally
    try {
      const res = await axiosClient.patch(`/jobs/${job.id}/stage`, {
        stage: newStage,
      })
      setCurrentStage(newStage)
      toast.success("Job stage updated successfully!")
    } catch (error) {
      toast.error("Something went wrong!")
    }
  }

  const handleConfirmConsultation = async () => {
    try {
      // For consultations, completing the job is a simple POST to /jobs/:id/complete
      await axiosClient.post(`/jobs/${job.id}/complete`, { parts: [] })
      setCurrentStage("COMPLETION")
      toast.success("Consultation confirmed and completed")
      // refresh parent list
      if (typeof fetchJobs === 'function') await fetchJobs()
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || "Failed to complete consultation")
    }
  }

  const onSubmit = async (data) => {
    setServerError("")
    try {
      await axiosClient.post(`/jobs/${job.id}/notes`, data)
      toast.success("JobNote created successfully!")

      reset()
      await fetchJobs()
      setShowNoteForm(false)
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
        console.log(error)
        toast.error("Something went wrong!")
      }
    }
  }

  return (
    <>
      <div className="  bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <div>
                <h3 className="font-semibold text-lg">
                  {job.booking.customer.name}
                </h3>
                <p className="text-blue-100 text-sm">
                  {job.booking.customer.email} • {job.booking.customer.phone}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 px-2 py-1 rounded text-sm">
                #{job.id}
              </div>
            </div>
          </div>

              <div className="flex items-center space-x-2 mt-2">
            <Car className="w-4 h-4" />
            <span className="text-sm">
              {job.booking.car.plateNo}  {job.booking.car.brand}{" "}
              {job.booking.car.model} {job.booking.car.year}
            </span>
          </div>
        </div>

        {/* Service & Schedule Info */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium text-gray-900">
                {job.booking.service?.name || job.booking.pack?.name || "Package"}
              </h4>
              <p className="text-sm text-gray-600">
                {isConsult ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-sm">Consultation</span>
                ) : (
                  formatCurrency(job.booking.service?.cost || job.booking.pack?.price || 0)
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {formatDateTime(job.booking.scheduledAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="p-4 border-b border-gray-100">
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
          </div>
          <div className="flex items-center justify-between">
            {isConsult ? (
              (() => {
                const steps = ["Requested", "In Progress", "Completed"]
                let current = 0
                if (job.booking.status === "PENDING") current = 0
                else if (job.booking.status === "CONFIRMED") {
                  const hasCompletion = job.notes?.some((n) => n.stage === "COMPLETION") || job.stage === "COMPLETION"
                  current = hasCompletion ? 2 : 1
                }
                return (
                  <div className="flex items-center gap-6 w-full">
                    {steps.map((label, idx) => (
                      <div key={label} className="flex flex-col items-center flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${idx <= current ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {idx === 2 ? <CheckCircle className="w-4 h-4" /> : idx === 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <span className={`text-xs mt-1 ${idx <= current ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
                      </div>
                    ))}
                  </div>
                )
              })()
            ) : (
              stages.map((stage, index) => (
                <div
                  key={stage.key}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      index <= currentStageIndex
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {index <= currentStageIndex ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span>{stage.icon}</span>
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      index <= currentStageIndex
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Recent Notes
            </span>
            <FileText className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {job.notes
              .slice(-5)
              .reverse()
              .map((note) => (
                <div key={note.id} className="bg-gray-50 p-2 rounded-lg">
                  <p className="text-sm text-gray-800">{note.content}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">
                      {note.author.name}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDateTime(note.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Add Note Form */}
        {showNoteForm && (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <form onSubmit={handleSubmit(onSubmit)}>
              <textarea
                {...register("content")}
                placeholder="Add a note about this job..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
              />
              {errors.content && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.content.message}
                </p>
              )}
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => setShowNoteForm(false)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Add Note
                </button>
                {serverError && (
                  <p className="text-sm mt-1 text-red-600">{serverError}</p>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Update Stage Button */}
            {job.stage !== "COMPLETION" && (
              isConsult ? (
                <button
                  onClick={handleConfirmConsultation}
                  className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Confirm Consultation
                </button>
              ) : (
                <div className="relative">
                  <select
                    value={currentStage}
                    onChange={(e) => handleStageUpdate(e.target.value)}
                    className="w-full bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    {stages.map((stage) => (
                      <option
                        key={stage.key}
                        value={stage.key}
                        className="bg-white text-gray-900"
                      >
                        {stage.icon} {stage.label}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                </div>
              )
            )}

            {/* Add Note Button */}
            {job.stage !== "COMPLETION" && (
              <button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="flex items-center justify-center space-x-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
              >
                <Plus className="w-4 h-4" />
                <span>Add Note</span>
              </button>
            )}
          </div>

          {/* View Details Button */}
          <button
            onClick={() => setShowDetailsModal(true)}
            className="w-full mt-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
          >
            View Full Details
          </button>
        </div>
      </div>
      {showCompletionModal.open && (
        <PartsUsedModal
          fetchJobs={fetchJobs}
          showCompletionModal={showCompletionModal}
          setShowCompletionModal={setShowCompletionModal}
          setCurrentStage={setCurrentStage}
        />
      )}
      {showDetailsModal && (
        <ViewDetailsModal
          job={job}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </>
  )
}