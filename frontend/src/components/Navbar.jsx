import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa"; // Add this import
import tikiLogo from "../assets/nobgLogo.png";
import { CacheService } from "../services/cacheService";
import { useMediaQuery, BREAKPOINTS } from "../styles/responsive";

const Navbar = ({ userPool, isDarkMode, toggleDarkMode, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = userPool.getCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md})`);

  // Only show these nav items when not on dashboard
  const shouldShowNavItems = !currentUser || location.pathname !== "/dashboard";

  // Update navigation items logic
  const navItems = shouldShowNavItems
    ? [
        { title: "Home", path: "/" },
        { title: "Features", path: "/features" },
        { title: "About", path: "/about" },
      ]
    : [];

  const signOut = () => {
    if (currentUser) {
      // Get user's sub before signing out
      currentUser.getSession((err, session) => {
        if (!err && session) {
          const userId = session.getIdToken().payload.sub;
          // Clear this user's cache
          CacheService.clearCache(userId);
        }
        currentUser.signOut();
        navigate("/");
        window.location.reload();
      });
    }
  };

  return (
    <nav
      className={`
      fixed top-0 left-0 right-0 z-50 
      ${isDarkMode ? "bg-slate-900/95" : "bg-slate-50/95"}
      backdrop-blur-md border-b
      ${isDarkMode ? "border-slate-800" : "border-teal-200"}
      transition-colors duration-300
    `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo section */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
          >
            <Link to={currentUser ? "/dashboard" : "/"}>
              <img
                src={tikiLogo}
                alt="TikiTask Logo"
                className={`w-auto ${isMobile ? "h-10" : "h-12"}`}
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {shouldShowNavItems &&
              navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                  font-medium transition-colors duration-200
                  ${
                    isDarkMode
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }
                `}
                >
                  {item.title}
                </Link>
              ))}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`
                p-2 rounded-lg
                ${isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"}
                transition-colors duration-200
              `}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <FaMoon
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                />
              ) : (
                <FaSun
                  className={`w-5 h-5 ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                />
              )}
            </motion.button>

            {currentUser ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={signOut}
                className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white"
              >
                Sign Out
              </motion.button>
            ) : (
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg font-medium bg-teal-500 hover:bg-teal-600 text-white"
                >
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-teal-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`
              md:hidden border-t
              ${
                isDarkMode
                  ? "bg-slate-900 border-slate-800"
                  : "bg-white border-slate-200"
              }
            `}
          >
            <div className="px-4 py-2 space-y-2">
              {/* Show nav items only when not on dashboard */}
              {shouldShowNavItems &&
                navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                    block py-3 px-4 rounded-lg text-lg font-medium
                    ${
                      isDarkMode
                        ? "text-slate-300 hover:text-white hover:bg-slate-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }
                    transition-colors duration-200
                  `}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.title}
                  </Link>
                ))}

              {/* Always show these items on mobile */}
              <div className="py-3 px-4 space-y-4">
                {/* Dark mode toggle */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-base font-medium ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    Dark Mode
                  </span>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleDarkMode}
                    className="relative inline-block w-12 h-6 cursor-pointer"
                  >
                    <div
                      className={`w-full h-full rounded-full transition-colors duration-300 ${
                        isDarkMode ? "bg-slate-600" : "bg-slate-200"
                      }`}
                    >
                      <motion.div
                        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white"
                        animate={{
                          x: isDarkMode ? 24 : 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                      />
                    </div>
                  </motion.div>
                </div>

                {/* Auth button */}
                {currentUser ? (
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-teal-500 text-white hover:bg-teal-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login Here
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
