import React, { useState } from 'react';
import InputField from './InputField';
import TextAreaField from './TextAreaField';
import ModalActions from './ModalActions';

const ProjectForm = ({ initialData, onSubmit, onCancel, isDarkMode }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, !!initialData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        label="Project Name"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
        }
        isDarkMode={isDarkMode}
      />
      <TextAreaField
        label="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, description: e.target.value }))
        }
        isDarkMode={isDarkMode}
      />
      <ModalActions
        onCancel={onCancel}
        submitLabel={initialData ? "Save Changes" : "Create Project"}
        isDarkMode={isDarkMode}
      />
    </form>
  );
};

export default ProjectForm;
