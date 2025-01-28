import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import tikiLogo from "../assets/nobgLogo.png";
import { CacheService } from '../services/cacheService';

const Navbar = ({ userPool, isDarkMode, toggleDarkMode, className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = userPool.getCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Only show these nav items when not on dashboard
  const shouldShowNavItems = !currentUser || location.pathname !== '/dashboard';

  const navItems = shouldShowNavItems 
    ? [
        { title: 'Home', path: '/' },
        { title: 'Features', path: '/features' },
        { title: 'About', path: '/about' },
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

  const navLinkClass = isDarkMode
    ? "text-gray-300 hover:text-white"
    : "text-gray-600 hover:text-teal-600";

  const buttonClass = isDarkMode
    ? "bg-teal-600 hover:bg-teal-500 text-white"
    : "bg-teal-500 hover:bg-teal-400 text-white";

  const mobileMenuClass = isDarkMode
    ? "bg-gray-900 border-t border-gray-800"
    : "bg-white border-t border-gray-200";

  return (
    <nav
      className={`${className} fixed w-full top-0 z-50 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-900/95 text-white border-b border-gray-800"
          : "bg-white/95 text-gray-800 border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <Link to={currentUser ? "/dashboard" : "/"}>
              <img src={tikiLogo} alt="TikiTask Logo" className="h-12 w-auto" />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className={`text-sm font-medium ${navLinkClass} transition-colors ${
                    location.pathname === item.path ? "text-teal-200" : ""
                  }`}
                >
                  {item.title}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right side items */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="relative inline-block w-12 h-6 cursor-pointer"
              onClick={toggleDarkMode}
            >
              <div
                className={`w-full h-full rounded-full transition-colors duration-300 ${
                  isDarkMode ? "bg-teal-500" : "bg-teal-200"
                }`}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white"
                  animate={{
                    x: isDarkMode ? 24 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </div>
            </motion.div>

            {/* Auth Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentUser ? (
                <button
                  onClick={signOut}
                  className={`px-4 py-2 rounded-lg ${buttonClass} 
                           font-medium transition-colors duration-300`}
                >
                  Sign Out
                </button>
              ) : (
                <Link to="/login">
                  <button className={`px-4 py-2 rounded-lg ${buttonClass} 
                                   font-medium transition-colors duration-300`}>
                    Login Here
                  </button>
                </Link>
              )}
            </motion.div>
          </div>

          {/* Mobile menu button */}
          {shouldShowNavItems && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:text-teal-200"
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
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && shouldShowNavItems && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden ${mobileMenuClass}`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.title}
                </Link>
              ))}
              {/* Mobile auth button */}
              {currentUser ? (
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-teal-500 transition-colors"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-teal-500 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login Here
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
