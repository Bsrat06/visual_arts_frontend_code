import { useEffect, useState } from "react"
import API from "../lib/api"

interface DashboardStats {
  totalMembers: number
  memberChange: number
  totalArtworks: number
  artworkChange: number
  upcomingEvents: number
  activeProjects: number
  pendingApprovals: number
  pendingMembers: number
  reportedContent: number
}

export function useFetchStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // In a real app, you might want to make these requests in parallel
        const [
          membersRes, 
          artworksRes, 
          eventsRes, 
          projectsRes, 
          approvalsRes,
          pendingRes,
          reportedRes
        ] = await Promise.all([
          API.get("/users/stats/"),
          API.get("/artwork/stats/"),
          API.get("/events/upcoming_count/"),
          API.get("/projects/active_count/"),
          API.get("/artwork/pending_count/"),
          API.get("/users/pending_count/"),
          API.get("/reports/count/")
        ])

        setStats({
          totalMembers: membersRes.data.total || 0,
          memberChange: membersRes.data.change || 0,
          totalArtworks: artworksRes.data.total || 0,
          artworkChange: artworksRes.data.change || 0,
          upcomingEvents: eventsRes.data.count || 0,
          activeProjects: projectsRes.data.count || 0,
          pendingApprovals: approvalsRes.data.count || 0,
          pendingMembers: pendingRes.data.count || 0,
          reportedContent: reportedRes.data.count || 0
        })
      } catch (err) {
        console.error("Failed to fetch stats:", err)
        setError("Failed to load dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}