import { EventRow } from "./EventRow"
import { Table } from "../ui/Table"

type Props = {
  events: any[]
  onEdit: (data: any) => void
  onDelete: (id: number) => void
}

export function EventTable({ events, onEdit, onDelete }: Props) {
  return (
    <Table headers={["Event Name", "Location", "Date", "Actions"]}>
      {events.map((event) => (
        <EventRow key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </Table>
  )
}
