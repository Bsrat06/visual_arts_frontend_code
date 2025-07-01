import { useEffect, useState } from "react"
import API from "../../lib/api"
import { Button } from "../../components/ui/button"

type Event = {
  id: number
  title: string
  description: string
  date: string
  location: string
  event_cover: string | null
  is_completed: boolean
}

export default function MemberEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [message, setMessage] = useState("")

  useEffect(() => {
    API.get("/events/").then(res => setEvents(res.data.results || res.data)) // paginated or not
  }, [])

  const register = async (id: number) => {
    try {
      await API.post(`/events/${id}/register/`)
      setMessage("✅ Successfully registered!")
    } catch {
      setMessage("❌ You may already be registered or there was a server error.")
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Available Events</h1>

      {message && <p className="text-sm text-muted-foreground">{message}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white p-4 rounded shadow space-y-2">
            {event.event_cover && (
              <img src={event.event_cover} alt={event.title} className="w-full h-40 object-cover rounded" />
            )}
            <h2 className="text-lg font-semibold">{event.title}</h2>
            <p className="text-sm">{event.description}</p>
            <p className="text-sm text-muted-foreground">📍 {event.location}</p>
            <p className="text-sm text-muted-foreground">📅 {event.date}</p>

            <Button onClick={() => register(event.id)} disabled={event.is_completed}>
              {event.is_completed ? "Event Completed" : "Register"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
