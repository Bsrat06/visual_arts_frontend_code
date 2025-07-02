import { useEffect, useState } from "react";
import API from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Filter, Download, RotateCw, Trash2, Eye, Bell, Send, Users} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "../../hooks/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/ui/tooltip";

type Notification = {
  id: number;
  message: string;
  notification_type: string;
  target_role: string;
  is_read: boolean;
  created_at: string;
  priority: "low" | "medium" | "high";
  sender?: { name: string; profile_picture?: string };
};

type SortConfig = {
  key: keyof Notification;
  direction: "asc" | "desc";
};

type Stats = {
  total: number;
  sent_today: number;
  artwork_approved: number;
  event_update: number;
  project_invite: number;
};

const typeColors: Record<string, string> = {
  artwork_approved: "bg-teal-500 hover:bg-teal-600",
  event_update: "bg-blue-500 hover:bg-blue-600",
  project_invite: "bg-purple-500 hover:bg-purple-600",
};

const priorityColors: Record<string, string> = {
  low: "bg-green-500 hover:bg-green-600",
  medium: "bg-yellow-500 hover:bg-yellow-600",
  high: "bg-red-500 hover:bg-red-600",
};

const getInitials = (name: string) => {
  const words = name.split(" ");
  const first = words[0]?.charAt(0) || "";
  const last = words[1]?.charAt(0) || "";
  return `${first}${last}`.toUpperCase();
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

function NotificationTimelineCard({ notification }: { notification: Notification }) {
  const senderName = notification.sender?.name || "System";
  return (
    <div className="relative flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm transition-transform hover:scale-[1.01] hover:shadow-md">
      <div className="absolute left-3 top-[-16px] h-4 w-4 rounded-full bg-blue-500"></div>
      <div className="absolute left-3.5 top-4 bottom-[-16px] w-0.5 bg-blue-500"></div>
      <Avatar className="h-8 w-8">
        <AvatarImage src={notification.sender?.profile_picture} />
        <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">{senderName}</h3>
          <span className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge className={`capitalize ${typeColors[notification.notification_type] || "bg-gray-500 hover:bg-gray-600"}`}>
            {notification.notification_type.replace("_", " ")}
          </Badge>
          <Badge className={`capitalize ${priorityColors[notification.priority] || "bg-gray-500 hover:bg-gray-600"}`}>
            {notification.priority}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
        <Badge variant={notification.is_read ? "secondary" : "default"} className={`mt-2 ${!notification.is_read ? "animate-pulse" : ""}`}>
          {notification.is_read ? "Read" : "Unread"}
        </Badge>
      </div>
    </div>
  );
}

function NotificationDetailsDialog({ notification }: { notification: Notification }) {
  const senderName = notification.sender?.name || "System";
  return (
    <DialogContent className="max-w-3xl bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-gray-900 dark:text-white">Notification Details</DialogTitle>
        <DialogDescription className="text-muted-foreground">View full details of the notification</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={notification.sender?.profile_picture} />
            <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{senderName}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Message:</span> {notification.message}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Type:</span>{" "}
          <Badge className={typeColors[notification.notification_type] || "bg-gray-500 hover:bg-gray-600"}>
            {notification.notification_type.replace("_", " ")}
          </Badge>
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Priority:</span>{" "}
          <Badge className={priorityColors[notification.priority] || "bg-gray-500 hover:bg-gray-600"}>{notification.priority}</Badge>
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Target Role:</span> {notification.target_role}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Status:</span>{" "}
          <Badge variant={notification.is_read ? "secondary" : "default"}>{notification.is_read ? "Read" : "Unread"}</Badge>
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Sent:</span> {formatDate(notification.created_at)}
        </p>
      </div>
    </DialogContent>
  );
}

function SendNotificationDialog({ onSend }: { onSend: (role: string, message: string, type: string, priority: string) => void }) {
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("project_invite");
  const [priority, setPriority] = useState("medium");
  const [isValid, setIsValid] = useState(false);
  const maxMessageLength = 500;

  useEffect(() => {
    setIsValid(role.trim() !== "" && message.trim() !== "" && message.length <= maxMessageLength);
  }, [role, message]);

  const handleSend = () => {
    if (isValid) {
      onSend(role, message, type, priority);
      setRole("");
      setMessage("");
      setType("project_invite");
      setPriority("medium");
    }
  };

  return (
    <DialogContent className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
      <DialogHeader>
        <DialogTitle className="text-gray-900 dark:text-white">Send Bulk Notification</DialogTitle>
        <DialogDescription className="text-muted-foreground">Send a notification to users with the selected role.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Target Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Notification Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="artwork_approved">Artwork Approved</SelectItem>
                <SelectItem value="event_update">Event Update</SelectItem>
                <SelectItem value="project_invite">Project Invitation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Priority</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Message</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Enter your notification message..."
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
            <p className={`text-sm ${message.length > maxMessageLength ? "text-red-600" : "text-muted-foreground"}`}>
              {message.length}/{maxMessageLength} characters
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900 dark:text-white">Preview</label>
          <div className="p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials("System")}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-900 dark:text-white">System</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={typeColors[type] || "bg-gray-500 hover:bg-gray-600"}>{type.replace("_", " ")}</Badge>
              <Badge className={priorityColors[priority] || "bg-gray-500 hover:bg-gray-600"}>{priority}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{message || "Enter a message to preview..."}</p>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            setRole("");
            setMessage("");
            setType("project_invite");
            setPriority("medium");
          }}
          className="border-gray-300 dark:border-gray-600"
        >
          Cancel
        </Button>
        <Button onClick={handleSend} disabled={!isValid}>
          Send
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "created_at", direction: "desc" });
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [stats, setStats] = useState<Stats>({ total: 0, sent_today: 0, artwork_approved: 0, event_update: 0, project_invite: 0 });
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");

  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchNotifications = async (page = 1, search = "", type = "all", role = "all", status = "all") => {
    setIsLoading(true);
    try {
      let url = `/notifications/?page=${page}`;
      if (search) url += `&search=${search}`;
      if (type !== "all") url += `&notification_type=${type}`;
      if (role !== "all") url += `&target_role=${role}`;
      if (status !== "all") url += `&is_read=${status === "read"}`;

      const res = await API.get(url);
      setNotifications(res.data.results || []);
      setHasNext(!!res.data.next);
      setHasPrev(!!res.data.previous);
      setTotalNotifications(res.data.count || 0);
    } catch (error) {
      toast.error("Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/notifications/stats/");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
      toast.error("Failed to fetch notification statistics");
      setStats({ total: 0, sent_today: 0, artwork_approved: 0, event_update: 0, project_invite: 0 });
    }
  };

  useEffect(() => {
    fetchNotifications(page, debouncedSearch, typeFilter, roleFilter, statusFilter);
    fetchStats();
  }, [page, debouncedSearch, typeFilter, roleFilter, statusFilter]);

  const handleSendNotification = async (role: string, message: string, type: string, priority: string) => {
    try {
      await API.post("/notifications/send_bulk/", { role, message, notification_type: type, priority });
      toast.success("Notification sent successfully");
      fetchNotifications(page, debouncedSearch, typeFilter, roleFilter, statusFilter);
      fetchStats();
      setShowSendDialog(false);
    } catch (error) {
      toast.error("Failed to send notification");
    }
  };

  const handleResendNotification = async (notification: Notification) => {
    try {
      await API.post("/notifications/send_bulk/", {
        role: notification.target_role,
        message: notification.message,
        notification_type: notification.notification_type,
        priority: notification.priority,
      });
      toast.success("Notification resent successfully");
      fetchNotifications(page, debouncedSearch, typeFilter, roleFilter, statusFilter);
      fetchStats();
    } catch (error) {
      toast.error("Failed to resend notification");
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await API.patch(`/notifications/${id}/`, { is_read: true });
      fetchNotifications(page, debouncedSearch, typeFilter, roleFilter, statusFilter);
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAsUnread = async (id: number) => {
    try {
      await API.patch(`/notifications/${id}/`, { is_read: false });
      fetchNotifications(page, debouncedSearch, typeFilter, roleFilter, statusFilter);
      toast.success("Notification marked as unread");
    } catch (error) {
      toast.error("Failed to mark notification as unread");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await API.delete(`/notifications/${id}/`);
      fetchNotifications(page, debouncedSearch, typeFilter, roleFilter, statusFilter);
      fetchStats();
      toast.success("Notification deleted successfully");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleBulkAction = async (action: "read" | "unread" | "delete") => {
    if (selectedIds.length === 0) {
      toast.warning("No notifications selected");
      return;
    }
    try {
      await Promise.all(
        selectedIds.map(id =>
          action === "delete"
            ? API.delete(`/notifications/${id}/`)
            : API.patch(`/notifications/${id}/`, { is_read: action === "read" })
        )
      );
      fetchNotifications(page, debouncedSearch, typeFilter, roleFilter, statusFilter);
      fetchStats();
      setSelectedIds([]);
      toast.success(`${selectedIds.length} notification(s) ${action === "delete" ? "deleted" : `marked as ${action}`}`);
    } catch (error) {
      toast.error(`Failed to ${action} selected notifications`);
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setRoleFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  const headerKeyMap: Record<string, keyof Notification> = {
    Message: "message",
    "Sent Date": "created_at",
    Type: "notification_type",
    Priority: "priority",
  };

  const requestSort = (label: string) => {
    const key = headerKeyMap[label] || "created_at";
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
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

  const filteredNotifications = sortedNotifications.filter(notification =>
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(notifications.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectNotification = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(nId => nId !== id));
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Message", "Type", "Priority", "Target Role", "Status", "Sent Date", "Sender"];
    const rows = notifications.map(n => [
      n.id,
      `"${n.message.replace(/"/g, '""')}"`,
      n.notification_type,
      n.priority,
      n.target_role,
      n.is_read ? "Read" : "Unread",
      new Date(n.created_at).toISOString(),
      n.sender?.name || "System",
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `notifications_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Manage and send notifications to users</p>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export notifications to CSV</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNotifications(page, debouncedSearch, typeFilter, roleFilter, statusFilter)}
                  disabled={isLoading}
                >
                  <RotateCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh notifications</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={() => setShowSendDialog(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Notification
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a new notification</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All notifications</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
              <Send className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.sent_today}</div>
              <p className="text-xs text-muted-foreground">Notifications sent today</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Artwork Approved</CardTitle>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.artwork_approved}</div>
              <p className="text-xs text-muted-foreground">Approval notifications</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Project Invitations</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.project_invite}</div>
              <p className="text-xs text-muted-foreground">Invitation notifications</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "timeline")}>
          <TabsList>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({totalNotifications})</TabsTrigger>
            <TabsTrigger value="read">Read ({notifications.filter(n => n.is_read).length})</TabsTrigger>
            <TabsTrigger value="unread">Unread ({notifications.filter(n => !n.is_read).length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search notifications by message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Type: {typeFilter === "all" ? "All" : typeFilter.replace("_", " ")}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="artwork_approved">Artwork Approved</SelectItem>
                <SelectItem value="event_update">Event Update</SelectItem>
                <SelectItem value="project_invite">Project Invitation</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>Role: {roleFilter === "all" ? "All" : roleFilter}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-muted rounded">
            <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("read")}>
                    Mark as Read
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark selected as read</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction("unread")}>
                    Mark as Unread
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Mark selected as unread</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast("Are you sure you want to delete selected notifications?", {
                        action: {
                          label: "Delete",
                          onClick: () => handleBulkAction("delete"),
                        },
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete selected notifications</TooltipContent>
              </Tooltip>
            </div>
          </div>
        )}

        {viewMode === "table" ? (
          <div className="rounded-md border">
            <Table headers={["", "Sender", "Message", "Type", "Priority", "Target Role", "Status", "Sent Date", "Actions"]}>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={selectedIds.length === notifications.length && notifications.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort("Message")} className="p-0">
                      Message
                      <ArrowUpDown className="w-4 h-4 ml-2" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort("Type")} className="p-0">
                      Type
                      <ArrowUpDown className="w-4 h-4 ml-2" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort("Priority")} className="p-0">
                      Priority
                      <ArrowUpDown className="w-4 h-4 ml-2" />
                    </Button>
                  </TableHead>
                  <TableHead>Target Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort("Sent Date")} className="p-0">
                      Sent Date
                      <ArrowUpDown className="w-4 h-4 ml-2" />
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No notifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(notification.id)}
                          onCheckedChange={(checked) => handleSelectNotification(notification.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={notification.sender?.profile_picture} />
                            <AvatarFallback>{getInitials(notification.sender?.name || "System")}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{notification.sender?.name || "System"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className="text-sm line-clamp-1 cursor-pointer hover:underline">
                              {notification.message}
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeColors[notification.notification_type] || "bg-gray-500 hover:bg-gray-600"}>
                          {notification.notification_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[notification.priority] || "bg-gray-500 hover:bg-gray-600"}>{notification.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{notification.target_role}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={notification.is_read ? "secondary" : "default"} className={!notification.is_read ? "animate-pulse" : ""}>
                          {notification.is_read ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(notification.created_at)}</div>
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
                                setSelectedNotification(notification);
                                setShowDetailsDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                              onClick={() => notification.is_read ? handleMarkAsUnread(notification.id) : handleMarkAsRead(notification.id)}
                            >
                              <Eye className="w-4 h-4" />
                              Mark as {notification.is_read ? "Unread" : "Read"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                              onClick={() => handleResendNotification(notification)}
                            >
                              <Send className="w-4 h-4" />
                              Resend
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer text-red-600"
                              onClick={() => {
                                toast("Are you sure you want to delete this notification?", {
                                  action: {
                                    label: "Delete",
                                    onClick: () => handleDelete(notification.id),
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
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {filteredNotifications.length === 0 ? (
              <p className="text-center text-muted-foreground">No notifications found</p>
            ) : (
              filteredNotifications.map((notification) => (
                <div key={notification.id} className={`${!notification.is_read ? "shadow-[0_0_8px_rgba(59,130,246,0.5)]" : ""}`}>
                  <NotificationTimelineCard notification={notification} />
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing <strong>{filteredNotifications.length}</strong> of <strong>{totalNotifications}</strong> notifications
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
          {selectedNotification && <NotificationDetailsDialog notification={selectedNotification} />}
        </Dialog>

        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <SendNotificationDialog onSend={handleSendNotification} />
        </Dialog>
      </div>
    </TooltipProvider>
  );
}