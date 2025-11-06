export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { name: "Home", href: "#hero" },
    { name: "Services", href: "#services" },
    { name: "How it works", href: "#how-it-works" },
    { name: "About Us", href: "#about-us" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
    { name: "Terms", href: "/terms" },
    { name: "Privacy", href: "/privacy" },
  ]

  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="w-[65vw] max-[1100px]:w-full max-[1100px]:px-5 mx-auto py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2">
                2Loy Car Aircon Services
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Your trusted car aircon specialists in Tagum City since 2009.
                Professional service with transparent tracking and genuine care.
              </p>
            </div>
            <div className="text-sm text-gray-300">
              <div>Prk 1 Rizal, Canocotan</div>
              <div>Tagum City</div>
              <div className="mt-2">
                <a
                  href="tel:09268636456"
                  className="hover:text-white transition-colors"
                >
                  0926 863 6456
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <div className="grid grid-cols-2 gap-2">
              {footerLinks.slice(0, 6).map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Business Hours</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Monday - Saturday</span>
                <span>8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
            <div className="pt-2">
              <a
                href="mailto:valanthony014c@gmail.com"
                className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
              >
                valanthony014c@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {currentYear} 2Loy Car Aircon Services. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex gap-6 text-sm">
              {footerLinks.slice(6).map((link, index) => (
                <p
                  key={index}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {link.name}
                </p>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Professional car aircon services • Real-time tracking •
              Transparent pricing • Serving Tagum City and surrounding areas
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
