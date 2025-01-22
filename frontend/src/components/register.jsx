import React, { useState, useEffect } from "react";
import Navbar from "./Navbar"; // Import the Navbar component
import Logo from "../assets/nobgLogo.png";

const Register = ({ userPool }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Handle sign-up logic
  const handleSignUp = async (e) => {
    e.preventDefault();

    const params = {
      Username: username,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    };

    try {
      userPool.signUp(
        params.Username,
        params.Password,
        params.UserAttributes,
        [],
        (err, data) => {
          if (err) {
            console.error("Error signing up", err);
            setError(err.message || "Error signing up");
          } else {
            console.log("Sign-up successful", data);
            setSuccessMessage(
              "User successfully registered! Please verify your email."
            );
          }
        }
      );
    } catch (err) {
      console.error("Error signing up", err);
      setError(err.message || "Error signing up");
    }
  };

  // Conditional styling for dark mode
  const darkModeClasses = isDarkMode
    ? "bg-gray-800 text-white"
    : "bg-gradient-to-br from-teal-400 to-yellow-300 text-teal-600";

  return (
    <div className={`min-h-screen ${darkModeClasses}`}>
      {/* Navbar Component */}
      <Navbar
        userPool={userPool}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Register Form */}
      <div className="flex items-center justify-center py-12 min-h-screen">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl border-4 border-teal-600">
          <div className="text-center mb-8">
            <a href="/">
              <img
                src={Logo}
                alt="TikiTask Logo"
                className="w-auto h-auto mx-auto my-4" // Adjust the logo size here
              />
            </a>
            <h2 className="text-3xl font-extrabold text-teal-600 mb-4">
              Create Your Account
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Join the TikiTask paradise!
            </p>
          </div>

          <form onSubmit={handleSignUp}>
            {/* Username */}
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

            {/* Email */}
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-teal-700"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 p-4 w-full border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                required
              />
            </div>

            {/* Password */}
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
                className="mt-2 p-4 w-full border border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-6 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-300"
            >
              Sign Up
            </button>
          </form>

          {/* Success and Error Messages */}
          {successMessage && (
            <div className="mt-4 text-center text-green-500">
              <p>{successMessage}</p>
              <a href="/login" className="text-teal-600 hover:underline">
                Go to Login
              </a>
            </div>
          )}
          {error && (
            <p className="mt-4 text-center text-red-500 text-sm">{error}</p>
          )}

          {/* Redirect to Login Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Already have an account?{" "}
              <a href="/login" className="text-teal-600 hover:underline">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
