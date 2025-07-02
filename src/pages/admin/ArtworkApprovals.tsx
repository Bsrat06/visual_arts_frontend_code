import { useEffect, useState } from "react";
import API from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Checkbox } from "../../components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown, Filter, Download, RotateCw, Mail, Trash2, Eye, Lock, Image } from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "../../hooks/use-debounce";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../../components/ui/dialog";

type Artwork = {
  id: number;
  title: string;
  image: string;
  description: string;
  category: string;
  artist_name: string;
  artist_email: string;
  submission_date: string;
  rejection_count?: number;
  approval_status: "pending" | "approved" | "rejected";
};

type SortConfig = {
  key: keyof Artwork;
  direction: "asc" | "desc";
};

type Stats = {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
};

function ArtworkDetailsPopover({ artwork }: { artwork: Artwork }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <DropdownMenuItem className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer">
          <Eye className="w-4 h-4" />
          View Details
        </DropdownMenuItem>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
        <div className="space-y-4">
          <img
            src={artwork.image}
            alt={artwork.title}
            className="w-full h-48 object-contain rounded-md border border-gray-200 dark:border-gray-700"
          />
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{artwork.title}</h4>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Artist:</span> {artwork.artist_name}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Email:</span> {artwork.artist_email}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Category:</span> {artwork.category}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Submitted:</span> {new Date(artwork.submission_date).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Status:</span> 
            <Badge
              variant={artwork.approval_status === "approved" ? "default" : 
                      artwork.approval_status === "rejected" ? "destructive" : "secondary"} 
              className="ml-2"
            >
              {artwork.approval_status}
            </Badge>
          </p>
          {artwork.rejection_count && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Rejection Count:</span> {artwork.rejection_count}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Description:</span> {artwork.description}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function ArtworkApprovals() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [feedback, setFeedback] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "submission_date", direction: "desc" });
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [totalArtworks, setTotalArtworks] = useState(0);
  const [activeTab, setActiveTab] = useState("all");

  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchArtworks = async (page = 1, search = "", status = "all", category = "all") => {
    setIsLoading(true);
    try {
      let url = `/artwork/?page=${page}`;
      if (search) url += `&search=${search}`;
      if (status !== "all") url += `&approval_status=${status}`;
      if (category !== "all") url += `&category=${category}`;

      const res = await API.get(url);
      setArtworks(res.data.results || []);
      setHasNext(!!res.data.next);
      setHasPrev(!!res.data.previous);
      setTotalArtworks(res.data.count || 0);
    } catch (error) {
      toast.error("Failed to fetch artworks");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/artworks/stats/");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
      toast.error("Failed to fetch artwork statistics");
      setStats({ pending: 0, approved: 0, rejected: 0, total: 0 });
    }
  };

  useEffect(() => {
    fetchArtworks(page, debouncedSearch, statusFilter, categoryFilter);
    fetchStats();
  }, [page, debouncedSearch, statusFilter, categoryFilter, activeTab]);

  const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, rejected: 0, total: 0 });

  const handleApprove = async (id: number) => {
    try {
      await API.patch(`/artwork/${id}/approve/`);
      fetchArtworks(page, debouncedSearch, statusFilter, categoryFilter);
      fetchStats();
      setShowDialog(false);
      toast.success("Artwork approved successfully");
    } catch (error) {
      toast.error("Failed to approve artwork");
    }
  };

  const handleBulkApprove = async () => {
    try {
      await Promise.all(selectedIds.map(id => API.patch(`/artwork/${id}/approve/`)));
      fetchArtworks(page, debouncedSearch, statusFilter, categoryFilter);
      fetchStats();
      setSelectedIds([]);
      toast.success(`${selectedIds.length} artwork(s) approved successfully`);
    } catch (error) {
      toast.error("Failed to approve selected artworks");
    }
  };

  const handleReject = async () => {
    if (!selected || !feedback.trim()) {
      toast.error("Feedback is required to reject an artwork");
      return;
    }
    try {
      await API.patch(`/artwork/${selected.id}/reject/`, { feedback });
      fetchArtworks(page, debouncedSearch, statusFilter, categoryFilter);
      fetchStats();
      setShowDialog(false);
      setFeedback("");
      toast.success("Artwork rejected with feedback");
    } catch (error) {
      toast.error("Failed to reject artwork");
    }
  };

  const handleBulkReject = async () => {
    if (!feedback.trim()) {
      toast.error("Feedback is required for bulk rejection");
      return;
    }
    try {
      await Promise.all(selectedIds.map(id => API.patch(`/artwork/${id}/reject/`, { feedback })));
      fetchArtworks(page, debouncedSearch, statusFilter, categoryFilter);
      fetchStats();
      setSelectedIds([]);
      setShowDialog(false);
      setFeedback("");
      toast.success(`${selectedIds.length} artwork(s) rejected with feedback`);
    } catch (error) {
      toast.error("Failed to reject selected artworks");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await API.delete(`/artwork/${id}/`);
      fetchArtworks(page, debouncedSearch, statusFilter, categoryFilter);
      fetchStats();
      toast.success("Artwork deleted successfully");
    } catch (error) {
      toast.error("Failed to delete artwork");
    }
  };

  const handleUnapprove = async (id: number) => {
    try {
      await API.patch(`/artwork/${id}/reject/`, { feedback: "Removed from approved collection" });
      fetchArtworks(page, debouncedSearch, statusFilter, categoryFilter);
      fetchStats();
      toast.success("Artwork unapproved successfully");
    } catch (error) {
      toast.error("Failed to unapprove artwork");
    }
  };

  const headerKeyMap: Record<string, keyof Artwork> = {
    Title: "title",
    Artist: "artist_name",
    Category: "category",
    Submitted: "submission_date",
  };

  const requestSort = (label: string) => {
    const key = headerKeyMap[label] || "submission_date";
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedArtworks = [...artworks].sort((a, b) => {
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

  const filteredArtworks = sortedArtworks.filter(art =>
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.artist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(artworks.map(art => art.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectArtwork = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(artId => artId !== id));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (artistName: string) => {
    const names = artistName.split(" ");
    const first = names[0]?.charAt(0) || "";
    const last = names[1]?.charAt(0) || "";
    return `${first}${last}`.toUpperCase();
  };

  const categories = Array.from(new Set(artworks.map(art => art.category))).filter(category => category && category.trim());

  const exportToCSV = () => {
    const headers = ["ID", "Title", "Artist", "Category", "Status", "Submission Date"];
    const rows = artworks.map(art => [
      art.id,
      `"${art.title}"`,
      `"${art.artist_name}"`,
      `"${art.category}"`,
      `"${art.approval_status}"`,
      new Date(art.submission_date).toISOString()
    ].join(","));

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `artwork_approvals_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Artwork Approvals</h1>
          <p className="text-muted-foreground">Manage all artwork submissions and approvals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchArtworks(page, debouncedSearch, statusFilter, categoryFilter)} disabled={isLoading}>
            <RotateCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({totalArtworks})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
            <Image className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All submitted artworks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Pending Artworks</CardTitle>
            <Eye className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Approved Artworks</CardTitle>
            <Lock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Approved submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recent Submissions</CardTitle>
            <Mail className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{artworks.filter(art => new Date(art.submission_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search artworks by title, artist, or description..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Category: {categoryFilter === "all" ? "All" : categoryFilter}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-muted rounded">
          <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleBulkApprove}>
              Approve
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowDialog(true)}>
              Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast("Are you sure you want to delete selected artworks?", {
                  action: {
                    label: "Delete",
                    onClick: () => Promise.all(selectedIds.map(id => handleDelete(id))),
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
        <Table headers={["", "Preview", "Title", "Artist", "Category", "Status", "Submitted", "Actions"]}>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.length === artworks.length && artworks.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("Title")} className="p-0">
                  Title
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("Artist")} className="p-0">
                  Artist
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("Category")} className="p-0">
                  Category
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort("Submitted")} className="p-0">
                  Submitted
                  <ArrowUpDown className="w-4 h-4 ml-2" />
                </Button>
              </TableHead>
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
            ) : filteredArtworks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No artworks found
                </TableCell>
              </TableRow>
            ) : (
              filteredArtworks.map((art) => (
                <TableRow key={art.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(art.id)}
                      onCheckedChange={(checked) => handleSelectArtwork(art.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-8 h-8 object-cover rounded-md cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => {
                        setSelected(art);
                        setShowPreviewDialog(true);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{art.title}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={art.image} />
                        <AvatarFallback>{getInitials(art.artist_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{art.artist_name}</div>
                        <div className="text-xs text-muted-foreground">{art.artist_email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{art.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={art.approval_status === "approved" ? "default" : art.approval_status === "rejected" ? "destructive" : "secondary"}>
                      {art.approval_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(art.submission_date)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                        <ArtworkDetailsPopover artwork={art} />
                        {art.approval_status === "pending" && (
                          <>
                            <DropdownMenuItem
                              className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                              onClick={() => handleApprove(art.id)}
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer text-red-600"
                              onClick={() => {
                                setSelected(art);
                                setShowDialog(true);
                              }}
                            >
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        {art.approval_status === "approved" && (
                          <DropdownMenuItem
                            className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer text-red-600"
                            onClick={() => {
                              toast("Are you sure you want to unapprove this artwork?", {
                                action: {
                                  label: "Unapprove",
                                  onClick: () => handleUnapprove(art.id),
                                },
                              });
                            }}
                          >
                            Unapprove
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer text-red-600"
                          onClick={() => {
                            toast("Are you sure you want to delete this artwork?", {
                              action: {
                                label: "Delete",
                                onClick: () => handleDelete(art.id),
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
          Showing <strong>{filteredArtworks.length}</strong> of <strong>{totalArtworks}</strong> artworks
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {selectedIds.length > 0
                ? `Reject ${selectedIds.length} Selected Artwork(s)`
                : `Reject Artwork: ${selected?.title || "Unknown"}`}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Provide feedback for the rejection. This will be sent to the artist(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter rejection feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="border-gray-300 dark:border-gray-600"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={selectedIds.length > 0 ? handleBulkReject : handleReject}
              disabled={!feedback.trim() || (!selectedIds.length && !selected)}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">{selected?.title || "Artwork Preview"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Preview the artwork details and image</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-6">
              <img
                src={selected.image}
                alt={selected.title}
                className="w-full h-96 object-contain rounded-md border border-gray-200 dark:border-gray-700"
              />
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Artist:</span> {selected.artist_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Email:</span> {selected.artist_email}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Category:</span> {selected.category}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Submitted:</span> {formatDate(selected.submission_date)}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Status:</span>{" "}
                  <Badge
                    variant={
                      selected.approval_status === "approved" ? "default" :
                      selected.approval_status === "rejected" ? "destructive" : "secondary"
                    }
                  >
                    {selected.approval_status}
                  </Badge>
                </p>
                {selected.rejection_count && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Rejection Count:</span> {selected.rejection_count}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Description:</span> {selected.description}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No artwork selected</p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
              className="border-gray-300 dark:border-gray-600"
            >
              Close
            </Button>
            {selected && selected.approval_status === "pending" && (
              <>
                <Button onClick={() => handleApprove(selected.id)}>
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowPreviewDialog(false);
                    setShowDialog(true);
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            {selected && selected.approval_status === "approved" && (
              <Button
                variant="destructive"
                onClick={() => {
                  toast("Are you sure you want to unapprove this artwork?", {
                    action: {
                      label: "Unapprove",
                      onClick: () => handleUnapprove(selected.id),
                    },
                  });
                }}
              >
                Unapprove
              </Button>
            )}
            {selected && (
              <Button
                variant="outline"
                onClick={() => {
                  toast("Are you sure you want to delete this artwork?", {
                    action: {
                      label: "Delete",
                      onClick: () => handleDelete(selected.id),
                    },
                  });
                }}
                className="border-gray-300 dark:border-gray-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}