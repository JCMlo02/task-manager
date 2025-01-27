import React, { useState } from 'react';
import InputField from './InputField';
import TextAreaField from './TextAreaField';
import SelectField from './SelectField';
import ModalActions from './ModalActions';

const TaskForm = ({
  onSubmit,
  initialData = {},
  onCancel,
  isDarkMode,
  projectMembers = [],
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    assigned_to: initialData.assigned_to || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, formData);  // Pass the event object and form data
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        label="Task Name"
        value={formData.name}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, name: e.target.value }))
        }
        isDarkMode={isDarkMode}
        required
      />
      <TextAreaField
        label="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, description: e.target.value }))
        }
        isDarkMode={isDarkMode}
      />
      <SelectField
        label="Assign To"
        value={formData.assigned_to}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, assigned_to: e.target.value }))
        }
        options={[
          { value: "", label: "Select an assignee" },
          ...projectMembers.map((member) => ({
            value: member.user_id,
            label: member.username,
          })),
        ]}
        isDarkMode={isDarkMode}
        required={false}
      />
      <ModalActions
        onCancel={onCancel}
        submitLabel={initialData.task_id ? "Save Changes" : "Create Task"}
        isDarkMode={isDarkMode}
      />
    </form>
  );
};

export default TaskForm;
