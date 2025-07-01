import { Button } from "../ui/button"
import { MemberForm } from "./MemberForm"

type Props = {
  member: any
  onEdit: (member: any) => void
  onDelete: (id: number) => void
}

export function MemberRow({ member, onEdit, onDelete }: Props) {
  return (
    <tr className="border-b">
      <td className="p-2">{member.name}</td>
      <td className="p-2">{member.email}</td>
      <td className="p-2">{member.role}</td>
      <td className="p-2">
        <div className="flex gap-2">
          <MemberForm triggerLabel="Edit" initialData={member} onSubmit={onEdit} />
          <Button variant="destructive" onClick={() => onDelete(member.id)}>Delete</Button>
        </div>
      </td>
    </tr>
  )
}
