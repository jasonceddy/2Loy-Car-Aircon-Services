import { useState } from "react"
import { ChevronDown, Calendar, Activity, CreditCard, User } from "lucide-react"
export default function FAQ() {
  const [openItems, setOpenItems] = useState({})

  const toggleItem = (index) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  const faqCategories = [
    {
      icon: Calendar,
      title: "Booking",
      color: "blue",
      faqs: [
        {
          question: "Do I need an account to book a service?",
          answer:
            "Yes, creating an account helps us track your service history and send you updates about your booking.",
        },
        {
          question: "How late can I reschedule my appointment?",
          answer:
            "You can reschedule up to 24 hours before your scheduled appointment time. After that, please call us directly.",
        },
        {
          question: "Can I choose a specific technician?",
          answer:
            "It depends on the service, but some services allow you to choose a technician. ",
        },
      ],
    },
    {
      icon: Activity,
      title: "Tracking",
      color: "green",
      faqs: [
        {
          question: "How do I check the stages of my service?",
          answer:
            "Log into your account and on your dashboard you'll be able to see real-time updates: Diagnostic → Repair → Testing → Completion.",
        },
        {
          question: "What happens if I'm late for my appointment?",
          answer:
            "We understand delays happen. Please call us as soon as possible. We'll try to accommodate you, though it may affect the completion time.",
        },
      ],
    },
    {
      icon: CreditCard,
      title: "Payments",
      color: "purple",
      faqs: [
        {
          question: "How do I get my invoice?",
          answer:
            "Invoices are automatically generated after service completion. You can also download them from your account.",
        },
        {
          question: "What happens with unpaid bills?",
          answer:
            "We'll send payment reminders via email and SMS. Unpaid bills may affect future booking privileges until settled.",
        },
        {
          question: "Can I get a receipt for cash payments?",
          answer:
            "Yes, we provide both physical and digital receipts for all payment methods including cash.",
        },
      ],
    },
    {
      icon: User,
      title: "Account",
      color: "orange",
      faqs: [
        {
          question: "I forgot my password, what should I do?",
          answer:
            "Click 'Forgot Password' on the login page. We'll send a reset link to your registered email address.",
        },
        {
          question: "What does my service history show?",
          answer:
            "Your service history displays all past bookings, services performed, parts replaced, invoices, and maintenance schedules for each vehicle.",
        },
      ],
    },
  ]

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  }

  return (
    <section
      id="faq"
      className="bg-white w-full flex flex-col justify-center items-center"
    >
      <div className="w-[65vw] max-[1100px]:w-full max-[1100px]:px-5 gap-12 py-16 flex flex-col">
        {/* Section Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Got questions? We've organized answers by topic to help you find
            what you need quickly
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => {
            const Icon = category.icon
            return (
              <div key={categoryIndex} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2 rounded-lg ${colorClasses[category.color]}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category.title}
                  </h3>
                </div>

                {/* FAQ Items */}
                <div className="space-y-3 ml-8">
                  {category.faqs.map((faq, faqIndex) => {
                    const itemKey = `${categoryIndex}-${faqIndex}`
                    const isOpen = openItems[itemKey]

                    return (
                      <div
                        key={faqIndex}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleItem(itemKey)}
                          className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900">
                            {faq.question}
                          </span>
                          <ChevronDown
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              isOpen ? "transform rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isOpen && (
                          <div className="px-4 pb-4 text-gray-600 leading-relaxed border-t border-gray-100">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
