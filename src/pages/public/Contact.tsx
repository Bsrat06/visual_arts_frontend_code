import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"

export default function Contact() {
  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Contact Us</h1>
      <form className="space-y-4">
        <Input type="text" placeholder="Your Name" required />
        <Input type="email" placeholder="Your Email" required />
        <Textarea placeholder="Your Message..." rows={5} />
        <Button type="submit">Send Message</Button>
      </form>
    </div>
  )
}
