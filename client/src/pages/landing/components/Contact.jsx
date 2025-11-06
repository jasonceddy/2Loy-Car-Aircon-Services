import { useState } from "react"
import { Phone, Mail, MapPin, Send, Clock, LogIn } from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    carInfo: "",
    service: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
    // You would typically send this to your backend
  }

  return (
    <section
      id="contact"
      className="bg-gray-50 w-full flex flex-col justify-center items-center"
    >
      <div className="w-[65vw] max-[1100px]:w-full max-[1100px]:px-5 gap-12 py-16 flex flex-col">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Contacts</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Ready to book your car aircon service? Contact us directly or fill
            out the form below
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Contact Information
              </h3>

              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Hotline</div>
                    <a
                      href="tel:09268636456"
                      className="text-gray-600 hover:underline"
                    >
                      0926 863 6456
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-gray-900">Email</div>
                    <a
                      href="mailto:valanthony014c@gmail.com"
                      className="text-gray-600 hover:underline"
                    >
                      valanthony014c@gmail.com
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">Address</div>
                    <div className="text-gray-600">
                      Prk 1 Rizal, Canocotan
                      <br />
                      Tagum City
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600 mt-1" />
                  <div>
                    <div className="font-medium text-gray-900">
                      Business Hours
                    </div>
                    <div className="text-gray-600">
                      Mon - Sat: 8:00 AM - 6:00 PM
                      <br />
                      Sunday: Closed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Already Booked Note */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-start gap-2">
                <LogIn className="w-5 h-5 text-gray-600 mt-0.5" />
                <div>
                  <div className="font-medium text-gray-900 mb-1">
                    Already booked?
                  </div>
                  <div className="text-gray-700 text-sm">
                    Sign in to reschedule or cancel before the cutoff time.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Send us an Inquiry
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  {/* Car Info */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Car Plate/Model
                    </label>
                    <input
                      type="text"
                      name="carInfo"
                      placeholder="e.g., ABC-123 / Toyota Vios"
                      value={formData.carInfo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>
                </div>

                {/* Service Needed */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Needed
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  >
                    <option value="">Select a service</option>
                    <option value="diagnostics">Diagnostics</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="repairs">Repairs</option>
                    <option value="parts-replacement">Parts Replacement</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Preferred Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferred Time
                    </label>
                    <select
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="">Select time</option>
                      <option value="morning">Morning (8AM - 12PM)</option>
                      <option value="afternoon">Afternoon (1PM - 6PM)</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Tell us more about your aircon issue or any specific requirements..."
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Inquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
