import { useEffect, useState } from "react"
import API from "../lib/api"

interface Project {
  id: number
  title: string
  description: string
  start_date: string
  end_date: string
  status: string
}

export function useMemberProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/projects/?member=true")
        setProjects(res.data.results || res.data)
      } catch (err) {
        console.error("Failed to fetch member projects:", err)
        setError("Failed to load projects")
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [])

  return { projects, loading, error }
}
