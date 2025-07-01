import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"

type Props = {
  project: any
  joined: boolean
  onToggle: (id: number) => void
}

export function ProjectCard({ project, joined, onToggle }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <p className="text-sm text-muted-foreground">Progress: {project.progress}%</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">{project.description}</p>
        <Progress value={project.progress} />
      </CardContent>
      <CardFooter>
        <Button variant={joined ? "destructive" : "default"} onClick={() => onToggle(project.id)}>
          {joined ? "Leave Project" : "Join Project"}
        </Button>
      </CardFooter>
    </Card>
  )
}
