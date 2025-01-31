import React, { useState } from "react";
import { motion } from "framer-motion";
import { useMediaQuery, BREAKPOINTS } from '../../../styles/responsive';
import InputField from "../../common/InputField";
import TextAreaField from "../../common/TextAreaField";

const ProjectForm = ({ onSubmit, initialData = {}, onCancel, isDarkMode }) => {
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md})`);
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData, !!initialData.project_id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <InputField
          label="Project Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          placeholder="Enter project name"
          isDarkMode={isDarkMode}
          autoFocus
        />

        <TextAreaField
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe your project..."
          isDarkMode={isDarkMode}
          rows={4}
        />
      </div>

      {/* Actions */}
      <div className={`
        flex ${isMobile ? 'flex-col' : 'flex-row-reverse'} gap-3 
        ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
      `}>
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium
            ${isDarkMode 
              ? 'bg-teal-600 hover:bg-teal-500 text-white' 
              : 'bg-teal-500 hover:bg-teal-600 text-white'}
            transition-colors disabled:opacity-50
          `}
        >
          {isLoading ? 'Saving...' : initialData.project_id ? 'Save Changes' : 'Create Project'}
        </motion.button>
        
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            flex-1 px-4 py-2 rounded-lg font-medium
            ${isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}
            transition-colors
          `}
        >
          Cancel
        </motion.button>
      </div>
    </form>
  );
};

export default ProjectForm;
