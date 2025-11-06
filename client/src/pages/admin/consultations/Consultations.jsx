import {
  Book,
  Calendar,
  Loader2,
  User,
  UserCheck,
  Car,
  Clock,
  MoreVertical,
  Check,
  X,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import React, { useEffect, useState } from 'react'
import axiosClient from '@/axiosClient'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from '@/components/ui/select'
import { toast } from 'react-toastify'
import AssignTechnicianModal from '@/pages/admin/bookings/components/AssignTechnicianModal'
import ViewBookingModal from '@/pages/admin/bookings/components/ViewBookingModal'
import RejectBookingModal from '@/pages/admin/bookings/components/RejectBookingModal'
import ConfirmBookingModal from '@/pages/admin/bookings/components/ConfirmBookingModal'

export default function Consultations() {
  const [data, setData] = useState({ data: [], count: 0, totalPages: 0 })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('latest')
  const [statusFilter, setStatusFilter] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const [assignTechnician, setAssignTechnician] = useState({ open: false, booking: null })
  const [viewBooking, setViewBooking] = useState({ open: false, booking: null })
  const [rejectBooking, setRejectBooking] = useState({ open: false, id: null })
  const [confirmBooking, setConfirmBooking] = useState({ open: false, id: null })

  const fetchBookings = async (searchTerm = '', sortBy = 'latest', page = 1, status = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (sortBy) params.append('sort', sortBy)
      if (status) params.append('status', status)
      params.append('page', page.toString())
      const res = await axiosClient.get(`/bookings?${params.toString()}`)
      // filter consultation bookings
      const all = res.data.data || []
      const consults = all.filter(b => (b.servicePreferences && b.servicePreferences.bookingMode === 'consult') || (b.serviceType && b.serviceType.toLowerCase().includes('consult')))
      setData({ ...res.data, data: consults, count: consults.length, totalPages: 1 })
    } catch (err) {
      console.error(err)
      toast.error('Failed to load consultations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings(search, filter, currentPage, statusFilter) }, [search, filter, currentPage, statusFilter])

  const bookFilters = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'scheduled_latest', label: 'Latest Schedules' },
    { value: 'scheduled_oldest', label: 'Oldest Schedules' },
    { value: 'customer_name', label: 'Customer Name' },
    { value: 'service_name', label: 'Service Name' },
  ]

  const statusFilters = [
    { value: null, label: 'All Status' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ]

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: ' text-yellow-500 font-semibold ',
      CONFIRMED: ' text-green-800 font-semibold',
      REJECTED: 'text-red-800 font-semibold',
      CANCELLED: 'text-gray-800 font-semibold',
    }
    return <p className={`${variants[status]}`}>{status}</p>
  }

  return (
    <main className="flex-1 p-10 border-t bg-gray-100/50 flex flex-col gap-10">
      <section className="flex items-center justify-between">
        <h1 className="text-xl lg:text-2xl flex items-center gap-2 font-bold"><Book /> Consultations</h1>
      </section>
      <section className="flex-1 flex flex-col">
        <div className="flex items-center gap-5 max-[600px]:flex-col max-[600px]:items-start">
          <div className="flex flex-col">
            <label>Search:</label>
            <input type="text" placeholder="Enter search..." className="border-1 border-black rounded-md bg-white py-1 px-2 " value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex flex-col">
            <label>Filter:</label>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="py-1 px-2 border-1 border-black rounded-md">
                <SelectValue placeholder="Select a filter..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Filters</SelectLabel>
                  {bookFilters.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <label>Status:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="py-1 px-2 border-1 border-black rounded-md min-w-[120px]">
                <SelectValue placeholder="Select a status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {statusFilters.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
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
                <TableHead className="max-[1420px]:hidden">Car Details</TableHead>
                {/* Service column removed for consultations */}
                <TableHead className="max-[1200px]:hidden">Scheduled Date</TableHead>
                <TableHead className="max-[600px]:hidden">Technician</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center"><Loader2 className="animate-spin" /></TableCell>
                </TableRow>
              ) : (
                data.data.map(booking => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono max-[1470px]:hidden">#{booking.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{booking.customer?.name}</div>
                          <div className="text-sm text-gray-500 max-[600px]:hidden">{booking.customer?.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-[1420px]:hidden">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="font-medium">{booking.car?.plateNo}</div>
                          <div className="text-sm text-gray-500">{booking.car?.brand} {booking.car?.model} ({booking.car?.year})</div>
                        </div>
                      </div>
                    </TableCell>
                    {/* Service removed for consultation rows */}
                    <TableCell className="max-[1200px]:hidden">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <div>{new Date(booking.scheduledAt).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500">{new Date(booking.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-[600px]:hidden">
                      {booking.technician ? (
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{booking.technician.name}</span>
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
                          {booking.status === 'PENDING' && !booking.technician && (
                            <DropdownMenuItem onClick={() => setAssignTechnician({ booking, open: true })}>
                              <UserCheck className="w-4 h-4 mr-2" /> Assign Technician
                            </DropdownMenuItem>
                          )}
                          {booking.status === 'PENDING' && (
                            <DropdownMenuItem onClick={() => setConfirmBooking({ id: booking.id, open: true })} className="cursor-pointer text-green-600">
                              <Check className="w-4 h-4 mr-2" /> Confirm Consultation
                            </DropdownMenuItem>
                          )}
                          {booking.status === 'PENDING' && (
                            <DropdownMenuItem onClick={() => setRejectBooking({ id: booking.id, open: true })} className="text-red-600">
                              <X className="w-4 h-4 mr-2" /> Reject Consultation
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setViewBooking({ booking, open: true })}>
                            <Book className="w-4 h-4 mr-2" /> View Details
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
            <p className="italic">Showing {data.data?.length || 0} of {data.count || 0} results</p>
          </div>
        </div>
      </section>

      {assignTechnician.open && (
        <AssignTechnicianModal
          assignTechnician={assignTechnician}
          setAssignTechnician={setAssignTechnician}
          fetchBookings={() => fetchBookings(search, filter, currentPage, statusFilter)}
        />
      )}

      {rejectBooking.open && (
        <RejectBookingModal
          rejectBooking={rejectBooking}
          setRejectBooking={setRejectBooking}
          fetchBookings={() => fetchBookings(search, filter, currentPage, statusFilter)}
        />
      )}

      {confirmBooking.open && (
        <ConfirmBookingModal
          confirmBooking={confirmBooking}
          setConfirmBooking={setConfirmBooking}
          fetchBookings={() => fetchBookings(search, filter, currentPage, statusFilter)}
          onConfirmed={() => {
            // navigate to tech dashboard after confirming a consultation
            window.location.href = '/tech'
          }}
        />
      )}

      {viewBooking.open && (
        <ViewBookingModal viewBooking={viewBooking} setViewBooking={setViewBooking} />
      )}
    </main>
  )
}
