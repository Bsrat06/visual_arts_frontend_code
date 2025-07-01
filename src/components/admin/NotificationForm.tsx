import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"

type Props = {
  onSubmit: (message: string) => void
}

export function NotificationForm({ onSubmit }: Props) {
  const [message, setMessage] = useState("")

  const handleSend = () => {
    if (message.trim()) {
      onSubmit(message.trim())
      setMessage("")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Send Notification</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Notification</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button className="w-full" onClick={handleSend}>Send</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
