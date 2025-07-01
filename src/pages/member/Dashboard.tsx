import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useMemberStats } from "../../hooks/use-member-stats";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import { Button } from "../../components/ui/button";
import { FiImage, FiCalendar, FiUpload, FiFile, FiArrowRight } from "react-icons/fi";
import { Progress } from "../../components/ui/progress";
import { Chart, registerables } from "chart.js";
import { Badge } from "../../components/ui/badge";

// Define types for your data
interface CategoryDistribution {
  category: string;
  count: number;
}

interface ActivityLog {
  id: string;
  action: string;
  resource: string;
  timestamp: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
}

interface Artwork {
  id: string;
  title: string;
  category: string;
  image?: string;
  description?: string;
  created_at: string;
}

interface MemberStats {
  total_artworks: number;
  approval_rate: number;
  recent_activity_logs: ActivityLog[];
  category_distribution: CategoryDistribution[];
  upcoming_events?: Event[];
  featured_artwork?: Artwork;
  user?: {
    first_name: string;
  };
}

// Register Chart.js components
Chart.register(...registerables);

export default function MemberDashboard() {
  const { stats, loading } = useMemberStats();

  // Initialize Chart.js for category distribution
  useEffect(() => {
    if (!stats || loading) return;

    const ctx = document.getElementById("categoryChart") as HTMLCanvasElement;
    const chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: stats.category_distribution.map((cat) => cat.category),
        datasets: [
          {
            data: stats.category_distribution.map((cat) => cat.count),
            backgroundColor: [
              "rgba(59, 130, 246, 0.8)",
              "rgba(16, 185, 129, 0.8)",
              "rgba(245, 158, 11, 0.8)",
              "rgba(239, 68, 68, 0.8)",
              "rgba(139, 92, 246, 0.8)",
            ],
            borderColor: "hsl(var(--background))",
            borderWidth: 2,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        cutout: "70%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: "hsl(var(--foreground))",
              font: {
                family: "'Poppins', sans-serif",
                size: 12,
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            backgroundColor: "hsl(var(--background))",
            titleColor: "hsl(var(--foreground))",
            bodyColor: "hsl(var(--foreground))",
            borderColor: "hsl(var(--border))",
            borderWidth: 1,
            padding: 12,
            usePointStyle: true,
            callbacks: {
              label: (context) => `${context.label}: ${context.raw} artworks`,
            },
          },
        },
      },
    });

    return () => chart.destroy(); // Cleanup on unmount
  }, [stats, loading]);

  return (
    <div className="space-y-6 p-4 sm:p-6 animate-[fadeIn_0.5s_ease-in]">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome Back, {stats?.user?.first_name || "Member"}!
        </h1>
        <p className="text-sm sm:text-base opacity-90 mt-2">
          Here's what's happening with your artistic journey today
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button
              asChild
              className="h-16 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg transition-all"
            >
              <Link to="/member/portfolio" className="flex flex-col items-center justify-center gap-2">
                <FiUpload className="w-6 h-6" />
                <span className="text-sm font-medium">Upload Artwork</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <Link to="/member/events" className="flex flex-col items-center justify-center gap-2">
                <FiCalendar className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Join Event</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-16 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <Link to="/member/portfolio" className="flex flex-col items-center justify-center gap-2">
                <FiImage className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">View Portfolio</span>
              </Link>
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Artworks
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                  <FiImage className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_artworks}</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link
                  to="/member/portfolio"
                  className="text-xs text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  View all <FiArrowRight className="w-3 h-3" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Approval Rate
                </CardTitle>
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50">
                  <FiFile className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approval_rate}%</p>
                <Progress 
                  value={stats.approval_rate} 
                  className="mt-2 h-2 bg-gray-200 dark:bg-gray-700" 
                />
              </CardContent>
            </Card>
            
            <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Recent Activity
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                  <FiCalendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recent_activity_logs.length}</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Link
                  to="/member/notifications"
                  className="text-xs text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  View activity <FiArrowRight className="w-3 h-3" />
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Artwork Spotlight */}
          {stats.featured_artwork && (
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Featured Artwork
                  <Badge variant="secondary" className="ml-2">
                    Spotlight
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-start gap-6">
                <div className="relative w-full sm:w-48 h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  {stats.featured_artwork.image ? (
                    <img
                      src={stats.featured_artwork.image}
                      alt={stats.featured_artwork.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <FiImage className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {stats.featured_artwork.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {stats.featured_artwork.category}
                    </Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(stats.featured_artwork.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-3">
                    {stats.featured_artwork.description || "No description available"}
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    className="mt-4 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Link to={`/member/artworks/${stats.featured_artwork.id}`} className="flex items-center gap-2">
                      View Details <FiArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Artwork Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <canvas id="categoryChart" className="w-full h-full"></canvas>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            {stats.upcoming_events && stats.upcoming_events.length > 0 && (
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.upcoming_events.slice(0, 3).map((event: Event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <FiCalendar className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(event.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="text-xs px-3 py-1 h-8"
                        >
                          <Link to={`/member/events/${event.id}`}>Register</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Link
                    to="/member/events"
                    className="text-xs text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-1 w-full justify-center"
                  >
                    View all events <FiArrowRight className="w-3 h-3" />
                  </Link>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Recent Activity Timeline */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recent_activity_logs.length > 0 ? (
                <div className="relative pl-6">
                  <div className="absolute left-2.5 top-0 h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                  {stats.recent_activity_logs.map((log, idx) => (
                    <div key={idx} className="mb-6 relative group">
                      <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 dark:bg-blue-600 group-hover:scale-150 transition-transform"></div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.action}
                          </p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(log.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {log.resource}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <FiFile className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No recent activity found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardContent className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mb-4">
              <FiFile className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
            <p className="text-red-500 dark:text-red-400 font-medium">
              Failed to load dashboard data
            </p>
            <Button variant="ghost" size="sm" className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}