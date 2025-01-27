import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';

const ModalActions = ({ onCancel, onConfirm, submitLabel, confirmLabel, isDarkMode }) => (
  <div className="flex justify-end gap-4 mt-6">
    <button
      type="button"
      onClick={onCancel}
      className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2
        ${isDarkMode 
          ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
    >
      <FaTimesCircle />
      Cancel
    </button>
    {onConfirm ? (
      <button
        type="button"
        onClick={onConfirm}
        className={`px-4 py-2 rounded-lg transition-colors duration-200
          ${isDarkMode 
            ? 'bg-indigo-600 hover:bg-indigo-700' 
            : 'bg-teal-600 hover:bg-teal-700'} 
          text-white`}
      >
        {confirmLabel}
      </button>
    ) : (
      <button
        type="submit"
        className={`px-4 py-2 rounded-lg transition-colors duration-200
          ${isDarkMode 
            ? 'bg-indigo-600 hover:bg-indigo-700' 
            : 'bg-teal-600 hover:bg-teal-700'} 
          text-white`}
      >
        {submitLabel}
      </button>
    )}
  </div>
);

export default ModalActions;