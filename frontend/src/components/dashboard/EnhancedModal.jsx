import React from "react";
import { motion } from "framer-motion";
import { FaTimesCircle } from "react-icons/fa";

const EnhancedModal = ({ title, children, onClose, maxWidth = "max-w-md" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center overflow-y-auto p-4"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} p-6 max-h-screen overflow-y-auto`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-teal-600">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FaTimesCircle />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

export default EnhancedModal;
