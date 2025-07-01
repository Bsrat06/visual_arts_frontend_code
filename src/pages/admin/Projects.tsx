import { useEffect, useState } from "react";
import API from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Filter, Download, RotateCw, Trash2, Edit, Users, Calendar, Lock, Eye, Check } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "../../hooks/use-debounce";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { ProjectForm } from "../../components/admin/ProjectForm";

const getInitials = (name: string) => {
  const words = name.split(" ");
  const first = words[0]?.charAt(0) || "";
  const last = words[1]?.charAt(0) || "";
  return `${first}${last}`.toUpperCase();
};

type Member = {
  id: number;
  name: string;
  profile_picture?: string;
};

type Project = {
  id: number;
  title: string;
  description: string;
  progress?: number;
  status?: "in_progress" | "completed";
  start_date: string;
  end_date?: string | null;
  members: number[];
  is_completed: boolean;
  image?: string | null;
};

type SortConfig = {
  key: keyof Project;
  direction: "asc" | "desc";
};

type Stats = {
  total: number;
  in_progress: number;
  completed: number;
  recent: number;
};

function ProjectDetailsDialog({ project, members }: { project: Project; members: Member[] }) {
  const assignedMembers = members.filter(m => project.members.includes(m.id));
  return (
    <DialogContent className="max-w-3xl bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-gray-900 dark:text-white">{project.title}</DialogTitle>
        <DialogDescription className="text-muted-foreground">Project details and assigned members</DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Description:</span> {project.description}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Progress:</span> {project.progress ?? 0}%
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Status:</span>{" "}
            <Badge variant={project.status === "completed" ? "destructive" : "default"}>
              {project.status === "completed" ? "Completed" : "In Progress"}
            </Badge>
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Start Date:</span> {new Date(project.start_date).toLocaleDateString()}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Assigned Members:</span> {assignedMembers.length}
          </p>
          {assignedMembers.length > 0 ? (
            <ul className="text-sm space-y-1">
              {assignedMembers.map((member) => (
                <li key={member.id} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={member.profile_picture} />
                    <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  {member.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No members assigned.</p>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

function AssignMembersDialog({ project, members, onAssign, onOpenChange }: { project: Project; members: Member[]; onAssign: (projectId: number, memberIds: number[]) => void; onOpenChange: (open: boolean) => void }) {
  const [selectedMembers, setSelectedMembers] = useState<number[]>(project.members);

  useEffect(() => {
    setSelectedMembers(project.members);
  }, [project.members]);

  const handleCancel = () => {
    setSelectedMembers(project.members);
    onOpenChange(false);
  };

  const handleAssign = () => {
    onAssign(project.id, selectedMembers);
    onOpenChange(false);
  };

  return (
    <DialogContent className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-gray-900 dark:text-white">Assign Members to {project.title}</DialogTitle>
        <DialogDescription className="text-muted-foreground">Select members to assign to this project.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
        {members.map(member => (
          <div key={member.id} className="flex items-center gap-2">
            <Checkbox
              checked={selectedMembers.includes(member.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedMembers([...selectedMembers, member.id]);
                } else {
                  setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                }
              }}
            />
            <Avatar className="h-6 w-6">
              <AvatarImage src={member.profile_picture} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <span>{member.name}</span>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleCancel} className="border-gray-300 dark:border-gray-600">
          Cancel
        </Button>
        <Button onClick={handleAssign}>Assign</Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default function ManageProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [memberFilter, setMemberFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "start_date", direction: "desc" });
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalProjects, setTotalProjects] = useState(0);
  const [stats, setStats] = useState<Stats>({ total: 0, in_progress: 0, completed: 0, recent: 0 });
  const [activeTab, setActiveTab] = useState("all");

  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchProjects = async (page = 1, search = "", status = "all", member = "all") => {
    setIsLoading(true);
    try {
      let url = `/projects/?page=${page}`;
      if (search) url += `&search=${search}`;
      if (status !== "all") url += `&status=${status}`;
      if (member !== "all") url += `&members=${member}`;
      const res = await API.get(url);
      const projects = res.data.results || [];
      console.log('Fetched projects:', projects); // Debug project data
      setProjects(projects);
      setHasNext(!!res.data.next);
      setHasPrev(!!res.data.previous);
      setTotalProjects(res.data.count || 0);
    } catch (error) {
      toast.error("Failed to fetch projects");
      setProjects([]);
      setHasNext(false);
      setHasPrev(false);
      setTotalProjects(0);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      let allMembers: Member[] = [];
      let nextPage: string | null = '/members/';
      while (nextPage) {
        const res = await API.get(nextPage);
        allMembers = [...allMembers, ...(res.data.results || res.data)];
        nextPage = res.data.next;
      }
      setMembers(allMembers);
    } catch (error) {
      toast.error("Failed to fetch members. Please check if the /members/ endpoint is configured.");
      setMembers([]);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/project-stats/");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
      toast.error("Failed to fetch project statistics");
      setStats({ total: 0, in_progress: 0, completed: 0, recent: 0 });
    }
  };

  useEffect(() => {
    setPage(1);
    fetchProjects(1, debouncedSearch, statusFilter, memberFilter);
    fetchMembers();
    fetchStats();
  }, [debouncedSearch, statusFilter, memberFilter, activeTab]);

  const addProject = async (project: any) => {
    try {
      const res = await API.post("/projects/", { ...project, members: [] });
      fetchProjects(page, debouncedSearch, statusFilter, memberFilter);
      fetchStats();
      setShowEditDialog(false);
      toast.success("Project created successfully");
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  const editProject = async (updated: any, id: number | undefined) => {
    try {
      if (!id) {
        toast.error("Project ID is missing. Please select a valid project.");
        return;
      }
      console.log('PATCH payload:', updated);
      await API.patch(`/projects/${id}/`, updated, {
        headers: { 'Content-Type': 'application/json' },
      });
      fetchProjects(page, debouncedSearch, statusFilter, memberFilter);
      fetchStats();
      setShowEditDialog(false);
      toast.success("Project updated successfully");
    } catch (error: any) {
      console.error('PATCH error:', error.response?.data);
      if (error.response?.status === 404) {
        toast.error("Project not found. Refreshing project list...");
        fetchProjects(page, debouncedSearch, statusFilter, memberFilter);
      } else {
        toast.error(error.response?.data?.detail || JSON.stringify(error.response?.data) || "Failed to update project");
      }
    }
  };

  const deleteProject = async (id: number) => {
    setIsLoading(true);
    try {
      await API.delete(`/projects/${id}/`);
      fetchProjects(page, debouncedSearch, statusFilter, memberFilter);
      fetchStats();
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("No projects selected");
      return;
    }
    try {
      await API.post('/projects/bulk-delete/', { project_ids: selectedIds });
      fetchProjects(page, debouncedSearch, statusFilter, memberFilter);
      fetchStats();
      setSelectedIds([]);
      toast.success(`${selectedIds.length} project(s) deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete selected projects");
    }
  };

  const assignMembers = async (projectId: number, memberIds: number[]) => {
    try {
      await API.patch(`/projects/${projectId}/`, { members: memberIds });
      fetchProjects(page, debouncedSearch, statusFilter, memberFilter);
      toast.success("Members assigned successfully");
      setShowAssignDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to assign members");
    }
  };

  const headerKeyMap: Record<string, keyof Project> = {
    Title: "title",
    Progress: "progress",
    "Start Date": "start_date",
  };

  const requestSort = (label: string) => {
    const key = headerKeyMap[label] || "start_date";
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedProjects = [...projects].sort((a, b) => {
    const key = sortConfig.key;
    if (!a[key] || !b[key]) return 0;
    if (a[key]! < b[key]!) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[key]! > b[key]!) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const filteredProjects = sortedProjects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(projects.map(project => project.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectProject = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(projectId => projectId !== id));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const exportToCSV = async () => {
    try {
      const res = await API.get("/projects/?all=true");
      const projects = res.data.results || res.data;
      const headers = ["ID", "Title", "Description", "Progress", "Status", "Start Date", "Assigned Members"];
      const rows = projects.map((project: Project) => [
        project.id,
        `"${project.title}"`,
        `"${project.description.replace(/"/g, '""')}"`,
        project.progress ?? 0,
        project.status ?? (project.is_completed ? "completed" : "in_progress"),
        new Date(project.start_date).toISOString(),
        project.members.length
      ].join(","));

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `projects_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Failed to export projects");
    }
  };

  const completeProject = async (projectId: number) => {
    try {
      await API.post(`/projects/${projectId}/complete/`);
      fetchProjects(page, debouncedSearch, statusFilter, memberFilter);
      fetchStats();
      toast.success("Project marked as completed");
    } catch (error) {
      toast.error("Failed to complete project");
    }
  };

  const handleEdit = (project: Project) => {
    console.log('Selected project for edit:', project); // Debug
    if (!project?.id) {
      toast.error("Invalid project selected. Please try again.");
      return;
    }
    setSelectedProject(project);
    setShowEditDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Projects</h1>
          <p className="text-muted-foreground">Manage all projects and their assignments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchProjects(page, debouncedSearch, statusFilter, memberFilter)} disabled={isLoading}>
            <RotateCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => {
            setSelectedProject(null);
            setShowEditDialog(true);
          }}>
            <Users className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All active projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_progress}</div>
            <p className="text-xs text-muted-foreground">Ongoing projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Lock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finished projects</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recent Projects</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{projects.filter(p => new Date(p.start_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({totalProjects})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({stats.in_progress})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search projects by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Status: {statusFilter === "all" ? "All" : statusFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={memberFilter} onValueChange={setMemberFilter}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Member: {memberFilter === "all" ? "All" : members.find(m => m.id.toString() === memberFilter)?.name || "All"}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {members.map(member => (
                <SelectItem key={member.id} value={member.id.toString()}>{member.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded">
          <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast("Are you sure you want to delete selected projects?", {
                  action: {
                    label: "Delete",
                    onClick: handleBulkDelete,
                  },
                });
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table headers={["", "Title", "Progress", "Status", "Start Date", "Members", "Actions"]}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.length === projects.length && projects.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("Title")} className="p-0">
                  Title
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("Progress")} className="p-0">
                  Progress
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("Start Date")} className="p-0">
                  Start Date
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>Members</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(project.id)}
                      onCheckedChange={(checked) => handleSelectProject(project.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{project.title}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{project.progress ?? 0}%</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.status === "completed" ? "destructive" : "default"}>
                      {project.status === "completed" ? "Completed" : "In Progress"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatDate(project.start_date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {project.members.length > 0 ? (
                        members
                          .filter(m => project.members.includes(m.id))
                          .map(m => (
                            <Avatar key={m.id} className="h-6 w-6">
                              <AvatarImage src={m.profile_picture} />
                              <AvatarFallback>{getInitials(m.name)}</AvatarFallback>
                            </Avatar>
                          ))
                      ) : (
                        <span className="text-sm text-muted-foreground">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedProject(project);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                          onClick={() => handleEdit(project)}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedProject(project);
                            setShowAssignDialog(true);
                          }}
                        >
                          <Users className="w-4 h-4" />
                          Assign Members
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer text-red-600"
                          onClick={() => {
                            toast("Are you sure you want to delete this project?", {
                              action: {
                                label: "Delete",
                                onClick: () => deleteProject(project.id),
                              },
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                          onClick={() => completeProject(project.id)}
                        >
                          <Check className="w-4 h-4" />
                          Mark as Complete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <strong>{filteredProjects.length}</strong> of <strong>{totalProjects}</strong> projects
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(prev => prev - 1)}
            disabled={!hasPrev || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(prev => prev + 1)}
            disabled={!hasNext || isLoading}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        {selectedProject && <ProjectDetailsDialog project={selectedProject} members={members} />}
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">{selectedProject ? "Edit Project" : "Add Project"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Enter project details below.</DialogDescription>
          </DialogHeader>
          <ProjectForm onSubmit={selectedProject ? editProject : addProject} initialData={selectedProject} />
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        {selectedProject && (
          <AssignMembersDialog
            project={selectedProject}
            members={members}
            onAssign={assignMembers}
            onOpenChange={setShowAssignDialog}
          />
        )}
      </Dialog>
    </div>
  );
}