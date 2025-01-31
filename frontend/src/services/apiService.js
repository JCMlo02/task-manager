const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://9ehr6i4dpi.execute-api.us-east-1.amazonaws.com/dev";

export const projectService = {
  async getProjects(userId) {
    const response = await fetch(`${API_URL}/projects?userId=${userId}`, {
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error("Failed to fetch projects");
    return response.json();
  },

  async createProject(projectData) {
    const response = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) throw new Error("Failed to create project");
    return response.json();
  },

  async updateProject(projectId, updates) {
    const response = await fetch(
      `${API_URL}/projects?project_id=${projectId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );
    if (!response.ok) throw new Error("Failed to update project");
    return response.json();
  },

  async deleteProject(projectId, userId) {
    const response = await fetch(
      `${API_URL}/projects?project_id=${projectId}&userId=${userId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) throw new Error("Failed to delete project");
    return response.json();
  },
};

export const taskService = {
  async getAllTasks(userId) {
    const response = await fetch(
      `${API_URL}/tasks?all_projects=true&userId=${userId}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch tasks");
    return response.json();
  },

  async createTask(taskData) {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...taskData,
        creator_username: taskData.creator_username, // Ensure creator is included
      }),
    });
    if (!response.ok) throw new Error("Failed to create task");
    return response.json();
  },

  async updateTask(taskId, updates) {
    if (!taskId) {
      throw new Error("Missing required field: taskId");
    }

    try {
      const response = await fetch(`${API_URL}/tasks?task_id=${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task_id: taskId,
          name: updates.name,
          description: updates.description,
          project_id: updates.project_id,
          status: updates.status,
          priority: updates.priority,
          assigned_to: updates.assigned_to,
          assignee_username: updates.assignee_username,
          creator_username: updates.creator_username,
          comments: updates.comments || [],
          userId: updates.userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error:", errorData);
        throw new Error(errorData || "Failed to update task");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Task update error:", error);
      throw error;
    }
  },

  async deleteTask(taskId, projectId, userId) {
    const response = await fetch(
      `${API_URL}/tasks?task_id=${taskId}&project_id=${projectId}&userId=${userId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) throw new Error("Failed to delete task");
    return response.json();
  },

  async updateTaskStatus(taskId, projectId, status, userId) {
    const response = await fetch(`${API_URL}/tasks?task_id=${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_id: taskId,
        project_id: projectId,
        status,
        userId,
      }),
    });
    if (!response.ok) throw new Error("Failed to update task status");
    return response.json();
  },
};

export const inviteService = {
  async getPendingInvites(userId) {
    const response = await fetch(`${API_URL}/invites?userId=${userId}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to fetch invites");
    }
    return response.json();
  },

  async sendInvite(projectId, inviteeId, userId) {
    const response = await fetch(`${API_URL}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        invitee_id: inviteeId,
        userId: userId,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to send invitation");
    }
    return response.json();
  },

  async respondToInvite(projectId, status, userId) {
    const response = await fetch(`${API_URL}/invites`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: projectId,
        status: status.toUpperCase(),
        userId: userId,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to respond to invitation");
    }
    return response.json();
  },
};

export const userService = {
  async searchUsers(query, userId) {
    const response = await fetch(
      `${API_URL}/users?query=${query}&userId=${userId}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!response.ok) throw new Error("Failed to search users");
    return response.json();
  },
};
