// src/routes.tsx
import { Routes, Route } from "react-router-dom"
import AdminLayout from "./layouts/AdminLayout"
import MemberLayout from "./layouts/MemberLayout"
import PublicLayout from "./layouts/PublicLayout"

import Home from "./pages/public/Home"
import AdminDashboard from "./pages/admin/Dashboard"
import ManageMembers from "./pages/admin/Members"
import ArtworkApprovals from "./pages/admin/ArtworkApprovals"
import ManageEvents from "./pages/admin/Events"
import ManageProjects from "./pages/admin/Projects"
import Notifications from "./pages/admin/Notifications"
import Reports from "./pages/admin/Reports"
import SendNotification from "./pages/admin/SendNotification"
import AdminSettings from "./pages/admin/Settings"


import MemberDashboard from "./pages/member/Dashboard"
import Portfolio from "./pages/member/Portfolio"
import MemberEvents from "./pages/member/Events"
import MemberProjects from "./pages/member/Projects"
import MemberNotifications from "./pages/member/Notifications"
import MemberSettings from "./pages/member/Settings"
import MemberProfile from "./pages/member/Profile"
import MyEvents from "./pages/member/MyEvents"


import VisitorGallery from "./pages/visitor/Gallery"
import ArtworkDetail from "./pages/visitor/ArtworkDetail"
import VisitorEvents from "./pages/visitor/Events"
import VisitorProjects from "./pages/visitor/Projects"
import EventDetail from "./pages/visitor/EventDetail"

import About from "./pages/public/About"
import Contact from "./pages/public/Contact"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"


import { RequireAuth } from "./guards/RequireAuth"
import { RequireGuest } from "./guards/RequireAuth"



export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - these will use PublicLayout */}
      <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route
        path="/login"
        element={
          <RequireGuest>
            <Login />
          </RequireGuest>
        }
      />
      <Route
        path="/register"
        element={
          <RequireGuest>
            <Register />
          </RequireGuest>
        }
      />
      <Route path="/gallery" element={<VisitorGallery />} />
      <Route path="/artwork/:id" element={<ArtworkDetail />} />
      <Route path="/events" element={<VisitorEvents />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/projects" element={<VisitorProjects />} />
    </Route>

      {/* Admin Routes - these will use AdminLayout */}
      <Route element={<RequireAuth allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="members" element={<ManageMembers />} />
          <Route path="artworks" element={<ArtworkApprovals />} />
          <Route path="events" element={<ManageEvents />} />
          <Route path="projects" element={<ManageProjects />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reports" element={<Reports />} />
          <Route index element={<AdminDashboard />} />
          <Route path="notifications/send" element={<SendNotification />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Member Routes - these will use MemberLayout */}
      <Route element={<RequireAuth allowedRoles={["admin","member"]} />}>
        <Route path="/member" element={<MemberLayout />}>
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="events" element={<MemberEvents />} />
          <Route path="projects" element={<MemberProjects />} />
          <Route path="notifications" element={<MemberNotifications />} />
          <Route path="settings" element={<MemberSettings />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route index element={<MemberDashboard />} />
          <Route path="my-events" element={<MyEvents />} />
        </Route>
      </Route>


      {/* Optional: Catch-all for 404 (important for user experience) */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  )
}