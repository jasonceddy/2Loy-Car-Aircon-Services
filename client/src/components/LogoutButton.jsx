import { useNavigate } from "react-router-dom"
import axiosClient from "../axiosClient"

export default function LogoutButton() {
  const navigate = useNavigate()
  const signOut = async () => {
    try {
      await axiosClient.get("/auth/logout")
      navigate("/")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <button onClick={() => signOut()} className="px-4 py-2 rounded-md">
      Logout
    </button>
  )
}
