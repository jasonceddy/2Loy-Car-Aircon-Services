import { Calendar, Package, Search, Sparkles, Wrench } from "lucide-react"
import Hero from "./components/Hero"
import HowItWorks from "./components/HowItWorks"
import WhyChooseUs from "./components/WhyChooseUs"
import AboutUs from "./components/AboutUs"
import FAQ from "./components/FAQ"
import Contact from "./components/Contact"
import Footer from "./components/Footer"

export default function LandingPage() {
  const services = [
    {
      icon: Search,
      title: "Diagnostics",
      description: "Identify problems before they get worse",
    },
    {
      icon: Sparkles,
      title: "Cleaning",
      description: "Remove dirt and odor for cooler, fresher air",
    },
    {
      icon: Wrench,
      title: "Repairs",
      description: "Leak checks, compressor fixes, system restoration",
    },
    {
      icon: Package,
      title: "Parts Replacement",
      description: "Genuine parts logged in your car's record",
    },
    {
      icon: Calendar,
      title: "Maintenance",
      description: "Regular service packages",
    },
  ]
  return (
    <main className="flex-1 flex flex-col w-full">
      <Hero />
      <section
        id="services"
        className="bg-white w-full flex flex-col justify-center items-center"
      >
        <div className="w-[65vw] max-[1100px]:w-full max-[1100px]:px-5 gap-8 py-16 flex flex-col">
          {/* Section Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Professional car aircon services to keep you comfortable on the
              road
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 hover:border-gray-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg shrink-0">
                      <Icon className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      <HowItWorks />
      <WhyChooseUs />
      <AboutUs />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  )
}
