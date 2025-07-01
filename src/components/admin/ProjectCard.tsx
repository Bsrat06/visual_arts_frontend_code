import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { ProjectForm } from "./ProjectForm"
import { AssignMembersDialog } from "./AssignMembersDialog"

type Props = {
  project: any
  onEdit: (data: any) => void
  onDelete: (id: number) => void
  onAssign: (id: number, memberIds: number[]) => void
  allMembers: any[]
}

export function ProjectCard({ project, onEdit, onDelete, onAssign, allMembers }: Props) {
  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <p className="text-sm text-muted-foreground">{project.description}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Progress: {project.progress}%</p>
        <p className="text-sm mt-2">Members: {project.members.map((id: number) => allMembers.find(m => m.id === id)?.name).join(", ") || "None"}</p>
      </CardContent>
      <CardFooter className="flex gap-2 justify-between">
        <ProjectForm triggerLabel="Edit" initialData={project} onSubmit={onEdit} />
        <AssignMembersDialog
          triggerLabel="Assign"
          members={allMembers}
          assigned={project.members}
          onAssign={(ids) => onAssign(project.id, ids)}
        />
        <Button variant="destructive" onClick={() => onDelete(project.id)}>Delete</Button>
      </CardFooter>
    </Card>
  )
}
