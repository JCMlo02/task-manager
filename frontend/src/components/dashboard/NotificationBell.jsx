import React from "react";
import { motion } from "framer-motion";
import { FaBell } from "react-icons/fa";
export const NotificationBell = ({ count, onClick, isDarkMode }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative p-3 rounded-full ${
      isDarkMode
        ? "bg-slate-700 hover:bg-slate-600"
        : "bg-white hover:bg-slate-50"
    } shadow-lg transition-all duration-300`}
  >
    <FaBell
      className={`${count > 0 ? "text-indigo-500" : "text-slate-400"} text-xl`}
    />
    {count > 0 && (
      <span
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 
                        text-xs flex items-center justify-center animate-bounce"
      >
        {count}
      </span>
    )}
  </motion.button>
);
