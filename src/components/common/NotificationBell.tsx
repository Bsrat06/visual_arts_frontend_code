import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Link } from "react-router-dom"
import API from "../../lib/api"
import { type ComponentPropsWithoutRef } from "react"; 

// Omit 'to' from the Link's props type, because 'to' is hardcoded within this component.
// If you wanted 'to' to be passed as a prop to NotificationBell, you would include it here
// and then pass it down like <Link to={to} ... />
type NotificationBellProps = Omit<ComponentPropsWithoutRef<typeof Link>, 'to'>;


export default function NotificationBell({ className, ...props }: NotificationBellProps) { 
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
    <Link 
      to="/notifications" // This 'to' is now the only one, as it's omitted from 'props'
      className={`relative inline-block ${className || ''}`} 
      {...props} // 'props' no longer contains 'to'
    >
      <Bell className="w-6 h-6 text-muted-foreground" />
      {unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-2 text-xs px-1.5 bg-red-600 text-white rounded-full">
          {unreadCount}
        </Badge>
      )}
    </Link>
  )
}