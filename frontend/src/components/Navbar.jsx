import React from "react";
import { Link, useNavigate } from "react-router-dom";
import tikiLogo from "../assets/nobgLogo.png";

const Navbar = ({ userPool, isDarkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const currentUser = userPool.getCurrentUser();

  // Sign out function
  const signOut = () => {
    if (currentUser) {
      currentUser.signOut();
      navigate("/"); // Redirect to homepage after sign out
      window.location.reload();
    }
  };

  return (
    <nav
      className={`flex items-center justify-between p-4 shadow-lg rounded-b-lg ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-teal-600 text-white"
      }`}
    >
      <div className="w-40 h-30 overflow-hidden flex items-center justify-center">
        <a href="/">
          <img src={tikiLogo} alt="TikiTask Logo" className="w-auto h-auto" />
        </a>
      </div>

      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle Button */}
        <div
          className="relative inline-block w-16 h-9 cursor-pointer"
          onClick={toggleDarkMode}
        >
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleDarkMode}
            className="sr-only"
          />
          <div
            className={`toggle-label block w-full h-full rounded-full transition-colors ${
              isDarkMode ? "bg-teal-500" : "bg-teal-200"
            }`}
          >
            <div
              className={`dot absolute top-1/2 transform -translate-y-1/2 transition-all rounded-full bg-white w-7 h-7 ${
                isDarkMode ? "translate-x-9" : "translate-x-0"
              }`}
            ></div>
          </div>
        </div>

        {/* Conditional Login/Sign Out Button */}
        {currentUser ? (
          <button
            onClick={signOut}
            className="py-2 px-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 focus:outline-none transition-all"
          >
            Sign Out
          </button>
        ) : (
          <Link to="/login">
            <button className="py-2 px-4 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 focus:outline-none transition-all">
              Login Here
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
