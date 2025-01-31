import { useState } from 'react';

export const useSelectedState = () => {
  const [selectedIds, setSelectedIds] = useState({
    selectedProjectId: null,
    selectedTaskId: null,
    projectToDelete: null,
    taskToDelete: null,
  });

  const [inviteUserId, setInviteUserId] = useState("");

  const resetSelected = () => {
    setSelectedIds({
      selectedProjectId: null,
      selectedTaskId: null,
      projectToDelete: null,
      taskToDelete: null,
    });
    setInviteUserId("");
  };

  const selectProject = (projectId) => {
    setSelectedIds(prev => ({
      ...prev,
      selectedProjectId: projectId
    }));
  };

  const selectTask = (taskId) => {
    setSelectedIds(prev => ({
      ...prev,
      selectedTaskId: taskId
    }));
  };

  const selectForDelete = (id, type) => {
    setSelectedIds(prev => ({
      ...prev,
      [type === 'project' ? 'projectToDelete' : 'taskToDelete']: id,
      selectedProjectId: type === 'project' ? id : prev.selectedProjectId
    }));
  };

  return {
    selectedIds,
    setSelectedIds,
    inviteUserId,
    setInviteUserId,
    resetSelected,
    selectProject,
    selectTask,
    selectForDelete
  };
};
