// guards/requireauth.tsx
import { useEffect } from "react"
import { useNavigate, Outlet, useLocation } from "react-router-dom"
import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import type { JSX } from "react/jsx-runtime"


export function RequireAuth({ allowedRoles }: { allowedRoles: string[] }) {
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!token || !role || !allowedRoles.includes(role)) {
      navigate("/login", { state: { from: location }, replace: true })
    }
  }, [token, role, navigate, allowedRoles, location])

  return token && role && allowedRoles.includes(role) ? <Outlet /> : null
}

export function RequireGuest({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()

  if (loading) return null // or loading spinner
  if (user) return <Navigate to="/" />

  return children
}