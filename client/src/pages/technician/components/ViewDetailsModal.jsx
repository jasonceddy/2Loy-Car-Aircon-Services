import {
  X,
  User,
  Car,
  Clock,
  Package,
  FileText,
  Wrench,
  CheckCircle,
} from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/formatter"

export default function ViewDetailsModal({ job, onClose }) {
  const booking = job?.booking || {}
  const isConsult = (() => {
    if (!booking) return false
    if (booking.bookingMode === 'consult' || booking.isConsult) return true
    try {
      const spRaw = booking.servicePreferences
      if (spRaw) {
        const spStr = typeof spRaw === 'string' ? spRaw : JSON.stringify(spRaw)
        if (spStr && spStr.toLowerCase().includes('consult')) return true
      }
    } catch (e) {}
    const fields = [booking.serviceType, booking.service?.name, booking.pack?.name]
    return fields.some((f) => (f || '').toString().toLowerCase().includes('consult'))
  })()
  const stages = [
    { key: "DIAGNOSTIC", label: "Diagnostic", icon: "🔍" },
    { key: "REPAIR", label: "Repair", icon: "🔧" },
    { key: "TESTING", label: "Testing", icon: "✅" },
    { key: "COMPLETION", label: "Complete", icon: "🎉" },
  ]

  const currentStageIndex = stages.findIndex((s) => s.key === job.stage)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-6 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Job Details #{job.id}</h2>
              <p className="text-gray-200 text-sm">
                Last updated: {formatDateTime(job.updatedAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Customer & Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  Customer Information
                </h3>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {job.booking.customer.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {job.booking.customer.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {job.booking.customer.phone}
                </p>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Car className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  Vehicle Information
                </h3>
              </div>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Plate No:</span>{" "}
                  {job.booking.car.plateNo}
                </p>
                <p>
                  <span className="font-medium">Make & Model:</span>{" "}
                  {job.booking.car.brand} {job.booking.car.model}
                </p>
                <p>
                  <span className="font-medium">Year:</span>{" "}
                  {job.booking.car.year}
                </p>
              </div>
            </div>
          </div>

          {/* Service & Schedule Info */}
          {!isConsult && (
            <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Service Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-medium">Service:</span>{" "}
                  {job.booking.service?.name || job.booking.pack?.name || "Package"}
                </p>
                <p>
                  <span className="font-medium">Cost:</span>{" "}
                  {formatCurrency(job.booking.service?.cost || job.booking.pack?.price || 0)}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-medium">Scheduled:</span>{" "}
                  {formatDateTime(job.booking.scheduledAt)}
                </p>
                {job.booking.technician && (
                  <p>
                    <span className="font-medium">Technician:</span>{" "}
                    {job.booking.technician.name}
                  </p>
                )}
              </div>
            </div>
            </div>
          )}

          {/* Progress Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Job Progress</h3>
            </div>
            <div className="flex items-center justify-between">
              {stages.map((stage, index) => (
                <div
                  key={stage.key}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                      index <= currentStageIndex
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {index <= currentStageIndex ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <span>{stage.icon}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm mt-2 font-medium ${
                      index <= currentStageIndex
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    {stage.label}
                  </span>
                  {index === currentStageIndex && (
                    <span className="text-xs text-blue-600 mt-1">Current</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Parts Used - Only show if parts exist */}
          {job.partsUsed && job.partsUsed.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Parts Used</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg overflow-hidden">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Part Name
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Quantity Used
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {job.partsUsed.map((partUsed) => (
                      <tr key={partUsed.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {partUsed.part.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {partUsed.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Job Notes - Only show if notes exist */}
          {job.notes && job.notes.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  Job Notes ({job.notes.length})
                </h3>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {job.notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white p-3 rounded-lg border border-gray-200"
                  >
                    <p className="text-sm text-gray-800 mb-2">{note.content}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span className="font-medium">{note.author.name}</span>
                      <span>{formatDateTime(note.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty States */}
          {(!job.partsUsed || job.partsUsed.length === 0) &&
            (!job.notes || job.notes.length === 0) && (
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  No parts used or notes recorded for this job yet.
                </p>
              </div>
            )}
        </div>

        {/* Footer - Fixed */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}