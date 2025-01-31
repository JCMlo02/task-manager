import React from "react";
import { motion } from "framer-motion";
import { useMediaQuery, BREAKPOINTS } from "../../../styles/responsive";

const ProjectModal = ({ children, title, onClose, isDarkMode }) => {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md})`);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className={`fixed inset-0 ${
          isDarkMode ? "bg-black/70" : "bg-black/50"
        } backdrop-blur-sm`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className={`
            relative w-full max-w-lg rounded-xl shadow-2xl
            ${isDarkMode ? "bg-gray-900" : "bg-orange-50"}
            ${isMobile ? "min-h-[calc(100vh-2rem)]" : ""}
            overflow-hidden
          `}
        >
          {/* Header */}
          <div
            className={`
            px-6 py-4 border-b
            ${isDarkMode ? "border-gray-700" : "border-orange-200"}
          `}
          >
            <h3
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-orange-900"
              }`}
            >
              {title}
            </h3>
          </div>

          {/* Content */}
          <div className={`p-6 ${isDarkMode ? "" : "bg-white/50"}`}>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProjectModal;
