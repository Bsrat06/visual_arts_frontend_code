import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Option 1: Add 'id' as an optional property to ProjectFormState
type ProjectFormState = {
  id?: number; // Make ID optional for new projects
  title: string;
  description: string;
  progress: number;
  members: number[];
  is_completed: boolean;
  start_date: string;
};

type ProjectFormProps = {
  triggerLabel?: string;
  initialData?: ProjectFormState;
  onSubmit: (data: ProjectFormState, id?: number) => Promise<void>;
};

export function ProjectForm({ triggerLabel = "Add Project", initialData, onSubmit }: ProjectFormProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProjectFormState>({
    defaultValues: initialData || {
      title: "",
      description: "",
      progress: 0,
      members: [],
      is_completed: false,
      start_date: new Date().toISOString().split('T')[0],
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const submitHandler = async (data: ProjectFormState) => {
    setIsLoading(true);
    try {
      // The 'id' can now be directly accessed from 'data' if it exists,
      // as 'initialData' would have populated it.
      // This aligns with onSubmit's second argument expecting the ID.
      await onSubmit(data, data.id); // Pass data.id here
      setIsOpen(false);
      reset();
      toast.success(initialData ? "Project updated successfully!" : "Project added successfully!");
    } catch (error) {
      toast.error("Failed to save project.");
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
          <DialogTitle>{initialData ? "Edit Project" : "Add New Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4 mt-2">
          <div>
            <Input
              placeholder="Project Title"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
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
              type="number"
              placeholder="Progress (%)"
              {...register("progress", {
                required: "Progress is required",
                min: { value: 0, message: "Progress cannot be less than 0" },
                max: { value: 100, message: "Progress cannot be more than 100" }
              })}
            />
            {errors.progress && <p className="text-sm text-red-500 mt-1">{errors.progress.message}</p>}
          </div>

          <div>
            <label htmlFor="start_date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Start Date</label>
            <Input
              id="start_date"
              type="date"
              {...register("start_date", { required: "Start date is required" })}
            />
            {errors.start_date && <p className="text-sm text-red-500 mt-1">{errors.start_date.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_completed"
              {...register("is_completed")}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_completed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Mark as Completed
            </label>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Project"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}