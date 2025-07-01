import { Outlet } from "react-router-dom";
import VisitorNavbar from "../components/visitor/VisitorNavbar";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md">
        <VisitorNavbar />
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="mb-4 sm:mb-0">
            © {new Date().getFullYear()} Visual Arts Club | All Rights Reserved
          </div>
          <div className="flex space-x-4">
            <a href="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</a>
            <a href="/terms" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</a>
            <a href="/contact" className="hover:text-gray-700 dark:hover:text-gray-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}