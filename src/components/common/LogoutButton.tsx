import { useNavigate } from "react-router-dom"
import API from "../../lib/api"
import { Button } from "../../components/ui/button"

export default function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      // Optional: Notify backend (but not strictly required with token-only auth)
      await API.post("/auth/logout/")
    } catch (err) {
      console.warn("Logout API failed, ignoring.")
    }

    // Clear localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("role")

    // Redirect to login or home
    navigate("/login")
  }

  return <Button variant="outline" onClick={handleLogout}>Logout</Button>
}
