import React from "react";
import { motion } from "framer-motion";
import { THEME } from "../../../constants";
import {
  useMediaQuery,
  BREAKPOINTS,
  getModalSize,
} from "../../../styles/responsive";

const TaskModal = ({ children, title, onClose, isDarkMode }) => {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md})`);
  const modalSize = getModalSize(isMobile);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={modalSize}
      className={`
        relative w-full max-w-lg mx-auto mt-10 rounded-xl shadow-2xl 
        ${isDarkMode ? "bg-slate-900" : "bg-slate-100"} 
        max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col
      `}
      onClick={onClose}
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full max-w-lg mx-auto mt-10 rounded-xl shadow-2xl 
          ${isDarkMode ? "bg-slate-900" : "bg-orange-50"}
          max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col
        `}
      >
        {/* Header - Fixed */}
        <div
          className={`
          sticky top-0 z-10 px-6 py-4 border-b
          ${
            isDarkMode
              ? "bg-slate-900/95 border-slate-700"
              : "bg-orange-50/95 border-orange-200"
          }
        `}
        >
          <h3
            className={`text-xl font-bold ${
              isDarkMode ? THEME.dark.text : "text-orange-900"
            }`}
          >
            {title}
          </h3>
        </div>

        {/* Scrollable Content */}
        <div
          className={`
          flex-1 overflow-y-auto px-6 py-4
          ${isDarkMode ? "" : "bg-white/50"}
        `}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TaskModal;
