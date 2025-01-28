import React from 'react';

const InputField = ({ label, value, onChange, isDarkMode }) => (
  <div className="mb-4">
    <label className={`block mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
      {label}
    </label>
    <input
      type="text"
      className={`w-full px-4 py-2 rounded-lg transition-colors duration-200
        ${isDarkMode 
          ? 'bg-slate-700 border-slate-600 text-slate-200 focus:border-indigo-500' 
          : 'bg-white border-slate-200 text-slate-800 focus:border-teal-500'} 
        border focus:outline-none focus:ring-2 
        ${isDarkMode ? 'focus:ring-indigo-500/50' : 'focus:ring-teal-500/50'}`}
      value={value}
      onChange={onChange}
      required
    />
  </div>
);

export default InputField;