import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

type EventFormData = {
  title: string;
  location: string;
  date: string;
  description: string;
  event_cover?: File;
}

type Props = {
  triggerLabel?: string;
  initialData?: EventFormData;
  onSubmit: (data: EventFormData) => Promise<boolean>;
}

export function EventForm({ triggerLabel = "Add Event", initialData, onSubmit }: Props) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EventFormData>({
    defaultValues: initialData || {
      title: "",
      location: "",
      date: "",
      description: ""
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Handle file upload if needed
    }
  };

  const submitHandler = async (data: EventFormData) => {
    setIsLoading(true);
    try {
      const formData = {
        ...data,
        event_cover: data.event_cover || undefined
      };
      const success = await onSubmit(formData);
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
              {...register("event_cover")}
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