import React from "react";
import { motion } from "framer-motion";
import { mobileStyles } from "../../styles/responsive";
import { buttonLayoutStyles } from "../../styles/responsive";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  isDarkMode,
  isLoading,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200";

  const variants = {
    primary: isDarkMode
      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
      : "bg-indigo-500 hover:bg-indigo-400 text-white",
    secondary: isDarkMode
      ? "bg-slate-700 hover:bg-slate-600 text-white"
      : "bg-gray-100 hover:bg-gray-200 text-gray-700",
    danger: isDarkMode
      ? "bg-red-600 hover:bg-red-500 text-white"
      : "bg-red-500 hover:bg-red-400 text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isLoading}
      className={`
        ${mobileStyles.form.button.base}
        ${mobileStyles.form.button[variant]}
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${isLoading ? "opacity-70 cursor-not-allowed" : ""}
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
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
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </motion.button>
  );
};

export const CreateButton = ({ onClick, label, icon, isDarkMode }) => {
  const shortLabel = label.replace("Stats", "").replace("Project", "");

  return (
    <>
      {/* Desktop version with text */}
      <button
        onClick={onClick}
        className={`
          ${buttonLayoutStyles.dashboardButtons.base}
          ${buttonLayoutStyles.dashboardButtons.mobile}
          ${
            isDarkMode
              ? "bg-gray-800 hover:bg-gray-700 text-white"
              : "bg-white hover:bg-gray-50 text-gray-800"
          }
          shadow-sm
        `}
      >
        {icon}
        <span className={buttonLayoutStyles.dashboardButtons.label}>
          {shortLabel}
        </span>
      </button>

      {/* Mobile version icon only */}
      <button
        onClick={onClick}
        className={`
          ${buttonLayoutStyles.dashboardButtons.base}
          ${buttonLayoutStyles.dashboardButtons.iconOnly}
          ${
            isDarkMode
              ? "bg-gray-800 hover:bg-gray-700 text-white"
              : "bg-white hover:bg-gray-50 text-gray-800"
          }
          shadow-sm
        `}
        aria-label={label}
      >
        {icon}
      </button>
    </>
  );
};
