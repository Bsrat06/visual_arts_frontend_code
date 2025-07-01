import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Link } from "react-router-dom"
import API from "../../lib/api"

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchNotifications = async () => {
    try {
        const res = await API.get("/notifications/")
        const unread = res.data.results.filter((n: any) => !n.read).length
        setUnreadCount(unread)
    } catch {
        console.warn("Failed to fetch notifications")
    }
    }

  useEffect(() => {
    fetchNotifications() // initial load

    const interval = setInterval(fetchNotifications, 60000) // ⏱ refresh every 60s

    return () => clearInterval(interval) // cleanup on unmount
  }, [])

  return (
    <Link to="/notifications" className="relative inline-block">
      <Bell className="w-6 h-6 text-muted-foreground" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-2 text-xs px-1.5 bg-red-600 text-white rounded-full">
          {unreadCount}
        </Badge>
      )}
    </Link>
  )
}
