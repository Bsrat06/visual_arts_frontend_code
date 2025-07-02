// logoutbutton.tsx
import { useNavigate } from "react-router-dom"
import API from "../../lib/api"
import { Button } from "../../components/ui/button"
import { type ComponentPropsWithoutRef } from "react"; // Import this

// Define props for LogoutButton, extending Button's props
type LogoutButtonProps = ComponentPropsWithoutRef<typeof Button>;

export default function LogoutButton({ className, ...props }: LogoutButtonProps) { // Destructure className and rest of props
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout/")
    } catch (err) {
      console.warn("Logout API failed, ignoring.")
    }

    localStorage.removeItem("token")
    localStorage.removeItem("role")

    navigate("/login")
  }

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className={className} // Apply the className prop here
      {...props} // Pass any other props down to the Button component
    >
      Logout
    </Button>
  )
}