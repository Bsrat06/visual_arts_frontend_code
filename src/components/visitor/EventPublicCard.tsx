import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"

type Props = {
  event: {
    name: string
    date: string
    location: string
    description: string
  }
}

export function EventPublicCard({ event }: Props) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{event.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{event.date} · {event.location}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{event.description}</p>
      </CardContent>
    </Card>
  )
}
