import {
  Activity,
  Calendar,
  Receipt,
  Thermometer,
  UserCheck,
} from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: Calendar,
      title: "Book a service",
      description: "Choose your car, preferred date, and time slot online",
      step: "01",
    },
    {
      icon: UserCheck,
      title: "Admin confirms & assigns tech",
      description: "We confirm your booking and assign a skilled technician",
      step: "02",
    },
    {
      icon: Activity,
      title: "Track stages",
      description:
        "Monitor progress: Diagnostic → Repair → Testing → Completion",
      step: "03",
    },
    {
      icon: Receipt,
      title: "Invoice generated & payment",
      description:
        "Transparent pricing with digital invoice and payment recording",
      step: "04",
    },
    {
      icon: Thermometer,
      title: "Drive away cold",
      description: "Enjoy cool, fresh air conditioning in your vehicle",
      step: "05",
    },
  ]
  return (
    <section
      id="how-it-works"
      className="bg-gray-50 w-full flex flex-col justify-center items-center"
    >
      <div className="w-[65vw] max-[1100px]:w-full max-[1100px]:px-5 gap-12 py-16 flex flex-col">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Simple steps to get your car's air conditioning back to perfect
            condition
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === steps.length - 1

            return (
              <div key={index} className="relative">
                {/* Connecting Line */}
                {!isLast && (
                  <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-300 max-md:hidden"></div>
                )}

                <div className="flex items-start gap-6 max-md:gap-4">
                  {/* Step Number & Icon */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="bg-gray-600 text-white rounded-full w-16 h-16 flex items-center justify-center mb-2">
                      <Icon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                      {step.step}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
