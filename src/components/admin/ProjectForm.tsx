import { useEffect, useState } from "react"; // Added useEffect for potential future use, though not strictly needed for these fixes
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner"; // Changed import to use sonner's toast methods directly
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select"; // Added missing imports for Select components

// Define a type for the form state, including an optional id
type ProjectFormState = {
  id?: number; // Make id optional as it might not exist for new projects
  title: string;
  description: string;
  progress: number;
  start_date: string;
  is_completed: boolean;
};

type Props = {
  initialData?: ProjectFormState; // Use the new ProjectFormState type
  onSubmit: (data: Omit<ProjectFormState, 'id'>, id?: number) => void; // Omit 'id' from data payload, pass separately
};

// Removed triggerLabel as it was unused and causing a TS6133 warning
export function ProjectForm({ initialData, onSubmit }: Props) {
  const [form, setForm] = useState<ProjectFormState>({ // Explicitly type the useState
    id: initialData?.id, // Initialize id if present in initialData
    title: initialData?.title || "",
    description: initialData?.description || "",
    progress: initialData?.progress || 0,
    start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
    is_completed: initialData?.is_completed || false,
  });

  // This useEffect ensures that if initialData changes (e.g., when switching from Add to Edit),
  // the form state is correctly re-initialized.
  useEffect(() => {
    setForm({
      id: initialData?.id,
      title: initialData?.title || "",
      description: initialData?.description || "",
      progress: initialData?.progress || 0,
      start_date: initialData?.start_date || new Date().toISOString().split('T')[0],
      is_completed: initialData?.is_completed || false,
    });
  }, [initialData]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    let value: string | number | boolean = e.target.value;

    if (e.target.name === "progress") {
      value = Number(e.target.value);
    } else if (e.target.name === "is_completed") {
      value = e.target.value === "true";
    }

    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = () => {
    // Destructure id and payload separately from the current form state
    const { id, ...payload } = form;

    if (!payload.title || !payload.description) {
      toast.error("Title and description are required"); // Now using sonner's toast.error
      return;
    }
    // Pass the payload without id, and the id separately if it exists
    onSubmit(payload, id);
  };

  return (
    <DialogContent className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"> {/* Added tailwind classes for consistency */}
      <DialogHeader>
        <DialogTitle className="text-gray-900 dark:text-white">{initialData ? "Edit Project" : "Add New Project"}</DialogTitle> {/* Added tailwind classes for consistency */}
        <DialogDescription className="text-muted-foreground">Enter project details below.</DialogDescription> {/* Added tailwind classes for consistency */}
      </DialogHeader>
      <div className="space-y-4 mt-2">
        <Input
          name="title"
          placeholder="Project Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <Textarea
          name="description"
          placeholder="Project Description"
          value={form.description}
          onChange={handleChange}
          required
        />
        <Input
          type="number"
          name="progress"
          placeholder="Progress (%)"
          value={form.progress}
          onChange={handleChange}
          min="0"
          max="100"
        />
        <Input
          type="date"
          name="start_date"
          placeholder="Start Date"
          value={form.start_date}
          onChange={handleChange}
        />
        <Select
          name="is_completed"
          value={form.is_completed.toString()}
          onValueChange={(value) => setForm({ ...form, is_completed: value === "true" })}
        >
          <SelectTrigger>
            <span>Status: {form.is_completed ? "Completed" : "In Progress"}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="false">In Progress</SelectItem>
            <SelectItem value="true">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full mt-2" onClick={handleSubmit}>
          Save
        </Button>
      </div>
    </DialogContent>
  );
}