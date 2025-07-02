import { Button } from "../ui/button"
import { EventForm } from "./EventForm"


type EventFormData = {
  title: string;
  location: string;
  date: string;
  description: string;
  event_cover?: File;
}

type Props = {
  event: any // Consider making this more specific, e.g., 'Event' interface if available
  // Changed onEdit to return Promise<boolean> and accept EventFormData
  onEdit: (data: EventFormData) => Promise<boolean>
  onDelete: (id: number) => void
}

export function EventRow({ event, onEdit, onDelete }: Props) {
  return (
    <tr className="border-b">
      <td className="p-2">{event.name}</td> {/* Assuming 'event.name' corresponds to 'title' */}
      <td className="p-2">{event.location}</td>
      <td className="p-2">{event.date}</td>
      <td className="p-2">
        <div className="flex gap-2">
          {/*
            When passing 'event' to 'initialData', ensure 'event' has properties
            that match 'EventFormData' (e.g., 'title' instead of 'name' if necessary).
            You might need to map 'event' properties to 'EventFormData' if they differ.
          */}
          <EventForm 
            triggerLabel="Edit" 
            initialData={{ // Explicitly map properties if 'event' type differs from 'EventFormData'
                title: event.name, // Example: map event.name to title
                location: event.location,
                date: event.date,
                description: event.description,
                // event_cover will likely not be pre-filled from an existing file object
                // If you have a URL for the cover, you'd handle image preview separately
            }} 
            onSubmit={onEdit} 
          />
          <Button variant="destructive" onClick={() => onDelete(event.id)}>Delete</Button>
        </div>
      </td>
    </tr>
  )
}