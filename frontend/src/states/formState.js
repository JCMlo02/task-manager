import { useState } from 'react';

export const useFormState = () => {
  const [formState, setFormState] = useState({
    newProjectName: "",
    newProjectDescription: "",
    newTaskName: "",
    newTaskDescription: "",
    assignedTo: "",
  });

  const resetForm = () => {
    setFormState({
      newProjectName: "",
      newProjectDescription: "",
      newTaskName: "",
      newTaskDescription: "",
      assignedTo: "",
    });
  };

  return {
    formState,
    setFormState,
    resetForm,
  };
};
