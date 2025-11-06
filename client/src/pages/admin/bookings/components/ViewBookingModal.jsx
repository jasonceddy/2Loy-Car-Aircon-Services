import { formatCurrency } from "@/lib/formatter"
import {
  BadgeX,
  Briefcase,
  Car,
  Pickaxe,
  User,
  UserCheck,
  XCircle,
} from "lucide-react"

export default function ViewBookingModal({ viewBooking, setViewBooking }) {
  console.log(viewBooking)

  const booking = viewBooking?.booking || {}
  const isConsult = (() => {
    if (!booking) return false
    // direct flags
    if (booking.bookingMode === 'consult' || booking.isConsult) return true
    // servicePreferences may be object or string; check string form
    try {
      const spRaw = booking.servicePreferences
      if (spRaw) {
        const spStr = typeof spRaw === 'string' ? spRaw : JSON.stringify(spRaw)
        if (spStr && spStr.toLowerCase().includes('consult')) return true
      }
    } catch (e) {
      // ignore
    }
    const fields = [booking.serviceType, booking.service?.name, booking.pack?.name]
    return fields.some((f) => (f || '').toString().toLowerCase().includes('consult'))
  })()

  return (
    <div className="fixed inset-0 h-full w-full flex flex-items bg-black/20 justify-center  z-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 flex-1">
        <div className="w-full bg-white rounded-lg shadow border border-black md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl flex items-center gap-1">
                Details - {viewBooking.booking.status}
              </h1>
              <XCircle
                className="cursor-pointer"
                onClick={() => setViewBooking({ booking: null, open: false })}
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold flex items-center gap-1">
                <User />
                Customer:
              </h2>
              <p>Name: {viewBooking.booking.customer.name}</p>
              <p>Email: {viewBooking.booking.customer.email}</p>
              <p>Phone: {viewBooking.booking.customer.phone}</p>
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold flex items-center gap-1">
                <Car />
                Car:
              </h2>
              <p>Plate No: {viewBooking.booking.car.plateNo}</p>
              <p>Brand: {viewBooking.booking.car.brand}</p>
              <p>Model: {viewBooking.booking.car.model}</p>
              <p>Year: {viewBooking.booking.car.year}</p>
              <p>Notes: {viewBooking.booking.car.notes}</p>
            </div>
            {!isConsult && (
              <div className="flex flex-col">
                <h2 className="text-lg font-bold flex items-center gap-1">
                  <Pickaxe />
                  Service:
                </h2>
                <p>Name: {viewBooking.booking.service?.name || viewBooking.booking.pack?.name || "Package"}</p>
                <p>Description: {viewBooking.booking.service?.description || viewBooking.booking.pack?.description || "Package booking"}</p>
                <p>Cost: {formatCurrency(viewBooking.booking.service?.cost || viewBooking.booking.pack?.price || 0)}</p>
              </div>
            )}
            {viewBooking.booking.rejectReason && (
              <div className="flex flex-col">
                <h2 className="text-lg font-bold flex items-center gap-1">
                  <BadgeX />
                  Rejection:
                </h2>
                <p>Reason: {viewBooking.booking.rejectReason}</p>
              </div>
            )}
            {viewBooking.booking.changeRequests && viewBooking.booking.changeRequests.length > 0 && (
              <div className="flex flex-col">
                <h2 className="text-lg font-bold flex items-center gap-1">
                  Change Requests
                </h2>
                <div className="text-sm text-gray-700 mt-2">
                  {viewBooking.booking.changeRequests.map((r) => (
                    <div key={r.id} className="mb-2">
                      <div>{new Date(r.requestedAt).toLocaleString()} — {r.status}</div>
                      <div className="text-sm text-gray-500">Requested by: {r.requester?.name}</div>
                      {r.reason && <div className="text-sm text-gray-500">Reason: {r.reason}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col">
              <h2 className="text-lg font-bold flex items-center gap-1">
                <UserCheck />
                Assigned Technician:{" "}
                {viewBooking.booking.technicianId
                  ? viewBooking.booking.technician?.name
                  : "Nothing assigned"}
              </h2>
            </div>
            {viewBooking.booking.jobs.length > 0 && (
              <div className="flex flex-col">
                <h2 className="text-lg font-bold flex items-center gap-1">
                  <Briefcase />
                  Job Stage: {viewBooking.booking.jobs[0].stage}
                </h2>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
