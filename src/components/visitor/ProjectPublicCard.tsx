import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Progress } from "../../components/ui/progress"

type Props = {
  project: {
    title: string
    description: string
    progress: number
  }
}

export function ProjectPublicCard({ project }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <p className="text-sm text-muted-foreground">Progress: {project.progress}%</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{project.description}</p>
        <Progress value={project.progress} />
      </CardContent>
    </Card>
  )
}
