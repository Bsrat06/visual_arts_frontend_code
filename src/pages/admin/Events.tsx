import { useEffect, useState } from "react";
import API from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Filter, Download, RotateCw, Trash2, Image, Eye, Calendar, Lock } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "../../hooks/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { EventForm } from "../../components/admin/EventForm";


type Event = {
  id: number;
  title: string;
  description: string;
  location: string;
  date: string;
  event_cover: string;
  is_completed: boolean;
  attendees: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  }[];
};

type SortConfig = {
  key: keyof Event;
  direction: "asc" | "desc";
};

type Stats = {
  total: number;
  upcoming: number;
  completed: number;
  recent: number;
};

function EventDetailsDialog({ event }: { event: Event }) {
  return (
    <DialogContent className="max-w-3xl bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-gray-900 dark:text-white">{event.title}</DialogTitle>
        <DialogDescription className="text-muted-foreground">Event details and participants</DialogDescription>
      </DialogHeader>
      <div className="space-y-6">
        {event.event_cover && (
          <img
            src={event.event_cover}
            alt={event.title}
            className="w-full h-96 object-contain rounded-md border border-gray-200 dark:border-gray-700"
          />
        )}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Description:</span> {event.description}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Date:</span> {new Date(event.date).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Location:</span> {event.location}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Status:</span>{" "}
            <Badge variant={event.is_completed ? "destructive" : "default"}>
              {event.is_completed ? "Completed" : "Upcoming"}
            </Badge>
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Participants:</span> {event.attendees.length}
          </p>
          {event.attendees.length > 0 ? (
            <ul className="text-sm space-y-1">
              {event.attendees.map((user) => (
                <li key={user.id}>
                  👤 {user.first_name} {user.last_name} – {user.email}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No one has registered yet.</p>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

export default function ManageEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "date", direction: "desc" });
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const [stats, setStats] = useState<Stats>({ total: 0, upcoming: 0, completed: 0, recent: 0 });
  const [activeTab, setActiveTab] = useState("all");

  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchEvents = async (page = 1, search = "", status = "all", location = "all") => {
    setIsLoading(true);
    try {
      let url = `/events/?page=${page}`;
      if (search) url += `&search=${search}`;
      if (status !== "all") url += `&is_completed=${status === "completed"}`;
      if (location !== "all") url += `&location=${location}`;

      const res = await API.get(url);
      setEvents(res.data.results || []);
      setHasNext(!!res.data.next);
      setHasPrev(!!res.data.previous);
      setTotalEvents(res.data.count || 0);
    } catch (error) {
      toast.error("Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("event-stats/");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
      toast.error("Failed to fetch event statistics");
      setStats({ total: 0, upcoming: 0, completed: 0, recent: 0 });
    }
  };

  useEffect(() => {
    fetchEvents(page, debouncedSearch, statusFilter, locationFilter);
    fetchStats();
  }, [page, debouncedSearch, statusFilter, locationFilter, activeTab]);

  const handleDelete = async (id: number) => {
    try {
      await API.delete(`/events/${id}/`);
      fetchEvents(page, debouncedSearch, statusFilter, locationFilter);
      fetchStats();
      toast.success("Event deleted successfully");
    } catch (error) {
      toast.error("Failed to delete event");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning("No events selected");
      return;
    }
    try {
      await Promise.all(selectedIds.map(id => API.delete(`/events/${id}/`)));
      fetchEvents(page, debouncedSearch, statusFilter, locationFilter);
      fetchStats();
      setSelectedIds([]);
      toast.success(`${selectedIds.length} event(s) deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete selected events");
    }
  };

  const headerKeyMap: Record<string, keyof Event> = {
    Title: "title",
    Date: "date",
    Location: "location",
  };

  const requestSort = (label: string) => {
    const key = headerKeyMap[label] || "date";
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedEvents = [...events].sort((a, b) => {
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

  const filteredEvents = sortedEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(events.map(event => event.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectEvent = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(eventId => eventId !== id));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (title: string) => {
    const words = title.split(" ");
    const first = words[0]?.charAt(0) || "";
    const last = words[1]?.charAt(0) || "";
    return `${first}${last}`.toUpperCase();
  };

  const locations = Array.from(new Set(events.map(event => event.location))).filter(location => location && location.trim());

  const exportToCSV = () => {
    const headers = ["ID", "Title", "Description", "Location", "Date", "Status", "Participants"];
    const rows = events.map(event => [
      event.id,
      `"${event.title}"`,
      `"${event.description.replace(/"/g, '""')}"`,
      `"${event.location}"`,
      new Date(event.date).toISOString(),
      event.is_completed ? "Completed" : "Upcoming",
      event.attendees.length
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `events_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateEvent = async (data: any) => {
    try {

      const formattedDate = new Date(data.date).toISOString().split('T')[0];
      
      // Create FormData for file upload support
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('location', data.location);
      formData.append('date', formattedDate);
      formData.append('description', data.description || '');
      
      // Append file if it exists
      if (data.event_cover && data.event_cover[0]) {
        formData.append('event_cover', data.event_cover[0]);
      }

      // Get auth token if needed
      const token = localStorage.getItem('token'); // or your auth token storage method

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` }) // Add auth header if token exists
        }
      };

      const res = await API.post('/events/', formData, config);
      fetchEvents(page, debouncedSearch, statusFilter, locationFilter);
      fetchStats();
      toast.success("Event created successfully");
      return true;
    } catch (error) {
      console.error("Error details:", error.response?.data); // Log detailed error
      toast.error(error.response?.data?.message || "Failed to create event");
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Events</h1>
          <p className="text-muted-foreground">Manage all events and their participants</p>
        </div>
        

          <div className="flex gap-2">
            <EventForm 
              triggerLabel="Add Event"
              onSubmit={handleCreateEvent}
            />
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={() => fetchEvents(page, debouncedSearch, statusFilter, locationFilter)} disabled={isLoading}>
              <RotateCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All scheduled events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">Scheduled events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Completed Events</CardTitle>
            <Lock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Past events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{events.filter(event => new Date(event.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({totalEvents})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({stats.upcoming})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search events by title, description, or location..."
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
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Location: {locationFilter === "all" ? "All" : locationFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(location => (
                <SelectItem key={location} value={location}>{location}</SelectItem>
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
                toast("Are you sure you want to delete selected events?", {
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
        <Table headers={["", "Cover", "Title", "Date", "Location", "Status", "Participants", "Actions"]}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.length === events.length && events.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Cover</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("Title")} className="p-0">
                  Title
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("Date")} className="p-0">
                  Date
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("Location")} className="p-0">
                  Location
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(event.id)}
                      onCheckedChange={(checked) => handleSelectEvent(event.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    {event.event_cover && (
                      <img
                        src={event.event_cover}
                        alt={event.title}
                        className="w-8 h-8 object-cover rounded-md cursor-pointer hover:scale-105 transition-transform"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowDetailsDialog(true);
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{event.title}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(event.date)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{event.location}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.is_completed ? "destructive" : "default"}>
                      {event.is_completed ? "Completed" : "Upcoming"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{event.attendees.length}</div>
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
                            setSelectedEvent(event);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer text-red-600"
                          onClick={() => {
                            toast("Are you sure you want to delete this event?", {
                              action: {
                                label: "Delete",
                                onClick: () => handleDelete(event.id),
                              },
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
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
          Showing <strong>{filteredEvents.length}</strong> of <strong>{totalEvents}</strong> events
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
        {selectedEvent && <EventDetailsDialog event={selectedEvent} />}
      </Dialog>
    </div>
  );
}