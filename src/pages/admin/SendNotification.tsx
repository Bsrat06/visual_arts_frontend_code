import { useState } from "react"
import API from "../../lib/api"
// import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select"
import { Label } from "../../components/ui/label"

export default function SendNotification() {
  const [role, setRole] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState("project_invite")
  const [response, setResponse] = useState("")

  const handleSend = async () => {
    try {
      await API.post("/notifications/send_bulk/", {
        role,
        message,
        notification_type: type
      })
      setResponse("✅ Notification sent successfully.")
      setRole("")
      setMessage("")
    } catch (err) {
      setResponse("❌ Failed to send notification.")
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Send Bulk Notification</h1>

      <div className="space-y-2">
        <Label>Target Role</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select role..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="member">Member</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Message</Label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
      </div>

      <div className="space-y-2">
        <Label>Notification Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="artwork_approved">Artwork Approved</SelectItem>
            <SelectItem value="event_update">Event Update</SelectItem>
            <SelectItem value="project_invite">Project Invitation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSend}>Send Notification</Button>

      {response && <p className="text-sm text-muted-foreground">{response}</p>}
    </div>
  )
}
