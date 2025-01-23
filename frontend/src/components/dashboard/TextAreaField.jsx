import React from 'react';

const TextAreaField = ({ label, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-gray-600">{label}</label>
    <textarea
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
      value={value}
      onChange={onChange}
      required
    />
  </div>
);

export default TextAreaField;