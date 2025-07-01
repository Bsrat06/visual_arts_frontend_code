import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState } from "react"

type Props = {
  triggerLabel?: string
  onSubmit: (data: any) => void
  initialData?: any
}

export function MemberForm({ triggerLabel = "Add Member", onSubmit, initialData }: Props) {
  const [form, setForm] = useState(initialData || {
    name: "", email: "", role: "Member"
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    onSubmit(form)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Member" : "Add New Member"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <Input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
          <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <Input name="role" placeholder="Role (Admin or Member)" value={form.role} onChange={handleChange} />
          <Button className="w-full mt-2" onClick={handleSubmit}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
