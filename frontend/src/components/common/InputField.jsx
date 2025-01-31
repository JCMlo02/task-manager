import React from 'react';

const InputField = ({ label, isDarkMode, ...props }) => (
  <div>
    <label className={`
      block text-sm font-medium mb-2
      ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
    `}>
      {label}
    </label>
    <input
      className={`
        w-full rounded-lg px-3 py-2
        ${isDarkMode 
          ? 'bg-gray-800 border-gray-700 text-white focus:border-teal-500' 
          : 'bg-white/90 border-emerald-200 text-gray-900 focus:border-emerald-500'}
        border focus:ring-2 focus:ring-opacity-50
        ${isDarkMode ? 'focus:ring-teal-500/20' : 'focus:ring-emerald-500/20'}
        transition-colors
      `}
      {...props}
    />
  </div>
);

export default InputField;