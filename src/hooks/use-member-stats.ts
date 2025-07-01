import { useEffect, useState } from "react"
import API from "../lib/api"

interface CategoryStats {
  category: string
  count: number
}

interface ActivityLog {
  action: string
  resource: string
  timestamp: string
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
  total_artworks: number
  approved_artworks: number
  approval_rate: number
  category_distribution: CategoryStats[]
  recent_activity_logs: ActivityLog[]
  featured_artwork?: Artwork;
  user?: {
    first_name: string;
  };
}

export function useMemberStats() {
  const [stats, setStats] = useState<MemberStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/users/member-stats/")
        setStats(res.data)
      } catch (err) {
        console.error("Failed to fetch member stats:", err)
        setError("Failed to load member stats")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}
