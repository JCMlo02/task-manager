import React from 'react';
import { FaTimesCircle } from 'react-icons/fa';

const ModalActions = ({ onCancel, onConfirm, submitLabel, confirmLabel }) => (
  <div className="flex justify-end space-x-4">
    <button
      type="button"
      onClick={onCancel}
      className="px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
    >
      <FaTimesCircle />
    </button>
    {onConfirm ? (
      <button
        type="button"
        onClick={onConfirm}
        className="px-6 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700"
      >
        {confirmLabel}
      </button>
    ) : (
      <button
        type="submit"
        className="px-6 py-2 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-700"
      >
        {submitLabel}
      </button>
    )}
  </div>
);

export default ModalActions;