import { useEffect, useState } from "react";
import API from "../../lib/api";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip";
import { Download, RotateCw, Filter, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { useDebounce } from "../../hooks/use-debounce";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ["#14b8a6", "#eab308", "#ef4444"];
const STATUS_COLORS = {
  approved: "bg-teal-500 hover:bg-teal-600",
  pending: "bg-yellow-500 hover:bg-yellow-600",
  rejected: "bg-red-500 hover:bg-red-600",
};

type CategoryAnalytics = {
  category: string;
  approved: number;
  pending: number;
  rejected: number;
  total: number;
};

type SubmissionTrend = {
  date: string;
  submissions: number;
};

type UserActivity = {
  role: string;
  category: string;
  submissions: number;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-muted-foreground">
            {entry.name}: <span className="font-medium">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reports() {
  const [categoryAnalytics, setCategoryAnalytics] = useState<CategoryAnalytics[]>([]);
  const [submissionTrends, setSubmissionTrends] = useState<SubmissionTrend[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<Date | null>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"charts" | "table">("charts");
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const fetchCategoryAnalytics = async () => {
    setIsLoading(true);
    try {
      let url = "/artwork/category_analytics/";
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (startDate) params.append("start_date", startDate.toISOString().slice(0, 10));
      if (endDate) params.append("end_date", endDate.toISOString().slice(0, 10));
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await API.get(url);
      setCategoryAnalytics(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch category analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissionTrends = async () => {
    try {
      let url = "/artwork/submission_trends/";
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate.toISOString().slice(0, 10));
      if (endDate) params.append("end_date", endDate.toISOString().slice(0, 10));
      if (params.toString()) url += `?${params.toString()}`;

      const res = await API.get(url);
      setSubmissionTrends(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch submission trends");
    }
  };

  const fetchUserActivity = async () => {
    try {
      let url = "/artwork/user_activity/";
      const params = new URLSearchParams();
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await API.get(url);
      setUserActivity(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch user activity");
    }
  };

  useEffect(() => {
    fetchCategoryAnalytics();
    fetchSubmissionTrends();
    fetchUserActivity();
  }, [categoryFilter, statusFilter, roleFilter, debouncedSearch, startDate, endDate]);

  const clearFilters = () => {
    setCategoryFilter("all");
    setStatusFilter("all");
    setRoleFilter("all");
    setSearchQuery("");
    setStartDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    setEndDate(new Date());
  };

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const rows = data.map(item => headers.map(header => {
      const value = item[header.toLowerCase().replace(" ", "_")] || 0;
      return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = Array.from(new Set(categoryAnalytics.map(item => item.category)));
  const roles = ["admin", "manager", "member"];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-muted-foreground">View and analyze artwork and user activity metrics</p>
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    fetchCategoryAnalytics();
                    fetchSubmissionTrends();
                    fetchUserActivity();
                  }}
                  disabled={isLoading}
                >
                  <RotateCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh all reports</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(categoryAnalytics, "category_analytics", ["Category", "Approved", "Pending", "Rejected", "Total"])}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Category Analytics
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export category analytics to CSV</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryAnalytics.reduce((sum, item) => sum + item.total, 0)}</div>
              <p className="text-xs text-muted-foreground">All categories</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryAnalytics.reduce((sum, item) => sum + item.approved, 0)}</div>
              <p className="text-xs text-muted-foreground">Approved artworks</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryAnalytics.reduce((sum, item) => sum + item.pending, 0)}</div>
              <p className="text-xs text-muted-foreground">Pending artworks</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryAnalytics.reduce((sum, item) => sum + item.rejected, 0)}</div>
              <p className="text-xs text-muted-foreground">Rejected artworks</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "charts" | "table")}>
          <TabsList>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search by category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Category: {categoryFilter === "all" ? "All" : categoryFilter}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Status: {statusFilter === "all" ? "All" : statusFilter}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Role: {roleFilter === "all" ? "All" : roleFilter}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[200px] justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  {startDate && endDate
                    ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                    : "Select date range"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Start Date</label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date: Date | null) => setStartDate(date)} // Allow null here
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      maxDate={endDate || undefined} // Pass undefined if endDate is null
                      className="w-full p-2 border rounded bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Date</label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date: Date | null) => setEndDate(date)} // Allow null here
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate || undefined} // Pass undefined if startDate is null
                      maxDate={new Date()}
                      className="w-full p-2 border rounded bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {viewMode === "charts" ? (
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardHeader>
                <CardTitle className="text-lg font-medium">By Category & Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="approved" fill={COLORS[0]} name="Approved" />
                    <Bar dataKey="pending" fill={COLORS[1]} name="Pending" />
                    <Bar dataKey="rejected" fill={COLORS[2]} name="Rejected" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Total Artworks by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryAnalytics}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {categoryAnalytics.map((_entry, index) => ( // Fixed: Added underscore to 'entry'
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardHeader>
                <CardTitle className="text-lg font-medium">Submission Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={submissionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="submissions" stroke="#14b8a6" name="Submissions" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardHeader>
                <CardTitle className="text-lg font-medium">User Activity by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis allowDecimals={false} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    {roles.map((role, index) => (
                      <Bar key={role} dataKey={role} fill={COLORS[index % COLORS.length]} name={role} stackId="a" />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table> {/* Removed headers prop as it's not a standard prop for Table */}
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Rejected</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <span className="animate-pulse">Loading...</span>
                    </TableCell>
                  </TableRow>
                ) : categoryAnalytics.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  categoryAnalytics.map((item) => (
                    <TableRow key={item.category}>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS.approved}>{item.approved}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS.pending}>{item.pending}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS.rejected}>{item.rejected}</Badge>
                      </TableCell>
                      <TableCell>{item.total}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}