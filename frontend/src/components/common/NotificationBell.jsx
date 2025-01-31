import React from "react";
import { motion } from "framer-motion";
import { FaBell } from "react-icons/fa";
import { useMediaQuery, BREAKPOINTS } from '../../styles/responsive';

export const NotificationBell = ({ count, onClick, isDarkMode }) => {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md})`);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative p-2 rounded-full
        ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
        transition-colors
        ${isMobile ? 'scale-90' : ''}
      `}
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
};
