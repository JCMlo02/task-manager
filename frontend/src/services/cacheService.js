const CACHE_KEYS = {
  PROJECTS: 'projects',
  TASKS: 'tasks',
  LAST_SYNC: 'lastSync',
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

export class CacheService {
  static getUserSpecificKey(key, userId) {
    return `${userId}_${key}`;
  }

  static setItem(key, data, userId) {
    try {
      const userKey = this.getUserSpecificKey(key, userId);
      localStorage.setItem(userKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  static getItem(key, userId) {
    try {
      const userKey = this.getUserSpecificKey(key, userId);
      const item = localStorage.getItem(userKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  }

  static clearCache(userId) {
    // Clear only this user's data
    if (userId) {
      Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(this.getUserSpecificKey(key, userId));
      });
    } else {
      // Clear all cache if no userId provided
      localStorage.clear();
    }
  }

  static isCacheValid(userId) {
    const lastSync = this.getItem(CACHE_KEYS.LAST_SYNC, userId);
    return lastSync && (Date.now() - lastSync) < CACHE_TTL;
  }

  static updateLastSync(userId) {
    this.setItem(CACHE_KEYS.LAST_SYNC, Date.now(), userId);
  }

  // Project cache methods
  static getProjects(userId) {
    return this.getItem(CACHE_KEYS.PROJECTS, userId) || [];
  }

  static setProjects(projects, userId) {
    this.setItem(CACHE_KEYS.PROJECTS, projects, userId);
    this.updateLastSync(userId);
  }

  static updateProject(updatedProject, userId) {
    const projects = this.getProjects(userId);
    const index = projects.findIndex(p => p.project_id === updatedProject.project_id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updatedProject };
      this.setProjects(projects, userId);
    }
  }

  static deleteProject(projectId, userId) {
    const projects = this.getProjects(userId);
    this.setProjects(projects.filter(p => p.project_id !== projectId), userId);
    // Also delete associated tasks
    this.deleteTasks(projectId, userId);
  }

  // Task cache methods
  static getTasks(userId) {
    return this.getItem(CACHE_KEYS.TASKS, userId) || [];
  }

  static setTasks(tasks, userId) {
    this.setItem(CACHE_KEYS.TASKS, tasks, userId);
    this.updateLastSync(userId);
  }

  static updateTask(updatedTask, userId) {
    const tasks = this.getTasks(userId);
    const index = tasks.findIndex(t => t.task_id === updatedTask.task_id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updatedTask };
      this.setTasks(tasks, userId);
    }
  }

  static deleteTask(taskId, userId) {
    const tasks = this.getTasks(userId);
    this.setTasks(tasks.filter(t => t.task_id !== taskId), userId);
  }

  static deleteTasks(projectId, userId) {
    const tasks = this.getTasks(userId);
    this.setTasks(tasks.filter(t => t.project_id !== projectId), userId);
  }
}

export { CACHE_KEYS };
