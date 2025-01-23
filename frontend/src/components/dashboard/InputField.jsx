import React from 'react';

const InputField = ({ label, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-gray-600">{label}</label>
    <input
      type="text"
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
      value={value}
      onChange={onChange}
      required
    />
  </div>
);

export default InputField;