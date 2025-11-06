import ForgotPasswordForm from "./components/ForgotPasswordForm"
export default function ForgotPassword() {
  return (
    <main className="flex-1 flex">
      <section className="flex-1 flex">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 flex-1">
          <div className="w-full bg-white rounded-lg shadow border border-black md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Forgot Password
              </h1>
              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
