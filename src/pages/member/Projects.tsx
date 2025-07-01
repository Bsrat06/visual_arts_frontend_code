import { useMemberProjects } from "../../hooks/use-member-projects"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Skeleton } from "../../components/ui/skeleton"

export default function MemberProjects() {
  const { projects, loading } = useMemberProjects()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Projects</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full" />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>{project.description}</p>
                <p>Status: <span className="font-medium">{project.status}</span></p>
                <p>Duration: {project.start_date} - {project.end_date}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">You are not part of any projects yet.</p>
      )}
    </div>
  )
}
