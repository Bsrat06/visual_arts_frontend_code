import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiSearch, FiPlus, FiFileText, FiMenu, FiX } from "react-icons/fi";
import { ChevronLeft, ChevronRight } from "lucide-react";

const links = [
  { name: "Dashboard", path: "/member/dashboard", icon: "🏠" },
  { name: "Portfolio", path: "/member/portfolio", icon: "📁" },
  { name: "Events", path: "/member/events", icon: "📅" },
  { name: "Projects", path: "/member/projects", icon: "📊" },
  { name: "Notifications", path: "/member/notifications", icon: "🔔" },
  { name: "Settings", path: "/member/settings", icon: "⚙️" },
  { name: "Profile", path: "/member/profile", icon: "👤" },
];

export default function MemberSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (windowWidth < 1024) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const closeMobileSidebar = () => {
    if (windowWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const filteredLinks = links.filter(link =>
    link.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mobile sidebar behavior
  if (windowWidth < 1024) {
    return (
      <>
        {/* Mobile hamburger button - always visible */}
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-md bg-white dark:bg-gray-800 shadow-md text-gray-600 dark:text-gray-300"
          aria-label="Open sidebar"
        >
          <FiMenu className="w-5 h-5" />
        </button>

        {/* Mobile sidebar overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMobileSidebar}
          ></div>
        )}

        {/* Mobile sidebar content */}
        <aside
          className={`fixed top-0 left-0 h-full z-50 bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-950 shadow-xl transform transition-transform duration-300 ease-in-out ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
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
                onClick={closeMobileSidebar}
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
                    onClick={closeMobileSidebar}
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

  // Desktop sidebar behavior
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
          onClick={toggleSidebar}
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
        {/* {!isCollapsed && (
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
        )} */}

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
        {!isCollapsed && (
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