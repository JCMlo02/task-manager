import React from 'react';
import { motion } from 'framer-motion';
import { FaTrashAlt, FaTimesCircle } from 'react-icons/fa';

const DeleteConfirmationModal = ({ isProjectDelete, onClose, onConfirm, isDarkMode }) => {
  const itemType = isProjectDelete ? 'project' : 'task';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`
          w-full max-w-md rounded-xl shadow-2xl overflow-hidden
          ${isDarkMode ? 'bg-slate-800' : 'bg-white'}
        `}
      >
        {/* Header */}
        <div className={`
          flex items-center justify-between px-6 py-4 border-b
          ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'}
        `}>
          <div className="flex items-center gap-3">
            <div className={`
              p-2 rounded-lg
              ${isDarkMode ? 'bg-red-500/10' : 'bg-red-50'}
            `}>
              <FaTrashAlt className={`w-5 h-5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} />
            </div>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Delete {itemType}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${isDarkMode ? 'hover:bg-slate-700/50 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}
            `}
          >
            <FaTimesCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`mb-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            Are you sure you want to delete this {itemType}? This action cannot be undone.
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                ${isDarkMode 
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}
              `}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors
                bg-red-500 hover:bg-red-600 text-white
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                ${isDarkMode ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'}
              `}
            >
              Delete {itemType}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteConfirmationModal;
