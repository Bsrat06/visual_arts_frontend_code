import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Button } from "../../components/ui/button"

type Props = {
  onSubmit: (data: any) => void
}

export function ArtworkUploadForm({ onSubmit }: Props) {
  const [form, setForm] = useState({ title: "", description: "", image: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    if (form.title && form.image) {
      onSubmit({ ...form, id: Date.now(), status: "pending" })
      setForm({ title: "", description: "", image: "" })
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Upload Artwork</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Artwork</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input name="title" placeholder="Title" value={form.title} onChange={handleChange} />
          <Input name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />
          <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          <Button className="w-full mt-2" onClick={handleSubmit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
