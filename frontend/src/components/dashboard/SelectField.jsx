import React from 'react';

const SelectField = ({ label, value, onChange, options, required = true }) => (
  <div className="mb-4">
    <label className="block text-gray-600 mb-2">{label}</label>
    <select
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300
        bg-white text-gray-700 transition-all duration-200"
      value={value}
      onChange={onChange}
      required={required}
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
