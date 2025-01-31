import { cleanTaskData, removeDuplicateTasks } from "../utils/taskutils";

const CACHE_KEYS = {
  TASKS: "tasks_",
  PROJECTS: "projects_",
  LAST_SYNC: "last_sync_",
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export class CacheService {
  static CACHE_KEYS = CACHE_KEYS;
  static CACHE_TTL = CACHE_TTL;

  // Base cache operations
  static getUserSpecificKey(key, userId) {
    return `${userId}_${key}`;
  }

  static setItem(key, data, userId) {
    try {
      const userKey = this.getUserSpecificKey(key, userId);
      localStorage.setItem(userKey, JSON.stringify(data));
      console.log("Saved to cache:", userKey); // Debug log
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  }

  static getItem(key, userId) {
    try {
      const userKey = this.getUserSpecificKey(key, userId);
      const item = localStorage.getItem(userKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error reading from cache:", error);
      return null;
    }
  }

  // Sync management
  static getLastSync(userId) {
    return this.getItem(CACHE_KEYS.LAST_SYNC, userId) || "0";
  }

  static setLastSync(userId) {
    this.setItem(CACHE_KEYS.LAST_SYNC, userId, Date.now().toString());
  }

  static isCacheValid(userId) {
    const lastSync = this.getLastSync(userId);
    return lastSync && Date.now() - Number(lastSync) < CACHE_TTL;
  }

  static isStale(timestamp) {
    return Date.now() - Number(timestamp) > CACHE_TTL;
  }

  // Task operations
  static getTasks(userId) {
    try {
      const cached = localStorage.getItem(`${CACHE_KEYS.TASKS}${userId}`);
      if (!cached) return [];
      const tasks = JSON.parse(cached);
      return removeDuplicateTasks(tasks.map(cleanTaskData).filter(Boolean));
    } catch (error) {
      console.error("Cache read error:", error);
      return [];
    }
  }

  static setTasks(tasks, userId) {
    try {
      const cleanedTasks = removeDuplicateTasks(
        tasks.map(cleanTaskData).filter(Boolean)
      );
      localStorage.setItem(
        `${CACHE_KEYS.TASKS}${userId}`,
        JSON.stringify(cleanedTasks)
      );
      this.setLastSync(userId);
      return cleanedTasks;
    } catch (error) {
      console.error("Cache write error:", error);
      return tasks;
    }
  }

  static updateTask(updatedTask, userId) {
    try {
      const tasks = this.getTasks(userId);
      const cleaned = cleanTaskData(updatedTask);
      if (!cleaned) return tasks;

      // Ensure we're only updating existing tasks, not creating new ones
      const exists = tasks.some(
        (t) => String(t.task_id) === String(cleaned.task_id)
      );
      if (!exists) {
        console.error(
          "Attempted to update non-existent task:",
          cleaned.task_id
        );
        return tasks;
      }

      // Update the task while preserving all fields
      const updated = tasks.map((task) =>
        String(task.task_id) === String(cleaned.task_id)
          ? { ...task, ...cleaned }
          : task
      );
      console.log("CACHE TASKS");
      console.log(updated);

      return this.setTasks(updated, userId);
    } catch (error) {
      console.error("Cache update error:", error);
      return this.getTasks(userId);
    }
  }

  static addTask(newTask, userId) {
    try {
      const tasks = this.getTasks(userId);
      const cleaned = cleanTaskData(newTask);

      if (!cleaned || !cleaned.task_id) {
        console.error("Invalid task data:", newTask);
        return tasks;
      }

      // Check for existing task with same ID
      const taskId = String(cleaned.task_id);
      const existingTask = tasks.find((t) => String(t.task_id) === taskId);

      if (existingTask) {
        console.warn("Task ID already exists, updating instead:", taskId);
        return this.updateTask(cleaned, userId);
      }

      console.log("Adding new task:", cleaned); // Debug log
      const updatedTasks = [...tasks, cleaned];
      return this.setTasks(updatedTasks, userId);
    } catch (error) {
      console.error("Cache add task error:", error);
      return this.getTasks(userId);
    }
  }

  static deleteTask(taskId, userId) {
    try {
      const tasks = this.getTasks(userId);
      const updated = tasks.filter((task) => task.task_id !== taskId);
      return this.setTasks(updated, userId);
    } catch (error) {
      console.error("Cache delete error:", error);
      return this.getTasks(userId);
    }
  }

  // Project operations
  static setProjects(projects, userId) {
    if (!userId) return;
    try {
      localStorage.setItem(
        `${this.CACHE_KEYS.PROJECTS}_${userId}`,
        JSON.stringify(projects)
      );
    } catch (error) {
      console.error('Error caching projects:', error);
    }
  }

  static getProjects(userId) {
    if (!userId) return [];
    try {
      const cached = localStorage.getItem(`${this.CACHE_KEYS.PROJECTS}_${userId}`);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error reading projects cache:', error);
      return [];
    }
  }

  static updateProject(updatedProject, userId) {
    const projects = this.getProjects(userId);
    const updated = projects.map((project) =>
      project.project_id === updatedProject.project_id
        ? { ...project, ...updatedProject }
        : project
    );
    return this.setProjects(updated, userId);
  }

  static addProject(project, userId) {
    const projects = this.getProjects(userId);
    return this.setProjects([...projects, project], userId);
  }

  static deleteProject(projectId, userId) {
    const projects = this.getProjects(userId);
    const updated = projects.filter((p) => p.project_id !== projectId);
    this.setProjects(updated, userId);
    this.deleteProjectTasks(projectId, userId);
    return updated;
  }

  // Combined operations
  static deleteProjectTasks(projectId, userId) {
    const tasks = this.getTasks(userId);
    const updated = tasks.filter((t) => t.project_id !== projectId);
    return this.setTasks(updated, userId);
  }

  static updateTaskStatus(taskId, projectId, newStatus, userId) {
    const tasks = this.getTasks(userId);
    const updated = tasks.map((task) =>
      task.task_id === taskId ? { ...task, status: newStatus } : task
    );
    return this.setTasks(updated, userId);
  }

  static mergeWithCache(newTasks, userId) {
    try {
      const cachedTasks = this.getTasks(userId);
      const merged = [...cachedTasks];

      newTasks.forEach((newTask) => {
        const index = merged.findIndex(
          (task) => task.task_id === newTask.task_id
        );
        if (index >= 0) {
          const cached = merged[index];
          const newUpdatedAt = new Date(
            newTask.updated_at || newTask.created_at
          ).getTime();
          const cachedUpdatedAt = new Date(
            cached.updated_at || cached.created_at
          ).getTime();

          if (newUpdatedAt > cachedUpdatedAt) {
            merged[index] = cleanTaskData(newTask);
          }
        } else {
          merged.push(cleanTaskData(newTask));
        }
      });

      return this.setTasks(merged, userId);
    } catch (error) {
      console.error("Cache merge error:", error);
      return newTasks;
    }
  }

  // Cache management
  static clearCache(userId) {
    try {
      localStorage.removeItem(`${CACHE_KEYS.TASKS}${userId}`);
      localStorage.removeItem(`${CACHE_KEYS.PROJECTS}${userId}`);
      localStorage.removeItem(`${CACHE_KEYS.LAST_SYNC}${userId}`);
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }
}

export { CACHE_KEYS };
