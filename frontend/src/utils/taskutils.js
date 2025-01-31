import { TASK_STATUSES } from "../constants";

export const groupTasksByStatus = (tasks, projectId) => {
  if (!Array.isArray(tasks) || !projectId) {
    return Object.keys(TASK_STATUSES).reduce((acc, key) => {
      acc[TASK_STATUSES[key]] = [];
      return acc;
    }, {});
  }

  // Initialize groups with empty arrays for each status
  const grouped = Object.keys(TASK_STATUSES).reduce((acc, key) => {
    acc[TASK_STATUSES[key]] = [];
    return acc;
  }, {});

  // Filter and group tasks
  tasks
    .filter(task => 
      task && 
      task.project_id && 
      String(task.project_id) === String(projectId)
    )
    .forEach(task => {
      const status = task.status || "BACKLOG";
      if (grouped.hasOwnProperty(status)) {
        grouped[status].push(task);
      }
    });

  return grouped;
};

export const sortTasks = (tasks) => {
  if (!Array.isArray(tasks)) return [];

  return [...tasks]
    .filter(task => task && task.task_id) // Only process valid tasks
    .sort((a, b) => {
      const priorities = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff = (priorities[b.priority] || 2) - (priorities[a.priority] || 2);
      
      if (priorityDiff !== 0) return priorityDiff;
      
      const dateA = new Date(b.updated_at || b.created_at);
      const dateB = new Date(a.updated_at || a.created_at);
      return dateA - dateB;
    });
};

export const validateTask = (task) => {
  return (
    task &&
    task.task_id &&
    task.project_id &&
    task.name &&
    typeof task.status === 'string'
  );
};

export const cleanTaskData = (task) => {
  if (!task) return null;
  
  // Ensure task_id is always a string
  return {
    task_id: String(task.task_id),
    name: task.name || '',
    description: task.description || '',
    project_id: String(task.project_id),
    status: task.status || 'BACKLOG',
    assigned_to: task.assigned_to || null,
    assignee_username: task.assignee_username || null,
    creator_username: task.creator_username || '',
    priority: task.priority || 'MEDIUM',
    comments: Array.isArray(task.comments) ? task.comments : [],
    created_at: task.created_at || new Date().toISOString(),
    updated_at: task.updated_at || new Date().toISOString()
  };
};

export const removeDuplicateTasks = (tasks) => {
  const seen = new Set();
  return tasks.filter(task => {
    if (!task || !task.task_id) return false;
    const taskId = String(task.task_id);
    const duplicate = seen.has(taskId);
    seen.add(taskId);
    return !duplicate;
  });
};
