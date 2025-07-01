import { useEffect, useState } from "react"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import API from "../../lib/api"
import toast from "react-hot-toast"

export function AdminSettingsForm() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    profile_picture: "",
  })

  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    API.get("/auth/user/").then((res) => {
      setForm({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        email: res.data.email || "",
        profile_picture: res.data.profile_picture || "",
      })
      setPreview(res.data.profile_picture)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setPreview(URL.createObjectURL(e.target.files[0]))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = new FormData()
    data.append("first_name", form.first_name)
    data.append("last_name", form.last_name)
    data.append("email", form.email)
    if (file) data.append("profile_picture", file)

    try {
      await API.put("/auth/profile/update/", data)
      toast.success("Profile updated successfully")
    } catch (err) {
      console.error(err)
      toast.error("Failed to update profile")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={preview || undefined} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div>
          <Label htmlFor="profile_picture">Profile Picture</Label>
          <Input type="file" name="profile_picture" onChange={handleFileChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">First Name</Label>
          <Input name="first_name" value={form.first_name} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="last_name">Last Name</Label>
          <Input name="last_name" value={form.last_name} onChange={handleChange} />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input name="email" type="email" value={form.email} onChange={handleChange} />
      </div>

      <Button type="submit" className="w-full">Save Changes</Button>
    </form>
  )
}
