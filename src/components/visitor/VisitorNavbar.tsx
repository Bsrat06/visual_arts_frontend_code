// visitornavbar.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Keep useNavigate import if it might be used in the future or in other files
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import LogoutButton from "../../components/common/LogoutButton";
import { useTheme } from "../../context/ThemeProvider";
import { Menu, X, Moon, Sun } from "lucide-react";
import { cn } from "../../lib/utils";

export default function VisitorNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // REMOVE THIS LINE:
  // const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;
  const username = localStorage.getItem("username") || "Guest";
  const avatarUrl = localStorage.getItem("avatarUrl") || "https://via.placeholder.com/40";

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMobileOpen((prev) => !prev);
  };

  useEffect(() => {
    const closeMenus = () => {
      setIsDropdownOpen(false);
      setIsMobileOpen(false);
    };
    window.addEventListener("click", closeMenus);
    return () => window.removeEventListener("click", closeMenus);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center font-poppins">
        {/* Left: Logo + Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="lg:hidden text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
          <Link to="/" className="text-xl font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors">
            VisualArts
          </Link>
        </div>

        {/* Main Nav */}
        <ul
          className={cn(
            "flex-col lg:flex-row lg:flex lg:items-center lg:gap-6 text-sm font-medium text-gray-700 dark:text-gray-300 absolute lg:static top-full left-0 right-0 bg-white dark:bg-gray-900 lg:bg-transparent shadow-lg lg:shadow-none p-4 lg:p-0 transition-all duration-300",
            isMobileOpen ? "flex" : "hidden lg:flex"
          )}
        >
          <li className="py-2 lg:py-0">
            <Link to="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Home</Link>
          </li>
          <li className="py-2 lg:py-0">
            <Link to="/about" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">About</Link>
          </li>
          <li className="py-2 lg:py-0">
            <Link to="/contact" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Contact</Link>
          </li>
          <li className="py-2 lg:py-0">
            <Link to="/gallery" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Gallery</Link>
          </li>
          <li className="py-2 lg:py-0">
            <Link to="/events" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Events</Link>
          </li>
          <li className="py-2 lg:py-0">
            <Link to="/projects" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Projects</Link>
          </li>
        </ul>

        {/* Right: User & Theme Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          {/* Authenticated User */}
          {isAuthenticated ? (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
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
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-2 z-20 animate-fadeIn">
                  <Link to="/member/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">My Profile</Link>
                  <LogoutButton />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="outline" size="sm" className="text-teal-600 dark:text-teal-400 border-teal-600 dark:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/50">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 text-white">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}