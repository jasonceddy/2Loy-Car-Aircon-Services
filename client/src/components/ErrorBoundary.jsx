import { useEffect } from "react"
import { useNavigate, useRouteError } from "react-router-dom"

export default function ErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  useEffect(() => {
    if (error?.status === 404) {
      navigate("/") // imperatively redirect
    }
  }, [error, navigate])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl">Something went wrong. Please try again.</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
        onClick={() => window.location.reload()}
      >
        Refresh
      </button>
    </main>
  )
}