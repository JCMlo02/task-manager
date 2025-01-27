import React from "react";
import { motion } from "framer-motion";
import { FaTimesCircle } from "react-icons/fa";

const EnhancedModal = ({
  title,
  children,
  onClose,
  maxWidth = "max-w-md",
  customStyles = "",
  isDarkMode = false,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={`fixed inset-0 flex justify-center items-center overflow-y-auto p-4 z-50
      ${isDarkMode ? "bg-slate-900/75" : "bg-black/50"} backdrop-blur-sm`}
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className={`
        ${maxWidth} w-full rounded-xl shadow-2xl overflow-y-auto
        ${
          isDarkMode
            ? "bg-slate-800 text-slate-200 border border-slate-700"
            : "bg-white text-slate-800"
        }
        ${customStyles}
      `}
    >
      <div
        className={`
        p-6 
        ${isDarkMode ? "border-slate-700" : "border-slate-200"}
        ${title ? "border-b" : ""}
      `}
      >
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-2xl font-semibold ${
                isDarkMode ? "text-slate-200" : "text-teal-600"
              }`}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className={`
                rounded-lg p-2 transition-colors duration-200
                ${
                  isDarkMode
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              <FaTimesCircle className="w-5 h-5" />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className={`
              absolute top-4 right-4 rounded-lg p-2 transition-colors duration-200
              ${
                isDarkMode
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }
            `}
          >
            <FaTimesCircle className="w-5 h-5" />
          </button>
        )}
        <div className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
          {children}
        </div>
      </div>
    </motion.div>
  </motion.div>
);

export default EnhancedModal;
