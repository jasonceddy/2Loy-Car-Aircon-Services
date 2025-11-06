import { useSearchParams } from "react-router-dom"
import ResetPasswordForm from "./components/ResetPasswordForm"

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  return (
    <main className="flex-1 flex">
      <section className="flex-1 flex">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 flex-1">
          <div className="w-full bg-white rounded-lg shadow border border-black md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Reset Password
              </h1>
              <ResetPasswordForm token={token} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
