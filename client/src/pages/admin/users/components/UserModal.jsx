import { User, XCircle } from "lucide-react"
import UserForm from "./UserForm"
import { useState } from "react"
import VehicleTransferModal from "./VehicleTransferModal"

export default function UserModal({ setModal, fetchUsers, modal }) {
  const [transferOpen, setTransferOpen] = useState(false)
  return (
    <>
      <div className="fixed inset-0 h-full w-full flex flex-items bg-black/20 justify-center  z-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 flex-1">
        <div className="w-full bg-white rounded-lg shadow border border-black md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl flex items-center gap-1">
                <User />
                Users
              </h1>
              <div className="flex items-center gap-2">
                {modal.user?.role === "CUSTOMER" && (
                  <button
                    onClick={() => setTransferOpen(true)}
                    className="text-sm px-3 py-1 border rounded"
                  >
                    Transfer vehicle
                  </button>
                )}
                <XCircle
                  className="cursor-pointer"
                  onClick={() => setModal({ user: null, open: false })}
                />
              </div>
            </div>
            <UserForm
              setModal={setModal}
              modal={modal}
              fetchUsers={fetchUsers}
            />
          </div>
        </div>
      </div>
    </div>
    
        <VehicleTransferModal
      open={transferOpen}
      setOpen={setTransferOpen}
      user={modal.user}
      onComplete={() => {
        fetchUsers()
        setModal({ user: null, open: false })
      }}
    />
    </>
  )
}

// Vehicle transfer modal (separate to avoid clutter)
// Rendered outside so it can be toggled from the user modal header
// Props: open, setOpen, user, onComplete
// We render it at module level so it can be used by the parent component
// The actual modal component file is `VehicleTransferModal.jsx` imported above
// We'll render it conditionally in the parent component's JSX.
// Render transfer modal
export function _RenderVehicleTransfer({ transferOpen, setTransferOpen, user, fetchUsers, setModal }) {
  return (
    <VehicleTransferModal
      open={transferOpen}
      setOpen={setTransferOpen}
      user={user}
      onComplete={() => {
        // refresh list and keep UX simple
        fetchUsers()
        setModal({ user: null, open: false })
      }}
    />
  )
}
