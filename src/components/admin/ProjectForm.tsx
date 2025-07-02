// src/components/admin/ProjectForm.tsx

import { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "../../lib/utils"; // Assuming you have this utility
import { Calendar } from "../ui/calendar";
import { Badge } from "../ui/badge"; // Assuming you have a Badge component

// Define ProjectFormState - THIS IS THE CANONICAL DEFINITION
export interface ProjectFormState {
  id?: number; // Optional for new projects
  title: string;
  description: string;
  progress: number; // Make required for form input
  is_completed: boolean; // Form will manage this boolean
  start_date: string;
  end_date?: string | null; // Optional end date
  members: number[]; // Array of member IDs
  image?: string | null; // Optional image field
}

// Define the props for ProjectForm
interface ProjectFormProps {
  // onSubmit should now match the signature from Projects.tsx
  onSubmit: (data: ProjectFormState, id?: number) => Promise<void>;
  initialData?: ProjectFormState;
  membersList?: { id: number; name: string }[]; // Optional prop to pass members for selection
}

export function ProjectForm({ onSubmit, initialData, membersList = [] }: ProjectFormProps) {
  const [formData, setFormData] = useState<ProjectFormState>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    progress: initialData?.progress ?? 0,
    is_completed: initialData?.is_completed ?? false,
    start_date: initialData?.start_date || format(new Date(), "yyyy-MM-dd"), // Default to today
    end_date: initialData?.end_date || null,
    members: initialData?.members || [],
    image: initialData?.image || null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        description: initialData.description,
        progress: initialData.progress ?? 0,
        is_completed: initialData.is_completed ?? false,
        start_date: initialData.start_date || format(new Date(), "yyyy-MM-dd"),
        end_date: initialData.end_date || null,
        members: initialData.members || [],
        image: initialData.image || null,
      });
    } else {
      // Reset for new project form
      setFormData({
        title: "",
        description: "",
        progress: 0,
        is_completed: false,
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: null,
        members: [],
        image: null,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProgressChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setFormData((prev) => ({ ...prev, progress: numValue }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_completed: checked }));
  };

  const handleDateChange = (date: Date | undefined, field: 'start_date' | 'end_date') => {
    setFormData((prev) => ({
      ...prev,
      [field]: date ? format(date, "yyyy-MM-dd") : null,
    }));
  };

  const handleMembersChange = (selectedMemberId: string) => {
    const memberId = parseInt(selectedMemberId);
    if (isNaN(memberId)) return;

    setFormData((prev) => {
      const currentMembers = prev.members;
      if (currentMembers.includes(memberId)) {
        return {
          ...prev,
          members: currentMembers.filter((id) => id !== memberId),
        };
      } else {
        return {
          ...prev,
          members: [...currentMembers, memberId],
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData, initialData?.id);
    } catch (error) {
      console.error("Form submission error:", error);
      // toast.error("Failed to submit form."); // Consider adding a toast here if onSubmit doesn't handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">Title</label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <label htmlFor="progress" className="text-sm font-medium">Progress (%)</label>
          <Input
            id="progress"
            name="progress"
            type="number"
            value={formData.progress}
            onChange={(e) => handleProgressChange(e.target.value)}
            min={0}
            max={100}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="start_date" className="text-sm font-medium">Start Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.start_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.start_date ? format(new Date(formData.start_date), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.start_date ? new Date(formData.start_date) : undefined}
                onSelect={(date) => handleDateChange(date, 'start_date')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <label htmlFor="end_date" className="text-sm font-medium">End Date (Optional)</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.end_date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.end_date ? format(new Date(formData.end_date), "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.end_date ? new Date(formData.end_date) : undefined}
                onSelect={(date) => handleDateChange(date, 'end_date')}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="members" className="text-sm font-medium">Assigned Members</label>
        <Select onValueChange={handleMembersChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select members" />
          </SelectTrigger>
          <SelectContent>
            {membersList.length > 0 ? (
              membersList.map((member) => (
                <SelectItem key={member.id} value={member.id.toString()}>
                  {member.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-members" disabled>No members available</SelectItem>
            )}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.members.map(memberId => {
            const member = membersList.find(m => m.id === memberId);
            return member ? (
              <Badge key={member.id} variant="secondary" className="px-3 py-1 rounded-full flex items-center gap-1">
                {member.name}
                <button
                  type="button"
                  onClick={() => handleMembersChange(member.id.toString())} // Remove by clicking badge
                  className="ml-1 text-xs opacity-75 hover:opacity-100"
                >
                  &times;
                </button>
              </Badge>
            ) : null;
          })}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_completed"
          checked={formData.is_completed}
          onCheckedChange={handleCheckboxChange}
        />
        <label htmlFor="is_completed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Mark as Completed
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => { /* Handle cancel or close dialog */ }} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Create Project")}
        </Button>
      </div>
    </form>
  );
}