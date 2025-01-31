import React, { useState } from "react";
import InputField from "../../common/InputField";
import TextAreaField from "../../common/TextAreaField";
import SelectField from "../../common/SelectField";
import FormLayout, { FormSection, FormActions } from "../../common/FormLayout";
import { CreateButton } from "../../common/Button";
import TaskTemplates from "./TaskTemplates"; 
import { TASK_PRIORITIES } from "../../../constants";
import { useMediaQuery, BREAKPOINTS, mobileStyles } from '../../../styles/responsive';

const TaskForm = ({
  onSubmit,
  initialData = {},
  onCancel,
  isDarkMode,
  projectMembers = [],
  currentUser,
}) => {
  const labelClass = `block text-sm font-medium mb-2 ${
    isDarkMode ? "text-gray-300" : "text-gray-700"
  }`;

  const [formData, setFormData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    assigned_to: initialData.assigned_to || "",
    priority: initialData.priority || "MEDIUM", // Make sure priority is initialized
    comments: initialData.comments || [],
  });

  const handleTemplateSelect = (template) => {
    // Just update the form data without submitting
    setFormData((prev) => ({
      ...prev,
      name: template.name,
      description: template.description,
      priority: template.priority,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e, formData); // This will now include the priority
  };

  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md})`);

  return (
    <FormLayout onSubmit={handleSubmit} className={mobileStyles.form.field}>
      {/* Add Templates Section */}
      <div className="mb-6">
        <h3
          className={`text-sm font-medium mb-2 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Quick Templates
        </h3>
        <TaskTemplates
          onSelectTemplate={handleTemplateSelect}
          isDarkMode={isDarkMode}
        />
      </div>

      <FormSection>
        <div className={`space-y-${isMobile ? '3' : '4'}`}>
          <InputField
            label="Task Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            isDarkMode={isDarkMode}
            required
            placeholder="Enter a clear, concise task name"
            autoFocus
          />

          <TextAreaField
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            isDarkMode={isDarkMode}
            placeholder="Add details about this task..."
            rows={4}
          />

          <SelectField
            label="Assign To"
            value={formData.assigned_to}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, assigned_to: e.target.value }))
            }
            options={[
              { value: "", label: "Select team member" },
              ...projectMembers.map((member) => ({
                value: member.user_id,
                label: member.username,
              })),
            ]}
            isDarkMode={isDarkMode}
          />

          <div className="mb-4">
            <label className={labelClass}>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, priority: e.target.value }))
              }
              className={`
                w-full rounded-lg p-2 border
                ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                }
              `}
            >
              {Object.entries(TASK_PRIORITIES).map(([key, priority]) => (
                <option key={key} value={key}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      <FormActions isDarkMode={isDarkMode} isMobile={isMobile}>
        <CreateButton
          type="submit"
          label="Confirm"
          isDarkMode={isDarkMode}
          className="min-w-[120px]"
        >
          {initialData.task_id ? "Save Changes" : "Create Task"}
        </CreateButton>
        <CreateButton
          type="button"
          label="Cancel"
          variant="secondary"
          onClick={onCancel}
          isDarkMode={isDarkMode}
        >
          Cancel
        </CreateButton>
      </FormActions>
    </FormLayout>
  );
};

export default TaskForm;
