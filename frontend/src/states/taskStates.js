export const taskStateUtils = {
  updateTaskInList: (tasks, updatedTask) => {
    return tasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task
    );
  },

  removeTaskFromList: (tasks, taskId) => {
    return tasks.filter((task) => task.id !== taskId);
  },

  filterTasksByStatus: (tasks, status) => {
    return tasks.filter((task) => task.status === status);
  },

  updateTaskTimer: (tasks, taskId, time) => {
    return tasks.map(task =>
      task.task_id === taskId ? { ...task, timeSpent: time } : task
    );
  },

  updateTaskPriority: (tasks, taskId, priority) => {
    return tasks.map(task =>
      task.task_id === taskId ? { ...task, priority } : task
    );
  },

  updateTaskDependencies: (tasks, taskId, dependencies) => {
    return tasks.map(task =>
      task.task_id === taskId ? { ...task, dependencies } : task
    );
  },

  filterTasks: (tasks, { searchTerm, priority, assignee }) => {
    return tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priority === 'all' || task.priority === priority;
      const matchesAssignee = assignee === 'all' || task.assignee === assignee;
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }
};

export const projectStateUtils = {
  sortProjectsByDate: (projects) => {
    return [...projects].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  },
};
