import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

// Define a separate type for the data submitted by the form
// This type reflects what react-hook-form gives you from the input
type FormInputData = {
  title: string;
  location: string;
  date: string;
  description: string;
  event_cover?: FileList; // Input type="file" gives a FileList
}

// Define the type for the data that onSubmit expects
// This reflects the processed data after extracting the single File
type EventFormData = {
  title: string;
  location: string;
  date: string;
  description: string;
  event_cover?: File; // onSubmit expects a single File or undefined
}

type Props = {
  triggerLabel?: string;
  initialData?: EventFormData; // initialData would be EventFormData
  onSubmit: (data: EventFormData) => Promise<boolean>;
}

export function EventForm({ triggerLabel = "Add Event", initialData, onSubmit }: Props) {
  // Use FormInputData for useForm as it matches the input types
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormInputData>({
    defaultValues: initialData ? { // Map initialData to FormInputData compatible defaults
        ...initialData,
        // FileList can't be directly set from a File, so we omit it or handle differently if needed
        // For editing, you might not pre-fill the file input, just show existing image
        event_cover: undefined 
      } : {
      title: "",
      location: "",
      date: "",
      description: ""
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async (data: FormInputData) => { // data here is FormInputData
    setIsLoading(true);
    try {
      // Create the formData object with the correct type for onSubmit
      const formData: EventFormData = { // Explicitly type formData as EventFormData
        title: data.title,
        location: data.location,
        date: data.date,
        description: data.description,
        event_cover: data.event_cover?.[0] || undefined // Extract the single File
      };
      
      const success = await onSubmit(formData); // Now formData matches EventFormData
      if (success) {
        setIsOpen(false);
        reset();
      }
    } catch (error) {
      toast.error("Failed to submit event");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Event" : "Add New Event"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4 mt-2">
          <div>
            <Input 
              placeholder="Event Title" 
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
          </div>
          
          <div>
            <Input 
              placeholder="Location" 
              {...register("location", { required: "Location is required" })}
            />
            {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>}
          </div>
          
          <div>
            <Input 
              type="datetime-local" 
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>}
          </div>
          
          <div>
            <Textarea 
              placeholder="Description" 
              {...register("description")}
              rows={4}
            />
          </div>
          
          <div>
            <Input 
              type="file" 
              accept="image/*"
              {...register("event_cover")} // This will yield a FileList
            />
            <p className="text-xs text-muted-foreground mt-1">Upload event cover image (optional)</p>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}