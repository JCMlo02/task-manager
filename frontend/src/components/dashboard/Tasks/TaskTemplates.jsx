import React from 'react';

const TaskTemplates = ({ onSelectTemplate, isDarkMode }) => {
  const TEMPLATES = {
    bug: {
      name: "Bug Report",
      description: "## Description\n\n## Steps to Reproduce\n\n## Expected Behavior",
      priority: "HIGH",
      tags: ["bug"]
    },
    feature: {
      name: "Feature Request",
      description: "## Overview\n\n## User Story\n\n## Acceptance Criteria",
      priority: "MEDIUM",
      tags: ["feature"]
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(TEMPLATES).map(([key, template]) => (
        <button
          key={key}
          type="button" 
          onClick={() => onSelectTemplate(template)}
          className={`p-4 rounded-lg text-left transition-colors
            ${isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' 
              : 'bg-white hover:bg-gray-50 border-gray-200'}
            border`}
        >
          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {template.name}
          </h3>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Click to use template
          </p>
        </button>
      ))}
    </div>
  );
};

export default TaskTemplates;
