import { Button } from "../ui/button"
import { EventForm } from "./EventForm"

type Props = {
  event: any
  onEdit: (data: any) => void
  onDelete: (id: number) => void
}

export function EventRow({ event, onEdit, onDelete }: Props) {
  return (
    <tr className="border-b">
      <td className="p-2">{event.name}</td>
      <td className="p-2">{event.location}</td>
      <td className="p-2">{event.date}</td>
      <td className="p-2">
        <div className="flex gap-2">
          <EventForm triggerLabel="Edit" initialData={event} onSubmit={onEdit} />
          <Button variant="destructive" onClick={() => onDelete(event.id)}>Delete</Button>
        </div>
      </td>
    </tr>
  )
}
