import { User, XCircle } from "lucide-react"
import DeleteUserForm from "./DeleteUserForm"

export default function DeleteUserModal({
  deleteModal,
  fetchUsers,
  setDeleteModal,
}) {
  return (
    <div className="fixed inset-0 h-full w-full flex flex-items bg-black/20 justify-center  z-50">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 flex-1">
        <div className="w-full bg-white rounded-lg shadow border border-black md:mt-0 sm:max-w-md xl:p-0">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl flex items-center gap-1">
                <User />
                Delete?
              </h1>
              <XCircle
                className="cursor-pointer"
                onClick={() => setDeleteModal({ id: null, open: false })}
              />
            </div>
            <DeleteUserForm
              setDeleteModal={setDeleteModal}
              deleteModal={deleteModal}
              fetchUsers={fetchUsers}
            />
          </div>
        </div>
      </div>
    </div>
  )
}