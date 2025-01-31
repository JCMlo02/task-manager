import React from 'react';

const TextAreaField = ({ label, value, onChange, isDarkMode, rows = 4, className = '', ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className={`
        block font-medium
        ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}
      `}>
        {label}
      </label>
    )}
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      className={`
        w-full px-3 py-2 rounded-lg border resize-none
        ${isDarkMode 
          ? 'bg-slate-800 border-slate-600 text-white focus:border-indigo-500' 
          : 'bg-white border-gray-300 focus:border-indigo-500'}
        transition-colors duration-200
        ${className}
      `}
      {...props}
    />
  </div>
);

export default TextAreaField;