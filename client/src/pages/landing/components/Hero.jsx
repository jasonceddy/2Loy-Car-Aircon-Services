import { Book } from "lucide-react"
import { Link } from "react-router-dom"

export default function Hero() {
  return (
    <section
      id="hero"
      className="bg-gray-700 w-full flex flex-col justify-center items-center text-white"
    >
      <div className="w-[65vw] max-[1100px]:w-full max-[1100px]:px-5 gap-2 py-10 flex flex-col mt-5">
        <h1 className="text-4xl font-bold">Car aircon services made simple</h1>
        <h3 className="text-2xl ">
          Book online, track progress, and view invoices in one place.
        </h3>
        <Link
          to="/login"
          className="p-4 bg-gray-900 self-start rounded-xl flex items-center gap-2 text-white font-semibold hover:bg-gray-800 mt-4"
        >
          <Book />
          Book a service
        </Link>
      </div>
      {/* Proof Bar */}
      
    </section>
  )
}
