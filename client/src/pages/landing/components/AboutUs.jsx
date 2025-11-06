import { Calendar, Users, MapPin, Phone, Mail } from "lucide-react"
export default function AboutUs() {
  return (
    <section
      id="about-us"
      className="bg-gray-50 w-full flex flex-col justify-center items-center"
    >
      <div className="w-[65vw] max-[1100px]:w-full max-[1100px]:px-5 gap-12 py-16 flex flex-col">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">About Us</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your trusted car aircon specialists in Tagum City, dedicated to
            keeping you cool and comfortable
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Story Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                Our Story
              </h3>
              <div className="space-y-4 text-gray-600">
                <div className="bg-white p-4 rounded-lg border-l-4 border-gray-600">
                  <div className="font-semibold text-gray-600">
                    December 21, 2009
                  </div>
                  <div>
                    Founded our car aircon service business in Tagum City
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-600">
                  <div className="font-semibold text-green-600">
                    January 24, 2018
                  </div>
                  <div>
                    Expanded our operations to better serve the growing
                    community
                  </div>
                </div>
              </div>
            </div>

            {/* Team */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-600" />
                Our Team
              </h3>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">
                    7 skilled technicians
                  </span>{" "}
                  dedicated to providing exceptional car aircon services
                  throughout Tagum City. Our experienced team combines technical
                  expertise with genuine care for every customer.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Get in Touch
              </h3>
              <div className="space-y-4">
                {/* Address */}
                <div className="bg-white p-4 rounded-lg flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-1 shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">Visit Us</div>
                    <div className="text-gray-600">
                      Prk 1 Rizal, Canocotan
                      <br />
                      Tagum City
                    </div>
                  </div>
                </div>

                {/* Contact Person */}
                <div className="bg-white p-4 rounded-lg">
                  <div className="font-semibold text-gray-900 mb-3">
                    Contact Person
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium text-gray-800">
                      Vernie Anthony Calipusan
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <a
                        href="tel:09268636456"
                        className="text-gray-600 hover:text-gray-600 transition-colors"
                      >
                        0926 863 6456
                      </a>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <a
                        href="mailto:valanthony014c@gmail.com"
                        className="text-gray-600 hover:text-gray-600 transition-colors"
                      >
                        valanthony014c@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="bg-gray-600 text-white p-6 rounded-lg text-center">
              <h4 className="font-semibold mb-2">Ready to get started?</h4>
              <p className="text-gray-100 mb-4">
                Contact us today to book your car aircon service
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="tel:09268636456"
                  className="bg-white text-gray-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Call Now
                </a>
                <a
                  href="mailto:valanthony014c@gmail.com"
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Send Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
