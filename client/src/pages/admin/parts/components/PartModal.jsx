import { Wrench, XCircle } from "lucide-react"
import PartForm from "./PartForm"

export default function PartModal({ setModal, fetchParts, modal }) {
  return (
    <div className="fixed inset-0 h-full w-full flex flex-items bg-black/20 justify-center  z-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 flex-1">
        <div className="w-full bg-white rounded-lg shadow border border-black md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl flex items-center gap-1">
                <Wrench />
                Part
              </h1>
              <XCircle
                className="cursor-pointer"
                onClick={() => setModal({ part: null, open: false })}
              />
            </div>
            <PartForm
              setModal={setModal}
              modal={modal}
              fetchParts={fetchParts}
            />
          </div>
        </div>
      </div>
    </div>
  )
}