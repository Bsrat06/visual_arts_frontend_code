import { Menu } from "lucide-react"
// import { useState } from "react"
import { useAuth } from "../../hooks/useAuth"
import LogoutButton from "../../components/common/LogoutButton"

type Props = {
  toggleSidebar?: () => void
}

export default function Topbar({ toggleSidebar }: Props) {
  const { user } = useAuth()

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="md:hidden">
        {toggleSidebar && (
          <button onClick={toggleSidebar} className="text-gray-500 hover:text-black">
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user.first_name} ({user.role})
          </span>
        )}
        <LogoutButton />
      </div>
    </div>
  )
}
