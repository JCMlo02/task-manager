import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ size = 'text-4xl', color = 'text-teal-600' }) => (
  <div className="flex justify-center items-center h-64">
    <FaSpinner className={`animate-spin ${size} ${color}`} />
  </div>
);

export default LoadingSpinner;