// AdminLayout.tsx
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminNavbar from "../components/admin/AdminNavbar";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [isLoading, setIsLoading] = useState(true);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminSidebar
        isMobileOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
        setSidebarWidth={setSidebarWidth}
      />

      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out min-h-screen",
          `lg:ml-[${sidebarWidth}px]`
        )}
        style={{
          marginLeft: window.innerWidth >= 1024 ? `${sidebarWidth}px` : "0px",
        }}
      >
        <AdminNavbar toggleSidebar={toggleMobileMenu} />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </main>

        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="mb-2 md:mb-0">
              © {new Date().getFullYear()} Art Gallery CMS | v2.2.0
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                Help
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}