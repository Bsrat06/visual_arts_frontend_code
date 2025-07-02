import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import LogoutButton from "../../components/common/LogoutButton";
import { useTheme } from "../../context/ThemeProvider";
import { Menu, X, Moon, Sun, Bell, Search } from "lucide-react";
import { cn } from "../../lib/utils";

export default function VisitorNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggleTheme } = useTheme();
  const [windowWidth] = useState(window.innerWidth);

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  const username = localStorage.getItem("username") || "Guest";
  const avatarUrl = localStorage.getItem("avatarUrl") || "https://via.placeholder.com/40";
  const userRole = localStorage.getItem("role");

  // Sample notifications for authenticated users
  const [notifications] = useState([
    {
      id: 1,
      title: "Welcome to VisualArts",
      message: "Thank you for joining our community",
      time: "Just now",
      read: false,
    }
  ]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileOpen((prev) => !prev);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  useEffect(() => {
    const closeAll = () => {
      setIsDropdownOpen(false);
      setIsMobileOpen(false);
      if (windowWidth >= 768) setIsSearchOpen(false);
    };
    window.addEventListener("click", closeAll);
    return () => window.removeEventListener("click", closeAll);
  }, [windowWidth]);

  const getDashboardLink = () => {
    if (userRole === "admin") return "/admin";
    if (userRole === "member") return "/member";
    return "#";
  };

  const showDashboardLink = isAuthenticated && (userRole === "admin" || userRole === "member");
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Left: Logo + Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <Link 
            to="/" 
            className="text-xl font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
          >
            VisualArts
          </Link>
        </div>

        {/* Main Navigation */}
        <ul
          className={cn(
            "flex-col lg:flex-row lg:flex lg:items-center lg:gap-6 text-sm font-medium text-gray-700 dark:text-gray-300 absolute lg:static top-full left-0 right-0 bg-white dark:bg-gray-900 lg:bg-transparent shadow-lg lg:shadow-none p-4 lg:p-0 transition-all duration-300",
            isMobileOpen ? "flex" : "hidden lg:flex"
          )}
        >
          <li className="py-2 lg:py-0">
            <Link 
              to="/" 
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              Home
            </Link>
          </li>
          <li className="py-2 lg:py-0">
            <Link 
              to="/about" 
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              About
            </Link>
          </li>
          <li className="py-2 lg:py-0">
            <Link 
              to="/gallery" 
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              Gallery
            </Link>
          </li>
          <li className="py-2 lg:py-0">
            <Link 
              to="/events" 
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              Events
            </Link>
          </li>
          <li className="py-2 lg:py-0">
            <Link 
              to="/contact" 
              className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              Contact
            </Link>
          </li>
          
          {showDashboardLink && (
            <li className="py-2 lg:py-0">
              <Link 
                to={getDashboardLink()}
                className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                onClick={() => setIsMobileOpen(false)}
              >
                {userRole === "admin" ? "Admin Panel" : "My Dashboard"}
              </Link>
            </li>
          )}
        </ul>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSearch}
            className="md:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Search - Desktop */}
          {isSearchOpen && (
            <div className="relative hidden md:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search artworks, events..."
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
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Notifications (for authenticated users) */}
          {isAuthenticated && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(false);
                }}
                className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </Button>
            </div>
          )}

          {/* User/Auth */}
          {isAuthenticated ? (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 pl-2"
                onClick={toggleDropdown}
                aria-label="User menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">{username}</span>
              </Button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{username}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {userRole === "admin" ? "Administrator" : "Member"}
                    </p>
                  </div>
                  <Link
                    to={userRole === "admin" ? "/admin/profile" : "/member/profile"}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  >
                    My Profile
                  </Link>
                  {showDashboardLink && (
                    <Link
                      to={getDashboardLink()}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 lg:hidden"
                    >
                      {userRole === "admin" ? "Admin Panel" : "My Dashboard"}
                    </Link>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <LogoutButton className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-red-600 dark:hover:text-red-400" />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/50"
                >
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  size="sm" 
                  className="bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white"
                >
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && windowWidth < 768 && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-gray-900 p-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search artworks, events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-3 text-base bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0"
                autoFocus
              />
            </div>
            <Button
              variant="ghost"
              onClick={() => setIsSearchOpen(false)}
              className="text-gray-600 dark:text-gray-300"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}