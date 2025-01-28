import React from 'react';

const SelectField = ({ label, value, onChange, options, isDarkMode, required = false }) => (
  <div className="mb-4">
    <label className={`block mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-4 py-2 rounded-lg transition-colors duration-200
        ${isDarkMode 
          ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-indigo-500' 
          : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'} 
        border focus:outline-none focus:ring-2 
        ${isDarkMode ? 'focus:ring-indigo-500/50' : 'focus:ring-teal-500/50'}`}
    >
      {options.map(option => (
        <option 
          key={option.value} 
          value={option.value}
          className={isDarkMode ? 'bg-slate-700' : 'bg-white'}
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
