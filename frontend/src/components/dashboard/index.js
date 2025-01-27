export const groupTasksByStatus = (tasks) => {
  const grouped = {
    BACKLOG: [],
    IN_PROGRESS: [],
    IN_TESTING: [],
    DONE: [],
  };

  tasks.forEach((task) => {
    const status = task.status || "BACKLOG";
    grouped[status].push(task);
  });

  return grouped;
};

export const withLoading = async (operation, setIsLoading, toast) => {
  setIsLoading(true);
  try {
    await operation();
    toast.success("Operation completed successfully!");
  } catch (err) {
    toast.error(err.message || "An error occurred");
  } finally {
    setIsLoading(false);
  }
};

export const taskReducer = (state, action) => {
  switch (action.type) {
    case "SET_TASKS":
      const normalizedTasks = Array.isArray(action.tasks)
        ? action.tasks.map((task) => ({
            ...task,
            task_id: String(task.task_id),
            project_id: String(task.project_id),
            status: task.status || TASK_STATUSES.BACKLOG,
          }))
        : [];

      // Group tasks by project
      const tasksByProject = normalizedTasks.reduce((acc, task) => {
        const projectId = String(task.project_id);
        if (!acc[projectId]) {
          acc[projectId] = [];
        }
        acc[projectId].push(task);
        return acc;
      }, {});

      // Sort tasks within each project by status
      const sortedTasksByProject = Object.keys(tasksByProject).reduce(
        (acc, projectId) => {
          acc[projectId] = sortTasks(tasksByProject[projectId]);
          return acc;
        },
        {}
      );

      return {
        ...state,
        allTasks: normalizedTasks, // Keep all tasks for analytics
        tasksByProject: sortedTasksByProject, // Keep project-specific sorted tasks
        isLoading: false,
        error: null,
      };

    case "SET_LOADING":
      return { ...state, isLoading: true };

    case "SET_ERROR":
      return {
        ...state,
        error: action.error,
        isLoading: false,
        lastError: new Date().toISOString(),
      };

    case "UPDATE_TASK_STATUS":
      const updatedTasks = state.allTasks.map((task) =>
        String(task.task_id) === String(action.taskId)
          ? { ...task, status: action.status }
          : task
      );

      // Update both global and project-specific tasks
      const updatedTasksByProject = updatedTasks.reduce((acc, task) => {
        const projectId = String(task.project_id);
        if (!acc[projectId]) {
          acc[projectId] = [];
        }
        acc[projectId].push(task);
        return acc;
      }, {});

      const updatedSortedTasksByProject = Object.keys(
        updatedTasksByProject
      ).reduce((acc, projectId) => {
        acc[projectId] = sortTasks(updatedTasksByProject[projectId]);
        return acc;
      }, {});

      return {
        ...state,
        allTasks: updatedTasks,
        tasksByProject: updatedSortedTasksByProject,
      };

    default:
      console.warn(`Unknown action type: ${action.type}`);
      return state;
  }
};

export const sortTasks = (tasks) => {
  if (!Array.isArray(tasks)) {
    console.error("Invalid tasks array:", tasks);
    return {
      [TASK_STATUSES.BACKLOG]: [],
      [TASK_STATUSES.IN_PROGRESS]: [],
      [TASK_STATUSES.IN_TESTING]: [],
      [TASK_STATUSES.DONE]: [],
    };
  }

  // Create initial structure with empty arrays
  const sorted = Object.values(TASK_STATUSES).reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {});

  // Sort tasks into appropriate status arrays
  tasks.forEach((task) => {
    if (task && task.task_id) {
      // Ensure task has a valid status or default to BACKLOG
      const status = Object.values(TASK_STATUSES).includes(task.status)
        ? task.status
        : TASK_STATUSES.BACKLOG;

      // Ensure task_id is a string
      const processedTask = {
        ...task,
        task_id: String(task.task_id),
        status,
      };

      sorted[status].push(processedTask);
    }
  });

  // Sort each status group
  Object.keys(sorted).forEach((status) => {
    sorted[status].sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at);
      const dateB = new Date(b.updated_at || b.created_at);
      return dateB - dateA;
    });
  });

  return sorted;
};

export const TASK_STATUSES = {
  BACKLOG: "BACKLOG", // Changed to uppercase
  IN_PROGRESS: "IN_PROGRESS", // Changed to uppercase with underscore
  IN_TESTING: "IN_TESTING", // Changed to uppercase with underscore
  DONE: "DONE", // Changed to uppercase
};

// Add a display names mapping for UI
export const STATUS_DISPLAY_NAMES = {
  BACKLOG: "Backlog",
  IN_PROGRESS: "In Progress",
  IN_TESTING: "In Testing",
  DONE: "Done",
};

export const THEME = {
  light: {
    bg: "bg-gradient-to-br from-slate-50 to-gray-100",
    text: "text-slate-700",
    accent: "text-indigo-600",
    card: "bg-white",
    hover: "hover:bg-slate-50",
  },
  dark: {
    bg: "bg-gradient-to-br from-slate-800 to-slate-900",
    text: "text-slate-200",
    accent: "text-indigo-400",
    card: "bg-slate-800",
    hover: "hover:bg-slate-700",
  },
};
