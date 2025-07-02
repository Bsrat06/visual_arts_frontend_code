import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import LogoutButton from "../../components/common/LogoutButton";
import { useTheme } from "../../context/ThemeProvider";
import { Menu, Sun, Moon, Bell, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface MemberNavbarProps {
  toggleSidebar: () => void;
}

export default function MemberNavbar({ toggleSidebar }: MemberNavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "New exhibition announced",
      message: "Spring Art Show submissions are now open",
      time: "3 hours ago",
      read: false,
    },
    {
      id: 2,
      title: "Artwork approved",
      message: "Your submission 'Sunset Dreams' has been approved",
      time: "1 day ago",
      read: true,
    },
  ]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const user = {
    name: localStorage.getItem("username") || "Member",
    email: localStorage.getItem("email") || "member@example.com",
    role: "Artist",
    avatarUrl: localStorage.getItem("avatarUrl") || "https://via.placeholder.com/40",
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotificationsOpen((prev) => !prev);
    setIsDropdownOpen(false);
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? {...n, read: true} : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({...n, read: true})));
  };

  useEffect(() => {
    const closeAll = () => {
      setIsDropdownOpen(false);
      setIsNotificationsOpen(false);
      if (windowWidth >= 768) setIsSearchOpen(false);
    };
    window.addEventListener("click", closeAll);
    return () => window.removeEventListener("click", closeAll);
  }, [windowWidth]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          {isSearchOpen ? (
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/member" className="text-lg font-semibold text-gray-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              My Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNotifications}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </Button>

            {isNotificationsOpen && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                    <button 
                      onClick={() => setIsNotificationsOpen(false)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-700",
                          !notification.read && "bg-teal-50/50 dark:bg-teal-900/20"
                        )}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {notification.time}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  )}
                </div>
                <Link
                  to="/member/notifications"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="block px-4 py-2 text-sm text-center text-teal-600 dark:text-teal-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700"
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* User Dropdown */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 pl-2"
              onClick={toggleDropdown}
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium">{user.name}</span>
            </Button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 animate-fadeIn">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                </div>
                <Link
                  to="/member/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                >
                  My Profile
                </Link>
                <Link
                  to="/member/settings"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                >
                  Account Settings
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <LogoutButton className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-red-600 dark:hover:text-red-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}