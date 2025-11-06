import { Car, XCircle } from "lucide-react"
import BookingForm from "./BookingForm"

export default function BookingModal({ setBookModal, bookModal }) {
  return (
    <div className="fixed inset-0 h-full w-full flex flex-items bg-black/20 justify-center  z-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 flex-1">
        <div className="w-full bg-white rounded-lg shadow border border-black md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl flex items-center gap-1">
                <Car />
                {bookModal.car.plateNo}
              </h1>
              <XCircle
                className="cursor-pointer"
                onClick={() => setBookModal({ car: null, open: false })}
              />
            </div>
            <div className="flex flex-col">
              <h4>Brand: {bookModal.car.brand}</h4>
              <h4>Model: {bookModal.car.model}</h4>
            </div>
            <BookingForm setBookModal={setBookModal} bookModal={bookModal} />
          </div>
        </div>
      </div>
    </div>
  )
}
