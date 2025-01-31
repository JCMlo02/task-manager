import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const BackButton = ({ onClick, isDarkMode }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-lg
      transition-colors duration-200
      ${isDarkMode 
        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}
    `}
  >
    <FaArrowLeft className="w-4 h-4" />
    <span>Back to Projects</span>
  </button>
);

export default BackButton;
