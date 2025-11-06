import { useForm } from "react-hook-form"
import { useState, useEffect } from "react"
import { LoaderCircle } from "lucide-react"
import { toast } from "react-toastify"
import axiosClient from "@/axiosClient"
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

export default function AssignTechnicianForm({
  setAssignTechnician,
  assignTechnician,
  fetchBookings,
}) {
  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
    reset,
  } = useForm()

  const [serverError, setServerError] = useState("")
  const [loadingData, setLoadingData] = useState(false)
  const [technicians, setTechnicians] = useState([])
  const [selectedTechs, setSelectedTechs] = useState([])
  const [assignedTechIds, setAssignedTechIds] = useState([])

  useEffect(() => {
    const fetchTechnician = async () => {
      setLoadingData(true)
      try {
        const resTechnician = await axiosClient.get("/users/technicians")
        setTechnicians(resTechnician.data.technicians)
        // fetch current booking assignments
        if (assignTechnician.booking?.id) {
          try {
            const resBooking = await axiosClient.get(`/bookings?search=&page=1&limit=1&sort=latest`)
            // Find booking in response (server returns list)
            const found = resBooking.data.data.find(b => b.id === assignTechnician.booking.id)
            if (found) {
              const ids = (found.bookingTechnicians || []).map(bt => bt.technician?.id).filter(Boolean)
              setAssignedTechIds(ids)
              // pre-select already assigned
              setSelectedTechs(ids)
            }
          } catch (e) {
            // ignore booking fetch errors
          }
        }
        setLoadingData(false)
      } catch (error) {
        setLoadingData(false)
        toast.error(
          `Error fetching data: ${
            error.response?.data?.message || error.message
          }`
        )
      }
    }

    fetchTechnician()
  }, [assignTechnician.booking])

  const onSubmit = async (data) => {
    setServerError("")
    try {
      const payload = { technicianIds: selectedTechs }
      console.debug('[AssignTechnician] sending payload', payload, 'for booking', assignTechnician.booking?.id)
      const res = await axiosClient.patch(
        `/bookings/${assignTechnician.booking.id}/assign`,
        payload
      )
      console.debug('[AssignTechnician] response', res && res.data)
      await fetchBookings()
      toast.success("Technician assigned successfully!")
      reset()
      setAssignTechnician({ booking: null, open: false })
    } catch (error) {
      console.debug('[AssignTechnician] error', error?.response || error)
      if (error.response?.status === 400) {
        const resp = error.response.data
        if (resp && resp.technicianId) {
          setServerError("Technician is not available (already assigned or active job)")
        } else if (typeof resp.message === "string") {
          setServerError(resp.message)
        } else {
          setServerError("Invalid request")
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
      {/* Technician Select → only if allowed */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Technicians (select one or more)
        </label>
        <div className="grid grid-cols-1 gap-2">
          {technicians.map((tech) => {
            const alreadyAssigned = assignedTechIds.includes(tech.id)
            const notAvailable = tech.available === false
            return (
              <label key={tech.id} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={selectedTechs.includes(tech.id)}
                  disabled={alreadyAssigned || notAvailable}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedTechs((s) => [...s, tech.id])
                    else setSelectedTechs((s) => s.filter((t) => t !== tech.id))
                  }}
                />
                <span>
                  {tech.name}
                  <span className="ml-2 text-sm">
                    {tech.available === false ? (
                      <span className="text-red-600">(Not available)</span>
                    ) : (
                      <span className="text-green-600">(Available)</span>
                    )}
                  </span>
                  {alreadyAssigned && (
                    <span className="ml-2 text-xs text-blue-600">(already assigned)</span>
                  )}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 rounded-lg px-5 py-2.5 flex items-center justify-center"
        >
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Assign"}
        </button>
        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
      </div>
    </form>
  )
}
