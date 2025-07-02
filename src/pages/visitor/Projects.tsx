import { useEffect } from "react";
import { usePublicProjects } from "../../hooks/use-public-projects";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Calendar, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip";
import { Progress } from "../../components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";

// interface Project {
//   id: number;
//   title: string;
//   description: string;
//   status?: string; // Made optional
//   start_date: string;
//   end_date: string;
// }

interface ProjectStatusBadgeProps {
  status?: string;
}

const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    planning: { label: "Planning", variant: "secondary" },
    active: { label: "Active", variant: "default" },
    completed: { label: "Completed", variant: "outline" },
    archived: { label: "Archived", variant: "destructive" }
  };

  const defaultStatus = { label: "Unknown", variant: "outline" as const };
  const currentStatus = status ? statusMap[status.toLowerCase()] || defaultStatus : defaultStatus;

  return (
    <Badge variant={currentStatus.variant} className="capitalize">
      {currentStatus.label}
    </Badge>
  );
};

const formatDate = (dateString: string) => {
  try {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Invalid date format:", dateString);
    return dateString;
  }
};

const calculateProgress = (startDate: string, endDate: string) => {
  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    return Math.round(((now - start) / (end - start)) * 100);
  } catch (error) {
    console.error("Error calculating progress:", error);
    return 0;
  }
};

export default function VisitorProjects() {
  const { projects = [], loading, error } = usePublicProjects();

  // Debugging: Log the data we receive
  useEffect(() => {
    console.log("Projects data:", projects);
    console.log("Loading state:", loading);
    console.log("Error state:", error);
  }, [projects, loading, error]);

  return (
    <TooltipProvider>
      <div className="space-y-8 p-4 md:p-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Featured Art Projects</h1>
          <p className="text-muted-foreground max-w-2xl">
            Explore our curated collection of visual arts projects from talented artists of our club
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading projects</AlertTitle>
            <AlertDescription>
              {typeof error === 'string' ? error : 'Failed to load projects. Please try again later.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-video w-full rounded-b-none" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16 rounded-full" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Empty State */}
            {projects.length === 0 && !error && (
              <Card className="text-center p-12">
                <div className="space-y-4">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No projects available</h3>
                  <p className="text-muted-foreground text-sm">
                    Check back later for upcoming art projects and collaborations
                  </p>
                </div>
              </Card>
            )}

            {/* Success State */}
            {projects.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => {
                  const progress = calculateProgress(project.start_date, project.end_date);
                  const isActive = project.status ? project.status.toLowerCase() === 'active' : false;
                  
                  return (
                    <Card key={project.id} className="group overflow-hidden transition-all hover:shadow-lg">
                      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                        <Calendar className="w-12 h-12 text-muted-foreground" />
                        <div className="absolute top-3 left-3">
                          <ProjectStatusBadge status={project.status} />
                        </div>
                      </div>
                      
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg line-clamp-2">{project.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description || "No description available"}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Timeline</span>
                            </div>
                            <span className="font-medium">
                              {formatDate(project.start_date)} - {formatDate(project.end_date)}
                            </span>
                          </div>
                          
                          {isActive && (
                            <Tooltip>
                              <TooltipTrigger className="w-full">
                                <Progress 
                                  value={progress} 
                                  className={
                                    progress < 30 ? 'bg-emerald-500' : 
                                    progress < 70 ? 'bg-blue-500' : 'bg-rose-500'
                                  }
                                />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{progress}% of project duration completed</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </CardContent>
                      
                      <CardFooter>
                        <Button variant="outline" className="w-full group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                          View Project
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </TooltipProvider>
  );
}