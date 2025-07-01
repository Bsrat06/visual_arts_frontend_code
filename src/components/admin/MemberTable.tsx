import { MemberRow } from "./MemberRow"
import { Table } from "../ui/Table"

type Props = {
  members: any[]
  onEdit: (data: any) => void
  onDelete: (id: number) => void
}

export function MemberTable({ members, onEdit, onDelete }: Props) {
  return (
    <Table headers={["Name", "Email", "Role", "Actions"]}>
      {members.map((member) => (
        <MemberRow key={member.id} member={member} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </Table>
  )
}
