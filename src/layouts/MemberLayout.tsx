import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Search } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../components/ui/tooltip";
import { Button } from "../components/ui/button";
import MemberSidebar from "../components/member/MemberSidebar";
import NotificationBell from "../components/common/NotificationBell";
import LogoutButton from "../components/common/LogoutButton";
import ThemeToggle from "../components/common/ThemeToggle";
import API from "../lib/api";

type User = {
  first_name: string;
  last_name: string;
  profile_picture: string | null;
};

export default function MemberLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user data
  useEffect(() => {
    API.get("/auth/user/")
      .then((res) => {
        setUser({
          first_name: res.data.first_name || "User",
          last_name: res.data.last_name || "",
          profile_picture: res.data.profile_picture || null,
        });
      })
      .catch(() => {
        console.warn("Failed to fetch user data");
      });
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <MemberSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
            <div className="px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="md:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Open sidebar"
                  aria-controls="sidebar"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div className="relative w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search member panel..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-colors duration-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ThemeToggle className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white dark:bg-gray-700">
                    Toggle theme
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <NotificationBell className="text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 text-white dark:bg-gray-700">
                    View notifications
                  </TooltipContent>
                </Tooltip>
                
                <div className="relative group">
                  <button
                    className="flex items-center gap-2 focus:outline-none"
                    aria-label="User menu"
                  >
                    {user && (
                      <>
                        {user.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={`${user.first_name} ${user.last_name}`}
                            className="w-8 h-8 rounded-full border-2 border-teal-500 dark:border-teal-600 object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-teal-500 dark:bg-teal-600 flex items-center justify-center text-white font-bold transition-transform duration-200 group-hover:scale-105">
                            {user.first_name[0]}
                            {user.last_name?.[0]}
                          </div>
                        )}
                        <span className="hidden md:inline text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-200">
                          {user.first_name} {user.last_name}
                        </span>
                      </>
                    )}
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 origin-top-right">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Member
                      </p>
                    </div>
                    <LogoutButton className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 px-6">
            <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <div className="mb-2 md:mb-0">
                Member Panel v2.1.0 | © {new Date().getFullYear()} Art Gallery CMS
              </div>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200">
                  Privacy
                </a>
                <a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200">
                  Terms
                </a>
                <a href="#" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors duration-200">
                  Help
                </a>
              </div>
            </div>
          </footer>
        </main>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}
      </div>
    </TooltipProvider>
  );
}