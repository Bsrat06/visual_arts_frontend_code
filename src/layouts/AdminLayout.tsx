import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar";
import NotificationBell from "../components/common/NotificationBell";
import ThemeToggle from "../components/common/ThemeToggle";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function AdminLayout() {
  // const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const publicNavItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Gallery", path: "/gallery" },
    { name: "Events", path: "/events" },
    { name: "Projects", path: "/projects" }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950 relative">
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 flex justify-between items-center">
            {/* Hamburger menu button - always visible */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
            
            <div className="relative w-64 hidden md:block">
              {/* Search bar (optional) */}
            </div>
            
            <div className="flex items-center space-x-6">
              <ThemeToggle />
              <NotificationBell />
              
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center focus:outline-none"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">
                    Admin User
                  </span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-medium">Admin User</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
                    </div>
                    <button
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={() => {
                        // Add sign-out logic here
                        setIsDropdownOpen(false);
                      }}
                    >
                      <FiLogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
        
        {/* Overlay menu - appears over content when expanded */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm" onClick={toggleMobileMenu}></div>
        )}
        <div className={`fixed top-0 left-0 h-full z-50 bg-white dark:bg-gray-900 shadow-lg transform transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="w-64 h-full overflow-y-auto p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Navigation</h2>
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                aria-label="Close menu"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <nav className="space-y-2">
              {publicNavItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
        
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-6">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div>
              Admin Panel v2.1.0 | © {new Date().getFullYear()} Art Gallery CMS
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</a>
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</a>
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Help</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}