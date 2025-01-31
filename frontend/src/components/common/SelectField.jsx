import React from 'react';

const SelectField = ({ label, value, onChange, options = [], isDarkMode, className = '', ...props }) => (
  <div className="space-y-1">
    {label && (
      <label className={`
        block font-medium
        ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}
      `}>
        {label}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      className={`
        w-full px-3 py-2 rounded-lg border
        ${isDarkMode 
          ? 'bg-slate-800 border-slate-600 text-white focus:border-indigo-500' 
          : 'bg-white border-gray-300 focus:border-indigo-500'}
        transition-colors duration-200
        ${className}
      `}
      {...props}
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
