import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiSearch, FiPlus, FiFileText, FiX } from "react-icons/fi";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 1. Define the props interface for MemberSidebar
interface MemberSidebarProps {
  isOpen: boolean; // Controls the mobile sidebar's open/close state
  onClose: () => void; // Function to call when the mobile sidebar should close
}

const links = [
  { name: "Dashboard", path: "/member/dashboard", icon: "🏠" },
  { name: "Portfolio", path: "/member/portfolio", icon: "📁" },
  { name: "Events", path: "/member/events", icon: "📅" },
  { name: "Projects", path: "/member/projects", icon: "📊" },
  { name: "Notifications", path: "/member/notifications", icon: "🔔" },
  { name: "Settings", path: "/member/settings", icon: "⚙️" },
  { name: "Profile", path: "/member/profile", icon: "👤" },
];

// 2. Accept isOpen and onClose as props
export default function MemberSidebar({ isOpen, onClose }: MemberSidebarProps) {
  // `isCollapsed` will now *only* handle the desktop collapse state.
  // `isOpen` prop will handle the mobile sidebar's open/close.
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth;
      setWindowWidth(currentWidth);

      // If switching to mobile, ensure desktop collapse state is reset
      // or adjusted, but mobile is controlled by `isOpen` prop
      if (currentWidth < 1024) {
        setIsCollapsed(true); // Default to collapsed on mobile for desktop view
        // The mobile sidebar's state (isOpen) is controlled by the parent
      } else {
        // If switching to desktop, close mobile sidebar if open
        if (isOpen) { // If the mobile sidebar was open via prop
            onClose(); // Request parent to close it
        }
        // Optional: you might want to auto-expand desktop sidebar here or keep its last state
        // setIsCollapsed(false); // Example: always expand desktop sidebar when resizing to desktop
      }
    };

    window.addEventListener("resize", handleResize);
    // Cleanup function for useEffect
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, onClose]); // Depend on isOpen and onClose to react to changes

  // This toggle now strictly controls the desktop collapse
  const toggleDesktopCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const filteredLinks = links.filter(link =>
    link.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render logic based on windowWidth and the `isOpen` prop for mobile
  // and `isCollapsed` state for desktop.

  // Mobile sidebar view (when windowWidth < 1024)
  if (windowWidth < 1024) {
    return (
      <>
        {/* Mobile sidebar overlay (controlled by `isOpen` prop) */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose} // Call the onClose prop from parent
          ></div>
        )}

        {/* Mobile sidebar content (controlled by `isOpen` prop) */}
        <aside
          className={`fixed top-0 left-0 h-full z-50 bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950 shadow-xl transform transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full" // Use isOpen prop
          } w-60`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎨</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Member</h2>
              </div>
              <button
                onClick={onClose} // Call the onClose prop from parent
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Close sidebar"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-1 py-3 custom-scrollbar">
              <div className="px-3 pb-2">
                <div className="relative">
                  <FiSearch className="absolute left-2 top-2 w-4 h-4 text-gray-400 dark:text-gray-300" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <nav className="space-y-0.5">
                {filteredLinks.map(link => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    onClick={onClose} // Close mobile sidebar on navigation
                    className={({ isActive }) =>
                      `flex items-center px-2 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border-l-2 border-blue-400"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                      }`
                    }
                  >
                    <span className="mr-2 text-base">{link.icon}</span>
                    <span className="truncate">{link.name}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="mt-4 px-3">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Quick Actions</h3>
                <div className="space-y-0.5">
                  <button className="w-full flex items-center px-2 py-1.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <FiPlus className="w-4 h-4 mr-2" />
                    <span className="truncate">Upload Art</span>
                  </button>
                  <button className="w-full flex items-center px-2 py-1.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <FiFileText className="w-4 h-4 mr-2" />
                    <span className="truncate">Portfolio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Desktop sidebar behavior (when windowWidth >= 1024)
  return (
    <aside
      className={`${
        isCollapsed ? "w-16" : "w-56"
      } bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950 h-screen flex flex-col border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out sticky top-0 shadow-sm`}
    >
      {/* Header Section */}
      <div className="p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎨</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Member</h2>
          </div>
        )}
        <button
          onClick={toggleDesktopCollapse} // Use the new desktop specific toggle
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Scrollable Content - with minimal scrollbar */}
      <div className="flex-1 overflow-y-auto px-1 py-3 custom-scrollbar">
        {/* Search Bar */}
        {!isCollapsed && ( // Only show search when not collapsed on desktop
          <div className="px-3 pb-2">
            <div className="relative">
              <FiSearch className="absolute left-2 top-2 w-4 h-4 text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-sm rounded-md bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-0.5">
          {filteredLinks.map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center px-2 py-2 rounded-md text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-blue-100 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border-l-2 border-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                }`
              }
            >
              <span className="mr-2 text-base">{link.icon}</span>
              {!isCollapsed && <span className="truncate">{link.name}</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-gray-800 dark:bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {link.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && ( // Only show quick actions when not collapsed on desktop
          <div className="mt-4 px-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Quick Actions</h3>
            <div className="space-y-0.5">
              <button className="w-full flex items-center px-2 py-1.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors">
                <FiPlus className="w-4 h-4 mr-2" />
                <span className="truncate">Upload Art</span>
              </button>
              <button className="w-full flex items-center px-2 py-1.5 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-colors">
                <FiFileText className="w-4 h-4 mr-2" />
                <span className="truncate">Portfolio</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles - more minimal */}
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.2);
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
        `}
      </style>
    </aside>
  );
}