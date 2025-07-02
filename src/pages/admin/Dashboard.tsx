import { StatCard } from "../../components/admin/StatCard";
import { Users, Brush, CalendarDays, FolderKanban, AlertCircle, CheckCircle2, TrendingUp, Mail, Activity, UserPlus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { RecentActivityItem } from "../../components/admin/RecentActivityItem";
import { QuickAction } from "../../components/admin/QuickAction";
import { useFetchStats } from "../../hooks/use-fetch-stats";
import { useFetchRecentActivity } from "../../hooks/use-fetch-recent-activity";
import { Skeleton } from "../../components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { Badge } from "../../components/ui/badge";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboard() {
  const { stats, loading: statsLoading } = useFetchStats();
  const { activities, loading: activitiesLoading } = useFetchRecentActivity();

  // Sample data for charts
  const performanceData = [
    { name: 'Jan', users: 20, artworks: 45, events: 5 },
    { name: 'Feb', users: 35, artworks: 62, events: 8 },
    { name: 'Mar', users: 28, artworks: 51, events: 6 },
    { name: 'Apr', users: 42, artworks: 78, events: 10 },
    { name: 'May', users: 50, artworks: 90, events: 12 },
    { name: 'Jun', users: 38, artworks: 65, events: 9 },
  ];

  const activityDistribution = [
    { name: 'Art Submissions', value: 35 },
    { name: 'Event Signups', value: 25 },
    { name: 'Comments', value: 20 },
    { name: 'Profile Updates', value: 15 },
    { name: 'Other', value: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Welcome back, Administrator. Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            className="flex-1 md:flex-none border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <Mail className="w-4 h-4 mr-2 text-gray-700 dark:text-gray-300" />
            <span className="hidden sm:inline">Send Announcement</span>
          </Button>
          <Button className="flex-1 md:flex-none bg-teal-600 hover:bg-teal-700 text-white">
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Generate Report</span>
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <QuickAction
          title="Approve Artwork"
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          href="/admin/approvals"
          customStyle="success" // Using customStyle for green styling
          // className is now correctly passed through QuickActionProps
        />
        <QuickAction
          title="Manage Events"
          icon={<CalendarDays className="w-5 h-5 text-blue-500" />}
          href="/admin/events"
          // No custom style, relies on default or Badge variant
        />
        <QuickAction
          title="Add Member"
          icon={<UserPlus className="w-5 h-5 text-purple-500" />}
          href="/admin/members/new"
          // No custom style
        />
        <QuickAction
          title="Create Project"
          icon={<FolderKanban className="w-5 h-5 text-orange-500" />}
          href="/admin/projects/new"
          // No custom style
        />
        <QuickAction
          title="View Reports"
          icon={<TrendingUp className="w-5 h-5 text-amber-500" />}
          href="/admin/reports"
          // No custom style
        />
        <QuickAction
          title="Pending Tasks"
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          href="/admin/tasks"
          customStyle="warning" // Using customStyle for yellow/red styling
          badge={stats?.pendingApprovals || 0} // Example: show pending approvals as a badge
          variant="destructive" // Example: use destructive badge variant for pending tasks
        />
      </div>


      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Total Members"
              value={stats?.totalMembers || 0}
              change={stats?.memberChange || 0}
              icon={<Users className="w-6 h-6 text-teal-500" />}
              // className is now correctly passed through StatCardProps
            />
            <StatCard
              title="Artworks Submitted"
              value={stats?.totalArtworks || 0}
              change={stats?.artworkChange || 0}
              icon={<Brush className="w-6 h-6 text-blue-500" />}
              // className is now correctly passed through StatCardProps
            />
            <StatCard
              title="Upcoming Events"
              value={stats?.upcomingEvents || 0}
              icon={<CalendarDays className="w-6 h-6 text-purple-500" />}
              // className is now correctly passed through StatCardProps
            />
            <StatCard
              title="Active Projects"
              value={stats?.activeProjects || 0}
              icon={<FolderKanban className="w-6 h-6 text-orange-500" />}
              // className is now correctly passed through StatCardProps
            />
          </>
        )}
      </div>


      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <TabsTrigger
            value="overview"
            // className="data-[state=active]: data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:border-gray-600"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            // className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:border-gray-600"
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            // className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-gray-200 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:border-gray-600"
          >
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Activity */}
            <Card className="lg:col-span-4 border border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                  <Badge variant="outline" className="ml-2 text-xs">
                    Last 7 days
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {activitiesLoading ? (
                  <div className="space-y-4 p-6">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-14 w-full rounded-lg" />
                    ))}
                  </div>
                ) : activities.length > 0 ? (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {activities.map((activity) => (
                      <RecentActivityItem
                        key={activity.id}
                        type={activity.type}
                        title={activity.title}
                        user={activity.user}
                        timestamp={activity.timestamp}
                        status={activity.status}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                      <Activity className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t border-gray-200 dark:border-gray-700 py-3 px-6">
                <Button variant="ghost" size="sm" className="text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30">
                  View all activity
                </Button>
              </CardFooter>
            </Card>

            {/* System Status */}
            <Card className="lg:col-span-3 border border-gray-200 dark:border-gray-700">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Services</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'API Services', status: 'Operational', value: 'green' },
                      { name: 'Database', status: 'Normal', value: 'green' },
                      { name: 'Storage', status: '64% used', value: 'green' },
                      { name: 'Last Backup', status: 'Today, 02:00 AM', value: 'green' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`h-2.5 w-2.5 rounded-full bg-${item.value}-500`} />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pending Actions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Artwork Approvals</span>
                      <Badge variant="outline" className="px-2 py-0.5 text-xs">
                        {stats?.pendingApprovals || 0} pending
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Member Requests</span>
                      <Badge variant="outline" className="px-2 py-0.5 text-xs">
                        {stats?.pendingMembers || 0} pending
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Reported Content</span>
                      <Badge variant="destructive" className="px-2 py-0.5 text-xs">
                        {stats?.reportedContent || 0} reports
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Platform Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="users"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        name="New Users"
                      />
                      <Area
                        type="monotone"
                        dataKey="artworks"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.2}
                        name="Artworks"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Activity Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        // Fixed: 'percent' is possibly 'undefined'.
                        label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {activityDistribution.map((_entry, index) => ( // Fixed: 'entry' is declared but its value is never read.
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--background))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '0.5rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Mon', value: 120 },
                    { name: 'Tue', value: 200 },
                    { name: 'Wed', value: 150 },
                    { name: 'Thu', value: 180 },
                    { name: 'Fri', value: 220 },
                    { name: 'Sat', value: 190 },
                    { name: 'Sun', value: 140 },
                  ]}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="#8b5cf6"
                      radius={[4, 4, 0, 0]}
                      name="Active Users"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Full Activity Log
                <Badge variant="outline" className="ml-2">
                  All time
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {activitiesLoading ? (
                <div className="space-y-4 p-6">
                  {[...Array(10)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : activities.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {activities.map((activity) => (
                    <RecentActivityItem
                      key={activity.id}
                      type={activity.type}
                      title={activity.title}
                      user={activity.user}
                      timestamp={activity.timestamp}
                      status={activity.status}
                      fullWidth
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm">No activity logged</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-gray-200 dark:border-gray-700 py-3 px-6">
              <div className="flex justify-between items-center w-full">
                <Button variant="ghost" size="sm" className="text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Previous
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">Page 1 of 5</span>
                <Button variant="ghost" size="sm" className="text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}