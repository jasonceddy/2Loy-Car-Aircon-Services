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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export default function BookingForm({ setBookModal, bookModal }) {
  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm()

  const [serverError, setServerError] = useState("")
  const [loadingData, setLoadingData] = useState(false)
  const [services, setServices] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState("")
  const [timeError, setTimeError] = useState("")

  const selectedServiceId = watch("serviceId")
  const selectedService = services.find(
    (s) => s.id === parseInt(selectedServiceId)
  )

  useEffect(() => {
    const fetchServiceAndTechnician = async () => {
      setLoadingData(true)
      try {
        const resService = await axiosClient.get("/services")
        const resTechnician = await axiosClient.get("/users/technicians")

        setServices(resService.data.data)
        setTechnicians(resTechnician.data)
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

    fetchServiceAndTechnician()
  }, [bookModal.car])

    const validateSchedule = (scheduledAt) => {
      const now = new Date()
      if (scheduledAt < now) return { ok: false, message: "Cannot select past date/time" }

      const hours = scheduledAt.getHours()
      const minutes = scheduledAt.getMinutes()

      if (hours < 8) return { ok: false, message: "Bookings start at 8:00 AM" }
      if (hours > 17) return { ok: false, message: "Bookings must end by 5:00 PM" }
      if (hours === 17 && minutes > 0)
        return { ok: false, message: "Bookings must end by 5:00 PM" }

      return { ok: true }
    }

    const onSubmit = async (data) => {
    setServerError("")
    try {
      if (!selectedDate || !selectedTime) {
        setServerError("Please select both date and time.")
        return
      }

      // combine date + time into one Date object
      const [hours, minutes] = selectedTime.split(":")
      const scheduledAt = new Date(selectedDate)
        scheduledAt.setHours(parseInt(hours, 10))
        scheduledAt.setMinutes(parseInt(minutes, 10))
      scheduledAt.setSeconds(0)

        const validation = validateSchedule(scheduledAt)
        if (!validation.ok) {
          setServerError(validation.message)
          return
        }

      await axiosClient.post(`/bookings`, {
        carId: bookModal.car.id, // taken directly from modal car
        serviceId: parseInt(data.serviceId),
        technicianId: data.technicianId
          ? parseInt(data.technicianId)
          : undefined,
        scheduledAt: scheduledAt.toISOString(),
      })

      toast.success("Booked successfully!")
      reset()
      setBookModal({ car: null, open: false })
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
      {/* Service Select */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Service
        </label>
        <Select onValueChange={(val) => setValue("serviceId", val)}>
          <SelectTrigger className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600  w-full">
            <SelectValue placeholder="Select Service..." />
          </SelectTrigger>
          <SelectContent className="max-h-100">
            {services.map((service) => (
              <SelectItem key={service.id} value={service.id.toString()}>
                {service.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Technician Select → only if allowed */}
      {selectedService?.allowCustomerTechChoice && (
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Technician
          </label>
          <Select onValueChange={(val) => setValue("technicianId", val)}>
            <SelectTrigger className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600  w-full">
              <SelectValue placeholder="Select Technician..." />
            </SelectTrigger>
            <SelectContent>
              {technicians.technicians.map((tech) => (
                <SelectItem key={tech.id} value={tech.id.toString()}>
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Calendar (date) */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Date
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => setSelectedDate(date)}
              disabled={(date) => {
                const today = new Date()
                // zero out time for comparison
                today.setHours(0, 0, 0, 0)
                const d = new Date(date)
                d.setHours(0, 0, 0, 0)
                return d < today
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Time Picker */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Time
        </label>
        <input
          type="time"
          min="08:00"
          max="17:00"
          value={selectedTime}
          onChange={(e) => {
            setSelectedTime(e.target.value)
            // basic inline validation
            if (!selectedDate) {
              setTimeError("Please select a date first")
              return
            }
            const [h, m] = e.target.value.split(":").map((v) => parseInt(v, 10))
            const sched = new Date(selectedDate)
            sched.setHours(h, m, 0, 0)
            const res = validateSchedule(sched)
            setTimeError(res.ok ? "" : res.message)
          }}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:ring-primary-600 focus:border-primary-600"
        />
        {timeError && <p className="text-sm mt-1 text-red-600">{timeError}</p>}
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer w-full text-white bg-gray-600 hover:bg-gray-700 rounded-lg px-5 py-2.5 flex items-center justify-center"
        >
          {isSubmitting ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            "Book Now"
          )}
        </button>
        {serverError && (
          <p className="text-sm mt-1 text-red-600">{serverError}</p>
        )}
      </div>
    </form>
  )
}