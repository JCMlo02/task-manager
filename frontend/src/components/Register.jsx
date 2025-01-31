import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import Navbar from "./Navbar"; // Import the Navbar component
import Logo from "../assets/nobgLogo.png";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaRegEye,
  FaRegEyeSlash,
} from "react-icons/fa";

const Register = ({ userPool }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    showPassword: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("isDarkMode") === "true"
  );

  // Load the dark mode setting from localStorage on initial load
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("isDarkMode") === "true";
    setIsDarkMode(savedDarkMode);
  }, []);

  // Toggle dark mode and save the setting to localStorage
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("isDarkMode", newMode);
  };

  // Add password visibility toggle
  const togglePasswordVisibility = () => {
    setFormData((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  };

  // Handle sign-up logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    toast
      .promise(
        new Promise((resolve, reject) => {
          userPool.signUp(
            formData.username,
            formData.password,
            [{ Name: "email", Value: formData.email }],
            null,
            (err, data) => {
              if (err) {
                reject(err);
                setError(err.message);
              } else {
                resolve(data);
              }
            }
          );
        }),
        {
          loading: "Creating your paradise... 🌴",
          success: "Welcome aboard! Please check your email 📧",
          error: (err) => `${err.message || "Registration failed"} 😥`,
        }
      )
      .finally(() => setIsLoading(false));
  };

  // Updated dark mode classes
  const darkModeClasses = isDarkMode
    ? "bg-gray-800 text-white"
    : "bg-gradient-to-br from-teal-500 to-indigo-500";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${darkModeClasses}`}
    >
      <Navbar
        userPool={userPool}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-screen pt-16 pb-12 px-4"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`w-full max-w-md p-8 my-8 rounded-xl shadow-2xl
            ${
              isDarkMode
                ? "bg-slate-800/90 border border-slate-700"
                : "bg-white/90 border border-teal-500/20"
            } 
            backdrop-blur-sm`}
        >
          <div className="text-center mb-8">
            <a href="/">
              <img
                src={Logo}
                alt="TikiTask Logo"
                className="w-auto h-24 mx-auto my-4"
              />
            </a>
            <h2
              className={`text-3xl font-extrabold mb-4 
              ${isDarkMode ? "text-white" : "text-teal-600"}`}
            >
              Create Your Account
            </h2>
            <p
              className={`text-lg mb-6 
              ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
            >
              Join the TikiTask paradise!
            </p>
          </div>

          <motion.form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div className="mb-6 relative">
              <label
                htmlFor="username"
                className={`block text-sm font-medium mb-2
                  ${isDarkMode ? "text-slate-300" : "text-teal-700"}`}
              >
                Username
              </label>
              <div className="relative">
                <span
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center 
                  ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                >
                  <FaUser />
                </span>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className={`mt-1 pl-10 p-4 w-full rounded-lg focus:outline-none focus:ring-2 
                    ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white focus:ring-teal-500"
                        : "bg-white border-teal-300 text-gray-900 focus:ring-teal-500"
                    } 
                    border shadow-sm`}
                  required
                />
              </div>
            </div>

            {/* Email Input - apply same styling pattern as username */}
            <div className="mb-6 relative">
              <label
                htmlFor="email"
                className={`block text-sm font-medium mb-2
                  ${isDarkMode ? "text-slate-300" : "text-teal-700"}`}
              >
                Email Address
              </label>
              <div className="relative">
                <span
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center 
                  ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                >
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`mt-1 pl-10 p-4 w-full rounded-lg focus:outline-none focus:ring-2 
                    ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white focus:ring-teal-500"
                        : "bg-white border-teal-300 text-gray-900 focus:ring-teal-500"
                    } 
                    border shadow-sm`}
                  required
                />
              </div>
            </div>

            {/* Password Input - apply same styling pattern */}
            <div className="mb-8 relative">
              <label
                htmlFor="password"
                className={`block text-sm font-medium mb-2
                  ${isDarkMode ? "text-slate-300" : "text-teal-700"}`}
              >
                Password
              </label>
              <div className="relative">
                <span
                  className={`absolute inset-y-0 left-0 pl-3 flex items-center 
                  ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}
                >
                  <FaLock />
                </span>
                <input
                  type={formData.showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className={`mt-1 pl-10 pr-10 p-4 w-full rounded-lg focus:outline-none focus:ring-2 
                    ${
                      isDarkMode
                        ? "bg-slate-700 border-slate-600 text-white focus:ring-teal-500"
                        : "bg-white border-teal-300 text-gray-900 focus:ring-teal-500"
                    } 
                    border shadow-sm`}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center mt-1
                    ${
                      isDarkMode
                        ? "text-slate-400 hover:text-slate-300"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {formData.showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white
                transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  isDarkMode
                    ? "bg-teal-600 hover:bg-teal-700"
                    : "bg-teal-500 hover:bg-teal-600"
                }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </motion.form>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-3 rounded-lg ${
                  isDarkMode
                    ? "bg-red-900/50 text-red-200"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Link */}
          <div className="mt-6 text-center text-sm">
            <p className={isDarkMode ? "text-slate-400" : "text-gray-600"}>
              Already have an account?{" "}
              <a
                href="/login"
                className={`font-medium hover:underline
                  ${isDarkMode ? "text-teal-400" : "text-teal-600"}`}
              >
                Login here
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Register;
