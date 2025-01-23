import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import tikiLogo from "../assets/nobgLogo.png";

const Navbar = ({ userPool, isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = userPool.getCurrentUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { title: 'Home', path: '/' },
  ];

  const signOut = () => {
    if (currentUser) {
      currentUser.signOut();
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-900/95 text-white backdrop-blur-sm"
          : "bg-teal-600/95 text-white backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex-shrink-0"
          >
            <Link to="/">
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
                  className={`text-sm font-medium hover:text-teal-200 transition-colors ${
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
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 
                           text-white font-medium transition-colors duration-300"
                >
                  Sign Out
                </button>
              ) : (
                <Link to="/login">
                  <button className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 
                                   text-white font-medium transition-colors duration-300">
                    Login Here
                  </button>
                </Link>
              )}
            </motion.div>
          </div>

          {/* Mobile menu button */}
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
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden"
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
