import { EventRow } from "./EventRow"
import { Table } from "../ui/Table"


type EventFormData = {
  title: string;
  location: string;
  date: string;
  description: string;
  event_cover?: File;
}

type Props = {
  events: any[] // Consider making this more specific, e.g., 'Event[]'
  // Correct the type of onEdit to match what EventRow expects (and thus EventForm)
  onEdit: (data: EventFormData) => Promise<boolean>
  onDelete: (id: number) => void
}

export function EventTable({ events, onEdit, onDelete }: Props) {
  return (
    <Table headers={["Event Name", "Location", "Date", "Actions"]}>
      {events.map((event) => (
        // Ensure that 'event' structure is compatible with EventRow's 'event' prop
        // (which we refined in the last step to ensure it had 'id', 'name', etc.)
        <EventRow key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </Table>
  )
}