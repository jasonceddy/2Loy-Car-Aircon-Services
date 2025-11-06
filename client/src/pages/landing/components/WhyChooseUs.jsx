import { Eye, FileText, MapPin, Users } from "lucide-react"

export default function WhyChooseUs() {
  const features = [
    {
      icon: MapPin,
      title: "Serving Tagum since 2009",
      description: "Over 15 years of trusted service in the local community",
    },
    {
      icon: Eye,
      title: "Transparent service stages",
      description: "Track every step of your service with real-time updates",
    },
    {
      icon: FileText,
      title: "Proper records for every car",
      description:
        "Complete service history and documentation for your vehicle",
    },
    {
      icon: Users,
      title: "Local technicians, trusted service",
      description:
        "Skilled professionals who know your community and care about quality",
    },
  ]
  return (
    <section
      id="why-choose-us"
      className="bg-white w-full flex flex-col justify-center items-center"
    >
      <div className="w-[65vw] max-[1100px]:w-full max-[1100px]:px-5 gap-12 py-16 flex flex-col">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Us?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Experience the difference that comes with local expertise and
            genuine care for your vehicle
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-lg hover:bg-gray-50 transition-colors duration-300"
              >
                <div className="bg-gray-100 p-3 rounded-full shrink-0">
                  <Icon className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust Indicators */}
        <div className="bg-gray-100 rounded-xl p-8 text-center">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div>
              <div className="text-3xl font-bold text-gray-600">15+</div>
              <div className="text-gray-600">Years of Service</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-600">1000+</div>
              <div className="text-gray-600">Cars Services</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-600">7</div>
              <div className="text-gray-600">Skilled Technicians</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-600">100%</div>
              <div className="text-gray-600">Transparent Process</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
