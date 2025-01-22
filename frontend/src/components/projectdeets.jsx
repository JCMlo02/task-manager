import React, { useState, useEffect } from "react";
import axios from "axios";

const ProjectDetails = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [error, setError] = useState(null);

  // Fetch project details and tasks
  useEffect(() => {
    // Fetch project details from the API
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}`);
        setProject(response.data);
      } catch (err) {
        setError("Error fetching project details");
      }
    };

    // Fetch tasks related to the project
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/tasks`);
        setTasks(response.data);
      } catch (err) {
        setError("Error fetching tasks");
      }
    };

    fetchProjectDetails();
    fetchTasks();
  }, [projectId]);

  // Handle task creation
  const handleCreateTask = async () => {
    if (newTask.trim()) {
      try {
        const response = await axios.post(`/api/projects/${projectId}/tasks`, {
          task: newTask,
        });
        setTasks((prevTasks) => [...prevTasks, response.data]); // Add the new task
        setNewTask(""); // Clear input
      } catch (err) {
        setError("Error creating task");
      }
    }
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`/api/projects/${projectId}/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task.id !== taskId)); // Remove task from the list
    } catch (err) {
      setError("Error deleting task");
    }
  };

  // Handle task update
  const handleUpdateTask = async (taskId, updatedTask) => {
    try {
      const response = await axios.put(
        `/api/projects/${projectId}/tasks/${taskId}`,
        {
          task: updatedTask,
        }
      );
      setTasks(
        tasks.map((task) => (task.id === taskId ? response.data : task))
      );
    } catch (err) {
      setError("Error updating task");
    }
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      {project ? (
        <>
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p>{project.description}</p>
        </>
      ) : (
        <p>Loading project details...</p>
      )}

      <div className="my-4">
        <h3 className="text-xl font-semibold">Tasks</h3>
        <div className="my-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="border border-gray-300 p-2 rounded"
            placeholder="New task"
          />
          <button
            onClick={handleCreateTask}
            className="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Task
          </button>
        </div>
        <ul className="list-disc pl-5">
          {tasks.length === 0 ? (
            <li>No tasks found</li>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className="flex justify-between items-center">
                <span>{task.task}</span>
                <div>
                  <button
                    onClick={() =>
                      handleUpdateTask(
                        task.id,
                        prompt("Update task:", task.task)
                      )
                    }
                    className="ml-2 text-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="ml-2 text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProjectDetails;
