import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

interface MemberSidebarProps {
  isMobileOpen: boolean;
  toggleMobileMenu: () => void;
  setSidebarWidth: (width: number) => void;
}

const links = [
  { name: "Dashboard", path: "/member/dashboard", icon: "📊" },
  { name: "My Portfolio", path: "/member/portfolio", icon: "🖼️" },
  { name: "Events", path: "/member/events", icon: "📅" },
  { name: "Projects", path: "/member/projects", icon: "📦" },
  { name: "Submissions", path: "/member/submissions", icon: "📤" },
];

const secondaryLinks = [
  { name: "Settings", path: "/member/settings", icon: "⚙️" },
  { name: "Help Center", path: "/member/help", icon: "❓" },
  { name: "Profile", path: "/member/profile", icon: "👤" },
];

export default function MemberSidebar({ isMobileOpen, toggleMobileMenu, setSidebarWidth }: MemberSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const collapsedWidth = 80;
  const expandedWidth = 260;

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);
      if (newWidth >= 1024 && isMobileOpen) {
        toggleMobileMenu();
      }
      setSidebarWidth(newWidth >= 1024 ? (isCollapsed ? collapsedWidth : expandedWidth) : 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isCollapsed, isMobileOpen, toggleMobileMenu, setSidebarWidth]);

  const toggleDesktopCollapse = () => {
    setIsCollapsed((prev) => {
      const newState = !prev;
      if (windowWidth >= 1024) {
        setSidebarWidth(newState ? collapsedWidth : expandedWidth);
      }
      return newState;
    });
  };

  const filteredLinks = links.filter(link =>
    link.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {isMobileOpen && windowWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={toggleMobileMenu}
        />
      )}

      <aside
        className={cn(
          "flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out shadow-lg z-40",
          windowWidth >= 1024
            ? `fixed top-0 ${isCollapsed ? "w-20" : "w-64"}`
            : `fixed inset-y-0 left-0 w-72 transform ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`
        )}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          {(!isCollapsed || windowWidth < 1024) && (
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎨</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Artist Portal</h2>
            </div>
          )}
          <button
            onClick={windowWidth < 1024 ? toggleMobileMenu : toggleDesktopCollapse}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label={windowWidth < 1024 ? "Close sidebar" : isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {windowWidth < 1024 ? (
              <FiX className="w-5 h-5" />
            ) : isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
          {(!isCollapsed || windowWidth < 1024) && (
            <div className="px-2 pb-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                />
              </div>
            </div>
          )}

          <nav className="space-y-1">
            {filteredLinks.map(link => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={windowWidth < 1024 ? toggleMobileMenu : undefined}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-l-4 border-teal-500"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )
                }
              >
                <span className="text-lg mr-3">{link.icon}</span>
                {(!isCollapsed || windowWidth < 1024) && <span>{link.name}</span>}
                {isCollapsed && windowWidth >= 1024 && (
                  <span className="absolute left-full ml-3 px-2 py-1 text-xs font-medium bg-gray-900 dark:bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    {link.name}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* {(!isCollapsed || windowWidth < 1024) && (
            <div className="mt-4 px-3">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Quick Actions</h3>
              <div className="space-y-1">
                <Link
                  to="/member/portfolio/new"
                  onClick={windowWidth < 1024 ? toggleMobileMenu : undefined}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiPlus className="w-4 h-4 mr-3" />
                  <span>Add Artwork</span>
                </Link>
                <Link
                  to="/member/submissions/new"
                  onClick={windowWidth < 1024 ? toggleMobileMenu : undefined}
                  className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <FiFileText className="w-4 h-4 mr-3" />
                  <span>New Submission</span>
                </Link>
              </div>
            </div>
          )} */}

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <nav className="space-y-1">
              {secondaryLinks.map(link => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={windowWidth < 1024 ? toggleMobileMenu : undefined}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                      isActive
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    )
                  }
                >
                  <span className="text-lg mr-3">{link.icon}</span>
                  {(!isCollapsed || windowWidth < 1024) && <span>{link.name}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}