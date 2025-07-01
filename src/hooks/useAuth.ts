import { useEffect, useState } from "react"
import API from "../lib/api"

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    API.get("/auth/user/")
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("role")
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  return { user, loading }
}
