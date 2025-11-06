import axiosClient from "@/axiosClient"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatScheduledDate } from "@/lib/formatter"
import {
  Book,
  Calendar,
  Check,
  Clock,
  Loader2,
  MoreVertical,
  User,
  UserCheck,
  Car,
  X,
  Badge,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useLoaderData } from "react-router-dom"
import { toast } from "react-toastify"
import BookingPagination from "./components/BookingPagination"
import AssignTechnicianModal from "./components/AssignTechnicianModal"
import RejectBookingModal from "./components/RejectBookingModal"
import ConfirmBookingModal from "./components/ConfirmBookingModal"
import ViewBookingModal from "./components/ViewBookingModal"
import GenerateQuoteModal from "./components/GenerateQuoteModal"

export async function loader() {
  const res = await axiosClient.get("/bookings")
  return res.data
}

export default function Booking() {
  const initialData = useLoaderData()
  const [data, setData] = useState(initialData) //mapping the data
  const [search, setSearch] = useState("") //search filter
  const [filter, setFilter] = useState("latest") //filters
  const [loading, setLoading] = useState(false) //loading state
  const [currentPage, setCurrentPage] = useState(1) //pagination
  const [statusFilter, setStatusFilter] = useState(null)
  const [assignTechnician, setAssignTechnician] = useState({
    open: false,
    booking: null,
  })
  const [rejectBooking, setRejectBooking] = useState({
    open: false,
    id: null,
  })
  const [confirmBooking, setConfirmBooking] = useState({
    open: false,
    id: null,
  })
  const [viewBooking, setViewBooking] = useState({ open: false, booking: null })
  const [quoteModal, setQuoteModal] = useState({ open: false, booking: null })
  console.log(data.data)

  //function to fetch filtered data
  const fetchBookings = async (
    searchTerm = "",
    sortBy = "",
    page = 1,
    status = ""
  ) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (sortBy) params.append("sort", sortBy)
      if (status) params.append("status", status)
      params.append("page", page.toString())
      const res = await axiosClient.get(`/bookings?${params.toString()}`)
      setData(res.data)
    } catch (error) {
      toast.error(`Error fetching services`, error)
    } finally {
      setLoading(false)
    }
  }
  //Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchBookings(search, filter, currentPage, statusFilter)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [search, filter, currentPage, statusFilter])

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filter, statusFilter])

  const bookFilters = [
    { value: "latest", label: "Latest" },
    { value: "oldest", label: "Oldest" },
    { value: "scheduled_latest", label: "Latest Schedules" },
    { value: "scheduled_oldest", label: "Oldest Schedules" },
    { value: "customer_name", label: "Customer Name" },
    { value: "service_name", label: "Service Name" },
  ]

  const isConsultation = (booking) => {
    if (!booking) return false
    // Defensive parse: servicePreferences may be a JSON string
    let bp = booking.servicePreferences
    try {
      if (typeof bp === 'string') bp = JSON.parse(bp)
    } catch (e) {
      bp = bp
    }
    if (bp && bp.bookingMode === 'consult') return true
    const name = (booking?.service?.name || booking?.pack?.name || "").toString()
    return /consult/i.test(name)
  }

  const statusFilters = [
    { value: null, label: "All Status" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "REJECTED", label: "Rejected" },
    { value: "CANCELLED", label: "Cancelled" },
  ]

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: " text-yellow-500 font-semibold ",
      CONFIRMED: " text-green-800 font-semibold",
      REJECTED: "text-red-800 font-semibold",
      CANCELLED: "text-gray-800 font-semibold",
    }

    return <p className={`${variants[status]}`}>{status}</p>
  }

  return (
    <>
      <main className="flex-1 p-10 border-t bg-gray-100/50 flex flex-col gap-10">
        <section className="flex items-center justify-between">
          <h1 className="text-xl lg:text-2xl flex items-center gap-2 font-bold">
            <Book />
            Bookings
          </h1>
        </section>
        <section className="flex-1 flex flex-col">
          <div className="flex items-center gap-5 max-[600px]:flex-col max-[600px]:items-start">
            <div className="flex flex-col">
              <label htmlFor="search">Search:</label>
              <input
                type="text"
                placeholder="Enter search..."
                className="border-1 border-black rounded-md bg-white py-1 px-2 "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="filter">Filter:</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="py-1 px-2 border-1 border-black rounded-md">
                  <SelectValue placeholder="Select a filter..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Filters</SelectLabel>
                    {bookFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="status">Status:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="py-1 px-2 border-1 border-black rounded-md min-w-[120px]">
                  <SelectValue placeholder="Select a status..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {statusFilters.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-1 flex flex-col">
            <Table className="mt-5">
              <TableHeader>
                <TableRow>
                  <TableHead className="max-[1470px]:hidden">ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="max-[1420px]:hidden">
                    Car Details
                  </TableHead>
                  <TableHead className="max-[1000px]:hidden">Service</TableHead>
                  <TableHead className="max-[1200px]:hidden">
                    Scheduled Date
                  </TableHead>
                  <TableHead className="max-[600px]:hidden">
                    {" "}
                    Technician
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <Loader2 className="animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : (
                  // Exclude consultation bookings from admin bookings list; consultations are handled on /admin/consultations
                  (data?.data || []).filter((b) => !isConsultation(b)).map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono max-[1470px]:hidden">
                        #{booking.id}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {booking.customer?.name}
                            </div>
                            <div className="text-sm text-gray-500 max-[600px]:hidden">
                              {booking.customer?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="max-[1420px]:hidden">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {booking.car?.plateNo}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.car?.brand} {booking.car?.model} (
                              {booking.car?.year})
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="max-[1000px]:hidden">
                          <div>
                            <div className="font-medium">
                              {booking.service?.name || booking.pack?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatCurrency(
                                booking.service?.cost || booking.pack?.price || 0
                              )}
                            </div>
                          </div>
                      </TableCell>

                      <TableCell className="max-[1200px]:hidden">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <div>
                              {formatScheduledDate(booking.scheduledAt)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(booking.scheduledAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="max-[600px]:hidden">
                        {booking.technician ? (
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-green-500" />
                            <span className="font-medium">
                              {booking.technician.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Not assigned</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell>{getStatusBadge(booking.status)}</TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <MoreVertical className="cursor-pointer w-4 h-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {booking.status === "PENDING" &&
                              !booking.technician && (
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() =>
                                    setAssignTechnician({ booking, open: true })
                                  }
                                >
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Assign Technician
                                </DropdownMenuItem>
                              )}
                            {booking.status === "PENDING" &&
                              booking.technician && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setConfirmBooking({
                                        id: booking.id,
                                        open: true,
                                      })
                                    }
                                    className="cursor-pointer text-green-600"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Confirm Booking
                                  </DropdownMenuItem>
                                </>
                              )}
                            {booking.status === "PENDING" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  setRejectBooking({
                                    id: booking.id,
                                    open: true,
                                  })
                                }
                                className="cursor-pointer text-red-600"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject Booking
                              </DropdownMenuItem>
                            )}
                            {booking.jobs.length > 0 &&
                              booking.jobs[0].stage === "COMPLETION" &&
                              !booking.quote?.status > 0 && (
                                <DropdownMenuItem
                                  className="cursor-pointer flex items-center justify-center"
                                  onClick={() =>
                                    setQuoteModal({ booking, open: true })
                                  }
                                >
                                  Generate Quote
                                </DropdownMenuItem>
                              )}

                            <DropdownMenuItem
                              className="cursor-pointer flex items-center justify-center"
                              onClick={() =>
                                setViewBooking({ booking, open: true })
                              }
                            >
                              View Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between mt-5 w-full">
              <p className="italic">
                Showing {data.data?.length || 0} of {data.count || 0} results
              </p>

              {data.totalPages > 1 && (
                <div>
                  <BookingPagination
                    data={data}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      {assignTechnician.open && (
        <AssignTechnicianModal
          assignTechnician={assignTechnician}
          setAssignTechnician={setAssignTechnician}
          fetchBookings={fetchBookings}
        />
      )}
      {rejectBooking.open && (
        <RejectBookingModal
          rejectBooking={rejectBooking}
          setRejectBooking={setRejectBooking}
          fetchBookings={fetchBookings}
        />
      )}
      {confirmBooking.open && (
        <ConfirmBookingModal
          confirmBooking={confirmBooking}
          setConfirmBooking={setConfirmBooking}
          fetchBookings={fetchBookings}
        />
      )}
      {viewBooking.open && (
        <ViewBookingModal
          viewBooking={viewBooking}
          setViewBooking={setViewBooking}
        />
      )}
      {quoteModal.open && (
        <GenerateQuoteModal
          quoteModal={quoteModal}
          setQuoteModal={setQuoteModal}
          fetchBookings={fetchBookings}
        />
      )}
    </>
  )
}