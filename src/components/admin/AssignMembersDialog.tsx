import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Button } from "../ui/button"
import { Checkbox } from "../ui/checkbox"

type Props = {
  triggerLabel: string
  members: any[]
  assigned: number[]
  onAssign: (newList: number[]) => void
}

export function AssignMembersDialog({ triggerLabel, members, assigned, onAssign }: Props) {
  const handleToggle = (id: number) => {
    const exists = assigned.includes(id)
    const updated = exists ? assigned.filter(m => m !== id) : [...assigned, id]
    onAssign(updated)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {members.map((m) => (
            <label key={m.id} className="flex items-center gap-2">
              <Checkbox checked={assigned.includes(m.id)} onCheckedChange={() => handleToggle(m.id)} />
              {m.name}
            </label>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
