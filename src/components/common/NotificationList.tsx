import { useEffect, useState } from "react"
import API from "../../lib/api"
import { Button } from "../../components/ui/button"
import { Card } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"

type Notification = {
  id: number
  message: string
  notification_type: string
  created_at: string
  read: boolean
}

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    const res = await API.get("/notifications/")
    setNotifications(res.data.results || res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (id: number) => {
    await API.patch(`/notifications/${id}/mark_as_read/`)
    fetchNotifications()
  }

  const markAllAsRead = async () => {
    await API.patch("/notifications/mark_all_as_read/")
    fetchNotifications()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>Mark All as Read</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-muted-foreground text-sm">No notifications.</p>
      ) : (
        notifications.map(n => (
          <Card key={n.id} className="p-4 flex justify-between items-start border">
            <div>
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {!n.read && (
                <Badge variant="destructive" className="text-xs">Unread</Badge>
              )}
              {!n.read && (
                <Button size="sm" variant="ghost" onClick={() => markAsRead(n.id)}>Mark as Read</Button>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  )
}