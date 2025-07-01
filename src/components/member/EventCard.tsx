import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"

type Props = {
  event: any
  isRegistered: boolean
  onToggle: (id: number) => void
}

export function EventCard({ event, isRegistered, onToggle }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{event.date} – {event.location}</p>
      </CardHeader>
      <CardContent>
        <p>{event.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant={isRegistered ? "destructive" : "default"} onClick={() => onToggle(event.id)}>
          {isRegistered ? "Unregister" : "Register"}
        </Button>
      </CardFooter>
    </Card>
  )
}
