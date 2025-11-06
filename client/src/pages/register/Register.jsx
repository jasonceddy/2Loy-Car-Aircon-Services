import RegisterForm from "./components/RegisterForm"

export default function Register() {
  return (
    <main className="flex-1 flex w-full bg-gray-100">
      <section className="flex-1 flex">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto lg:py-0 flex-1">
          <div className="w-full bg-white rounded-lg shadow border border-black  md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Sign up now
              </h1>
              <RegisterForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
