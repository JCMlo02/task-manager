import React, { useState, useEffect } from "react";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from 'react-hot-toast';
import Logo from "../assets/nobgLogo.png";
import Navbar from "../components/Navbar";

const Login = ({ userPool }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // Dark Mode State

  // Effect hook to read from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("isDarkMode");
    if (savedDarkMode) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Toggle dark mode and save the preference to localStorage
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("isDarkMode", JSON.stringify(newMode)); // Save to localStorage
      return newMode;
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    toast.promise(
      new Promise((resolve, reject) => {
        const user = new CognitoUser({ Username: username, Pool: userPool });
        const authDetails = new AuthenticationDetails({ Username: username, Password: password });

        user.authenticateUser(authDetails, {
          onSuccess: (result) => {
            resolve(result);
            window.location.href = "/dashboard";
          },
          onFailure: (err) => {
            reject(err);
            setError(err.message || "Error logging in");
          },
        });
      }),
      {
        loading: 'Logging in...',
        success: 'Welcome back!',
        error: (err) => err.message || 'Failed to login'
      }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gray-800 text-white"
          : "bg-gradient-to-br from-teal-400 to-yellow-300"
      }`}
    >
      <Navbar userPool={userPool} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <Toaster position="top-right" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-screen pt-16 pb-12 px-4"
      >
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="w-full max-w-md p-8 my-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl border-4 border-teal-600"
        >
          <div className="text-center mb-8">  {/* Added mb-8 to match register */}
            <a href="/">
              <img
                src={Logo}
                alt="TikiTask Logo"
                className="w-auto h-auto mx-auto my-4" // Adjust the logo size here
              />
            </a>
            <p className="text-lg text-gray-700 mb-8">
              Your task paradise awaits!
            </p>
          </div>

          <motion.form
            onSubmit={handleLogin}
            className="space-y-6"
          >
            <div className="mb-6">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-teal-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 p-4 w-full border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                required
              />
            </div>

            <div className="mb-8">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-teal-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 p-4 w-full border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm text-black"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300"
            >
              Login
            </button>
          </motion.form>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 bg-red-50 text-red-500 rounded-lg"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Don't have an account?{" "}
              <a href="/register" className="text-teal-600 hover:underline">
                Register here
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
