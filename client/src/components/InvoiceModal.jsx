import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Download, Printer, FileText } from "lucide-react"
import { formatCurrency, formatDateTime } from "@/lib/formatter"

export default function InvoiceModal({ booking, onClose }) {
  const { quote, customer, car, service, technician, scheduledAt, createdAt } =
    booking
  const { billing } = quote

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    // Implement PDF generation logic here
    console.log("Generating PDF...")
    // You can use libraries like jsPDF or Puppeteer for PDF generation
  }

  // No VAT: totals equal the quoted amount
  const subtotal = quote.total
  const total = subtotal

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between print:hidden">
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Invoice #{billing.id}
          </CardTitle>
          <div className="flex gap-2">
            {/* <Button variant="outline" onClick={handlePrint}>
              <Printer size={16} className="mr-2" />
              Print
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download size={16} className="mr-2" />
              Download PDF
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="cursor-pointer"
            >
              <X size={20} />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 print:p-8">
          {/* Company Header */}
          <div className="text-center border-b pb-6">
            <h1 className="text-3xl font-bold text-blue-600">2Loy</h1>
            <p className="text-gray-600 mt-2">Car Aircon Services</p>
            <p className="text-sm text-gray-500">
              Prk 1 Rizal, Canocotan, Tagum City | Phone: 0926-863-6456 | Email:
              valanthony014c@gmail.com
            </p>
          </div>

          {/* Invoice Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">INVOICE</h2>
              <div className="space-y-1">
                <p>
                  <strong>Invoice #:</strong> INV-
                  {billing.id.toString().padStart(6, "0")}
                </p>
                <p>
                  <strong>Date Issued:</strong> {formatDateTime(new Date())}
                </p>
                <p>
                  <strong>Service Date:</strong> {formatDateTime(scheduledAt)}
                </p>
                <p>
                  <strong>Booking #:</strong> BK-
                  {booking.id.toString().padStart(6, "0")}
                </p>
              </div>
            </div>

            <div className="md:text-right">
              <h3 className="font-semibold mb-2">Bill To:</h3>
              <div className="space-y-1">
                <p className="font-medium">{customer.name}</p>
                <p>{customer.email}</p>
                <p>{customer.phone}</p>
              </div>
            </div>
          </div>

          {/* Vehicle & Service Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
            <div>
              <h3 className="font-semibold mb-2">Vehicle Information</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Plate Number:</strong> {car.plateNo}
                </p>
                <p>
                  <strong>Make/Model:</strong> {car.brand} {car.model}
                </p>
                <p>
                  <strong>Year:</strong> {car.year}
                </p>
                {car.notes && (
                  <p>
                    <strong>Notes:</strong> {car.notes}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Service Information</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Service:</strong> {service.name}
                </p>
                <p>
                  <strong>Technician:</strong> {technician?.name || "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="text-green-600 font-medium">COMPLETED</span>
                </p>
              </div>
            </div>
          </div>

          {/* Service Breakdown */}
          <div>
            <h3 className="font-semibold mb-3">Service Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left">
                      Description
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center">
                      Qty
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right">
                      Unit Price
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-gray-600">
                          {service.description}
                        </p>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center">
                      1
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right">
                      {formatCurrency(service.cost)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-right">
                      {formatCurrency(service.cost)}
                    </td>
                  </tr>

                  {/* Parts Used (if any) */}
                  {booking.jobs?.[0]?.partsUsed?.length > 0 && (
                    <>
                      {booking.jobs[0].partsUsed.map((partUsed, index) => (
                        <tr key={index}>
                          <td
                            className="border border-gray-300 px-4 py-3"
                            colSpan={4}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">
                                  {partUsed.part.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Replacement Part
                                </p>
                              </div>
                              <p className=""> {partUsed.quantity} pieces</p>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* Labor/Additional Services */}
                  {booking.jobs?.[0]?.notes?.length > 0 && (
                    <tr>
                      <td
                        className="border border-gray-300 px-4 py-3"
                        colSpan="4"
                      >
                        <p className="font-medium text-sm mb-2">
                          Work Performed:
                        </p>
                        <div className="text-sm text-gray-600">
                          {booking.jobs[0].notes.map((note, index) => (
                            <p key={index}>• {note.content}</p>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="max-w-md ml-auto space-y-2">
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Total Amount:</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 text-green-800">
              Payment Information
            </h3>
            <div className="space-y-2">
              {billing.payments?.map((payment, index) => (
                <div
                  key={payment.id || index}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {formatDateTime(payment.paidAt)} - {payment.method}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(payment.amount)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-green-800 border-t border-green-200 pt-2">
                <span>Total Paid:</span>
                <span>
                  {formatCurrency(
                    billing.payments?.reduce(
                      (sum, p) => sum + parseFloat(p.amount),
                      0
                    ) || 0
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="text-xs text-gray-500 border-t pt-4">
            <h4 className="font-semibold mb-2">Terms & Conditions:</h4>
            <ul className="space-y-1">
              <li>
                • All services are guaranteed for 30 days from completion date
              </li>
              <li>• Parts are covered by manufacturer warranty</li>
              <li>• Payment is due upon completion of service</li>
              <li>
                • Customer is responsible for any additional repairs discovered
                during service
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p className="font-semibold">
              Thank you for choosing 2Loy Car Aircon Services!
            </p>
            <p className="mt-2">
              For any questions regarding this invoice, please contact us at
              valanthony014c@gmail.com or 0926-863-6456
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}