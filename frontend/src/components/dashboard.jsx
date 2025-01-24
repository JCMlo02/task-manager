import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import {
  FaPlusCircle,
  FaEdit,
  FaTasks,
  FaTimesCircle,
  FaTrashAlt,
  FaUserPlus,
  FaBell,
  FaCheck,
  FaTimes,
  FaEllipsisV,
} from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Menu, MenuItem } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import LoadingSpinner from "./dashboard/LoadingSpinner";
import InputField from "./dashboard/InputField";
import TextAreaField from "./dashboard/TextAreaField";
import ModalActions from "./dashboard/ModalActions";
import AnalyticsDashboard from "./dashboard/AnalyticsDashboard";

/**
 * Select Field Component
 * @component
 * @param {Object} props
 * @param {string} props.label - Field label
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array<{value: string, label: string}>} props.options - Select options
 * @param {boolean} [props.required=true] - Whether field is required
 */
const SelectField = ({ label, value, onChange, options, required = true }) => (
  <div className="mb-4">
    <label className="block text-gray-600 mb-2">{label}</label>
    <select
      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300
        bg-white text-gray-700 transition-all duration-200"
      value={value}
      onChange={onChange}
      required={required}
    >
      <option value="">Select an option</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const API_URL = "https://9ehr6i4dpi.execute-api.us-east-1.amazonaws.com/dev";

/**
 * Task status constants used throughout the application
 * @type {Object.<string, string>}
 */
const TASK_STATUSES = {
  BACKLOG: "BACKLOG", // Changed to uppercase
  IN_PROGRESS: "IN_PROGRESS", // Changed to uppercase with underscore
  IN_TESTING: "IN_TESTING", // Changed to uppercase with underscore
  DONE: "DONE", // Changed to uppercase
};

// Add a display names mapping for UI
const STATUS_DISPLAY_NAMES = {
  BACKLOG: "Backlog",
  IN_PROGRESS: "In Progress",
  IN_TESTING: "In Testing",
  DONE: "Done",
};

/**
 * Status color mapping for visual representation
 * @type {Object.<string, string>}
 */
const statusColors = {
  BACKLOG: "bg-slate-100 border-slate-200 hover:bg-slate-50",
  IN_PROGRESS: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  IN_TESTING: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  DONE: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
};

// Updated color scheme constants
const THEME = {
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

/**
 * Dashboard Component - Main application dashboard for task management
 *
 * @component
 * @param {Object} props
 * @param {Object} props.userPool - Cognito user pool instance for authentication
 *
 * @example
 * return (
 *   <Dashboard userPool={userPool} />
 * )
 *
 * @description
 * Provides a comprehensive dashboard interface for:
 * - Project management (create, edit, delete projects)
 * - Task management (create, edit, delete, drag-n-drop tasks)
 * - User collaboration (invite users, handle invitations)
 * - Dark/Light mode theming
 *
 * Features:
 * - Real-time status updates
 * - Drag and drop task management
 * - Project collaboration
 * - User notifications
 * - Responsive design
 *
 * State Management:
 * - Projects and tasks data
 * - Modal states for various operations
 * - Form states for input handling
 * - Loading states for async operations
 * - Theme preferences
 *
 * @requires
 * - React
 * - react-beautiful-dnd
 * - framer-motion
 * - AWS Cognito
 * - react-hot-toast
 *
 * @returns {JSX.Element} Rendered Dashboard component
 */
const Dashboard = ({ userPool }) => {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [sub, setSub] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("isDarkMode") === "true"
  );
  const [isLoading, setIsLoading] = useState(false);

  const [modalState, setModalState] = useState({
    isProjectModalOpen: false,
    isTaskModalOpen: false,
    isCreateTaskModalOpen: false,
    isDeleteConfirmationOpen: false,
  });

  const [formState, setFormState] = useState({
    newProjectName: "",
    newProjectDescription: "",
    newTaskName: "",
    newTaskDescription: "",
    assignedTo: "",
  });

  const [selectedIds, setSelectedIds] = useState({
    selectedProjectId: null,
    selectedTaskId: null,
    projectToDelete: null,
    taskToDelete: null,
  });

  const [showInviteModal, setShowInviteModal] = useState(false);

  const [pendingInvites, setPendingInvites] = useState([]);
  const [showInvitesModal, setShowInvitesModal] = useState(false);

  const [inviteUserId, setInviteUserId] = useState("");

  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isFetchingProjects, setIsFetchingProjects] = useState(false);
  const [isFetchingTasks, setIsFetchingTasks] = useState(false);

  const [globalTasks, setGlobalTasks] = useState({
    byProject: {}, // Tasks organized by project
    allTasks: [], // Flat array of all tasks
    isLoading: false,
    error: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.getSession((err, session) => {
        if (err) {
          setError(err.message || "Error getting session");
          return;
        }
        setUser(currentUser);
        const sub = session.getIdToken().payload.sub;
        setSub(sub);
      });
    } else {
      navigate("/"); // Redirect to home page if no user is logged in
    }
  }, [userPool, navigate]);

  useEffect(() => {
    if (sub) {
      const fetchData = async () => {
        await fetchProjects();
        await fetchPendingInvites();
      };
      fetchData();
    }
  }, [sub]); // eslint-disable-line react-hooks/exhaustive-deps

  // Add new function to fetch all tasks for all projects
  const fetchAllTasks = async () => {
    setGlobalTasks((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(
        `${API_URL}/tasks?all_projects=true&userId=${sub}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();

      // Organize tasks by project
      const tasksByProject = data.reduce((acc, task) => {
        if (!acc[task.project_id]) {
          acc[task.project_id] = [];
        }
        acc[task.project_id].push(task);
        return acc;
      }, {});

      setGlobalTasks({
        byProject: tasksByProject,
        allTasks: data,
        isLoading: false,
        error: null,
      });

      console.log("Updated global tasks:", { tasksByProject, allTasks: data });
    } catch (err) {
      console.error("Error fetching all tasks:", err);
      setGlobalTasks((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message,
      }));
      toast.error("Failed to fetch tasks");
    }
  };

  // Update fetchProjects to also fetch all tasks after projects are loaded
  const fetchProjects = async () => {
    setIsFetchingProjects(true);
    try {
      const response = await fetch(`${API_URL}/projects?userId=${sub}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to fetch projects");
      const data = await response.json();
      // Data now includes members array and role for each project
      setProjects(data);
      // Fetch all tasks after projects are loaded
      await fetchAllTasks();
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch projects");
    } finally {
      setIsFetchingProjects(false);
    }
  };

  // Update fetchTasks to also update allTasks
  const fetchTasks = async (projectId) => {
    setIsFetchingTasks(true);
    try {
      if (globalTasks.byProject[projectId]) {
        setTasks(globalTasks.byProject[projectId]);
        setIsFetchingTasks(false);
        return;
      }

      const response = await fetch(
        `${API_URL}/tasks?project_id=${projectId}&userId=${sub}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();

      if (Array.isArray(data)) {
        setTasks(data);
        // Update global tasks
        setGlobalTasks((prev) => ({
          ...prev,
          byProject: {
            ...prev.byProject,
            [projectId]: data,
          },
          allTasks: [
            ...prev.allTasks.filter((t) => t.project_id !== projectId),
            ...data,
          ],
        }));
      }
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch tasks");
    } finally {
      setIsFetchingTasks(false);
    }
  };

  const fetchPendingInvites = async () => {
    try {
      const response = await fetch(
        `https://9ehr6i4dpi.execute-api.us-east-1.amazonaws.com/dev/invites?userId=${sub}`
      );
      const data = await response.json();
      setPendingInvites(data);
    } catch (err) {
      console.error("Error fetching invites:", err);
    }
  };

  const deleteProject = async (projectId, userId) => {
    try {
      const response = await fetch(
        `${API_URL}/projects?project_id=${projectId}&userId=${userId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete project");

      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.project_id !== projectId)
      );
      setModalState({ ...modalState, isDeleteConfirmationOpen: false });
      setSelectedIds({ ...selectedIds, projectToDelete: null });
      toast.success("Project deleted successfully");
    } catch (err) {
      setError(err.message);
      toast.error("Failed to delete project");
    }
  };

  const handleDeleteProject = async () => {
    if (selectedIds.projectToDelete) {
      try {
        await deleteProject(selectedIds.projectToDelete, sub);
      } catch (err) {
        setError(err.message || "Error deleting project");
      }
    }
  };

  // Update the deleteTask function to handle global state
  const deleteTask = async (taskId, projectId) => {
    try {
      const response = await fetch(
        `${API_URL}/tasks?task_id=${taskId}&project_id=${projectId}&userId=${sub}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete task");

      // Remove from current tasks
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.task_id !== taskId)
      );

      // Remove from global tasks
      setGlobalTasks((prev) => ({
        allTasks: prev.allTasks.filter((task) => task.task_id !== taskId),
        byProject: {
          ...prev.byProject,
          [projectId]: (prev.byProject[projectId] || []).filter(
            (task) => task.task_id !== taskId
          ),
        },
        isLoading: false,
        error: null,
      }));

      setModalState({ ...modalState, isDeleteConfirmationOpen: false });
      setSelectedIds({ ...selectedIds, taskToDelete: null });
      toast.success("Task deleted successfully");
    } catch (err) {
      setError(err.message);
      toast.error("Failed to delete task");
    }
  };

  const handleDeleteTask = async () => {
    if (selectedIds.taskToDelete) {
      try {
        await deleteTask(
          selectedIds.taskToDelete,
          selectedIds.selectedProjectId
        );
      } catch (err) {
        setError(err.message || "Error deleting task");
      }
    }
  };

  /**
   * Handles project form submission for create/update operations
   * @param {Event} e - Form submission event
   * @param {boolean} isUpdate - Flag indicating if this is an update operation
   */
  const handleProjectSubmit = async (e, isUpdate = false) => {
    e.preventDefault();
    await withLoading(async () => {
      const { newProjectName: name, newProjectDescription: description } =
        formState;

      try {
        let url = `${API_URL}/projects`;
        if (isUpdate) {
          url += `?project_id=${selectedIds.selectedProjectId}`;
        }

        const response = await fetch(url, {
          method: isUpdate ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            userId: sub,
            project_id: isUpdate ? selectedIds.selectedProjectId : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to ${isUpdate ? "update" : "create"} project`
          );
        }

        // Refresh projects list
        await fetchProjects();

        // Reset form and close modal
        setFormState({
          ...formState,
          newProjectName: "",
          newProjectDescription: "",
        });
        setModalState({ ...modalState, isProjectModalOpen: false });

        toast.success(
          `Project ${isUpdate ? "updated" : "created"} successfully`
        );
      } catch (err) {
        setError(err.message);
        toast.error(`Failed to ${isUpdate ? "update" : "create"} project`);
        throw err; // Re-throw to be caught by withLoading
      }
    });
  };

  // Update handleTaskSubmit to also update both tasks and globalTasks
  const handleTaskSubmit = async (e, isUpdate = false) => {
    e.preventDefault();
    await withLoading(async () => {
      const {
        newTaskName: name,
        newTaskDescription: description,
        assignedTo: assigned_to,
      } = formState;

      try {
        const url = isUpdate
          ? `${API_URL}/tasks?task_id=${selectedIds.selectedTaskId}`
          : `${API_URL}/tasks`;

        const requestBody = {
          name,
          description,
          project_id: selectedIds.selectedProjectId,
          userId: sub,
          assigned_to: assigned_to || null, // Send null if no assignee selected
          status: "BACKLOG", // Always set for new tasks
        };

        console.log("Sending task request:", {
          url,
          method: isUpdate ? "PUT" : "POST",
          body: requestBody,
        });

        const response = await fetch(url, {
          method: isUpdate ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData || `Failed to ${isUpdate ? "update" : "create"} task`
          );
        }

        const data = await response.json();
        const newTask = data.task || data; // Handle both create and update responses

        // Update current project tasks
        if (isUpdate) {
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.task_id === selectedIds.selectedTaskId
                ? { ...task, ...newTask }
                : task
            )
          );
        } else {
          setTasks((prevTasks) => [...prevTasks, newTask]);
        }

        // Update global tasks state
        setGlobalTasks((prev) => {
          const updatedTasks = isUpdate
            ? prev.allTasks.map((task) =>
                task.task_id === selectedIds.selectedTaskId
                  ? { ...task, ...newTask }
                  : task
              )
            : [...prev.allTasks, newTask];

          const updatedByProject = { ...prev.byProject };
          if (isUpdate) {
            // Update task in project
            if (updatedByProject[selectedIds.selectedProjectId]) {
              updatedByProject[selectedIds.selectedProjectId] =
                updatedByProject[selectedIds.selectedProjectId].map((task) =>
                  task.task_id === selectedIds.selectedTaskId
                    ? { ...task, ...newTask }
                    : task
                );
            }
          } else {
            // Add new task to project
            if (!updatedByProject[selectedIds.selectedProjectId]) {
              updatedByProject[selectedIds.selectedProjectId] = [];
            }
            updatedByProject[selectedIds.selectedProjectId].push(newTask);
          }

          return {
            ...prev,
            allTasks: updatedTasks,
            byProject: updatedByProject,
          };
        });

        // Reset form and close modal
        setFormState({
          newTaskName: "",
          newTaskDescription: "",
          assignedTo: "",
        });
        setModalState({ ...modalState, isCreateTaskModalOpen: false });

        toast.success(`Task ${isUpdate ? "updated" : "created"} successfully`);
      } catch (err) {
        console.error("Task error:", err);
        toast.error(
          err.message || `Failed to ${isUpdate ? "update" : "create"} task`
        );
        setError(err.message);
      }
    });
  };

  const handleInviteUser = async (e) => {
    e.preventDefault();
    try {
      await handleProjectInvitation(
        selectedIds.selectedProjectId,
        inviteUserId
      );
      setShowInviteModal(false);
      setInviteUserId("");
    } catch (err) {
      toast.error(err.message || "Error sending invitation");
    }
  };

  /**
   * Processes project invitation responses
   * @param {string} projectId - ID of the project
   * @param {string} status - Response status (ACCEPTED/REJECTED)
   */
  const handleInviteResponse = async (projectId, status) => {
    try {
      const response = await fetch(`${API_URL}/invites`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          status,
          userId: sub,
        }),
      });

      if (!response.ok) throw new Error("Failed to respond to invitation");

      // Remove the invitation from pendingInvites immediately for better UX
      setPendingInvites((prev) =>
        prev.filter((invite) => invite.project_id !== projectId)
      );

      // Refresh projects list only if accepted
      if (status === "ACCEPTED") {
        await fetchProjects();
        toast.success("Project invitation accepted");
      } else {
        toast.success("Project invitation declined");
      }

      // Close modal if no more invites
      if (pendingInvites.length <= 1) {
        setShowInvitesModal(false);
      }
    } catch (err) {
      toast.error("Error responding to invitation");
      console.error(err);
    }
  };

  const searchUsers = async (query) => {
    try {
      const response = await fetch(
        `${API_URL}/users?query=${query}&userId=${sub}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to search users");
      const data = await response.json();
      setUserSearchResults(data);
    } catch (err) {
      toast.error("Error searching users");
      console.error(err);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("isDarkMode", newDarkMode); // Save to localStorage
  };

  const darkModeClasses = isDarkMode
    ? "bg-gray-900 text-teal-100"
    : "bg-gradient-to-br from-teal-500 to-orange-400 text-teal-600";

  /**
   * Wraps operations with loading state and error handling
   * @param {Function} operation - Async operation to perform
   */
  const withLoading = async (operation) => {
    setIsLoading(true);
    try {
      await operation();
    } catch (err) {
      toast.error(err.message || "An error occurred");
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles task drag and drop operations
   * @param {Object} result - Drag end result object from react-beautiful-dnd
   */
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    await withLoading(async () => {
      const { draggableId, source, destination } = result;
      const task = tasks.find((t) => t.task_id === draggableId);

      if (source.droppableId !== destination.droppableId) {
        try {
          await updateTaskStatus(
            task.task_id,
            destination.droppableId,
            selectedIds.selectedProjectId
          );

          setTasks((prevTasks) =>
            prevTasks.map((t) =>
              t.task_id === task.task_id
                ? { ...t, status: destination.droppableId }
                : t
            )
          );
        } catch (err) {
          toast.error("Failed to update task status");
          setError(err.message);
        }
      }
    });
  };

  const updateTaskStatus = async (taskId, newStatus, projectId) => {
    try {
      const response = await fetch(`${API_URL}/tasks?task_id=${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          project_id: projectId,
          userId: sub,
          assigned_to: tasks.find((t) => t.task_id === taskId)?.assigned_to,
        }),
      });

      if (!response.ok) throw new Error("Failed to update task status");
      const updatedTask = await response.json();

      // Update both local and global task states
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.task_id === taskId ? { ...t, ...updatedTask } : t
        )
      );

      // Update global tasks state
      setGlobalTasks((prev) => {
        const updatedAllTasks = prev.allTasks.map((task) =>
          task.task_id === taskId ? { ...task, ...updatedTask } : task
        );

        const updatedByProject = { ...prev.byProject };
        if (updatedByProject[projectId]) {
          updatedByProject[projectId] = updatedByProject[projectId].map(
            (task) =>
              task.task_id === taskId ? { ...task, ...updatedTask } : task
          );
        }

        return {
          ...prev,
          allTasks: updatedAllTasks,
          byProject: updatedByProject,
        };
      });

      toast.success("Task status updated");
    } catch (err) {
      toast.error("Error updating task status");
      console.error(err);
    }
  };

  const handleProjectInvitation = async (projectId, inviteeId) => {
    try {
      const response = await fetch(`${API_URL}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          invitee_id: inviteeId,
          userId: sub,
        }),
      });

      if (!response.ok) throw new Error("Failed to send invitation");
      await fetchProjects(); // Refresh project data after invitation
      toast.success("Invitation sent successfully");
      setShowInviteModal(false);
    } catch (err) {
      toast.error("Error sending invitation");
      console.error(err);
    }
  };

  const handleTaskModalOpen = (projectId) => {
    setSelectedIds({
      ...selectedIds,
      selectedProjectId: projectId,
    });
    fetchTasks(projectId);
    setModalState({
      ...modalState,
      isTaskModalOpen: true,
    });
  };

  const sortTasks = (tasks) => {
    const sorted = {
      [TASK_STATUSES.BACKLOG]: [],
      [TASK_STATUSES.IN_PROGRESS]: [],
      [TASK_STATUSES.IN_TESTING]: [],
      [TASK_STATUSES.DONE]: [],
    };

    tasks.forEach((task) => {
      // Ensure task has a valid status or default to BACKLOG
      const status = Object.values(TASK_STATUSES).includes(task.status)
        ? task.status
        : TASK_STATUSES.BACKLOG;

      sorted[status].push(task);
    });

    // Sort each status group by updated_at or created_at
    Object.keys(sorted).forEach((status) => {
      sorted[status].sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB - dateA; // Most recent first
      });
    });

    return sorted;
  };

  const tasksByStatus = sortTasks(tasks);

  const handleEditTask = (task) => {
    setSelectedIds({
      ...selectedIds,
      selectedTaskId: task.task_id,
    });
    setFormState({
      newTaskName: task.name,
      newTaskDescription: task.description,
      assignedTo: task.assigned_to,
    });
    setModalState({
      ...modalState,
      isCreateTaskModalOpen: true,
    });
  };

  const InvitationsModal = () => (
    <EnhancedModal
      title="Project Invitations"
      onClose={() => setShowInvitesModal(false)}
    >
      {pendingInvites.length > 0 ? (
        <div className="space-y-4">
          {pendingInvites.map((invite) => (
            <div
              key={invite.project_id}
              className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h4 className="font-semibold text-lg text-teal-700">
                {invite.project_name}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {invite.project_description}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Invited by: {invite.inviter_username}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleInviteResponse(invite.project_id, "ACCEPTED")
                  }
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 
                            transition-colors flex-1 flex items-center justify-center gap-2"
                >
                  <FaCheck /> Accept
                </button>
                <button
                  onClick={() =>
                    handleInviteResponse(invite.project_id, "REJECTED")
                  }
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 
                            transition-colors flex-1 flex items-center justify-center gap-2"
                >
                  <FaTimes /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">No pending invitations</p>
        </div>
      )}
    </EnhancedModal>
  );

  const ProjectForm = ({ initialData, onSubmit, isDarkMode }) => {
    const [formData, setFormData] = useState({
      name: initialData?.name || "",
      description: initialData?.description || "",
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      setFormState({
        ...formState,
        newProjectName: formData.name,
        newProjectDescription: formData.description,
      });
      // Pass true to indicate this is an update if we have initialData
      onSubmit(e, !!initialData);
    };

    return (
      <form onSubmit={handleSubmit}>
        <InputField
          label="Project Name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          isDarkMode={isDarkMode}
        />
        <TextAreaField
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          isDarkMode={isDarkMode}
        />
        <ModalActions
          onCancel={() =>
            setModalState({ ...modalState, isProjectModalOpen: false })
          }
          submitLabel={initialData ? "Save Changes" : "Create Project"}
          isDarkMode={isDarkMode}
        />
      </form>
    );
  };

  const TaskForm = ({
    onSubmit,
    initialData = {},
    isDarkMode,
    projectMembers = [],
  }) => {
    const [formData, setFormData] = useState({
      name: initialData.name || "",
      description: initialData.description || "",
      assigned_to: initialData.assigned_to || "", // This should be the user_id, not username
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      setFormState({
        newTaskName: formData.name,
        newTaskDescription: formData.description,
        assignedTo: formData.assigned_to,
      });
      onSubmit(e);
    };

    return (
      <form onSubmit={handleSubmit}>
        <InputField
          label="Task Name"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          isDarkMode={isDarkMode}
          required
        />
        <TextAreaField
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          isDarkMode={isDarkMode}
        />
        <SelectField
          label="Assign To"
          value={formData.assigned_to}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, assigned_to: e.target.value }))
          }
          options={[
            { value: "", label: "Select an assignee" },
            ...projectMembers.map((member) => ({
              value: member.user_id, // Use the sub/user_id as the value
              label: member.username, // Display the username as the label
            })),
          ]}
          isDarkMode={isDarkMode}
          required={false}
        />
        <ModalActions
          onCancel={() =>
            setModalState({ ...modalState, isCreateTaskModalOpen: false })
          }
          submitLabel={initialData.task_id ? "Save Changes" : "Create Task"}
          isDarkMode={isDarkMode}
        />
      </form>
    );
  };

  const handleEditProject = (project) => {
    setSelectedIds({
      ...selectedIds,
      selectedProjectId: project.project_id,
    });
    setFormState({
      newProjectName: project.name,
      newProjectDescription: project.description,
    });
    setModalState({
      ...modalState,
      isProjectModalOpen: true,
    });
  };

  const handleInviteModal = (projectId) => {
    setSelectedIds({
      ...selectedIds,
      selectedProjectId: projectId,
    });
    setShowInviteModal(true);
  };

  const selectedProject = projects.find(
    (p) => p.project_id === selectedIds.selectedProjectId
  );

  // Add loading states to UI
  if (isFetchingProjects) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  // Add user check
  if (!user) {
    return <LoadingSpinner />;
  }

  const InviteUserModal = () => (
    <EnhancedModal
      title="Invite User"
      onClose={() => setShowInviteModal(false)}
      isDarkMode={isDarkMode}
    >
      <form onSubmit={handleInviteUser} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchUsers(e.target.value);
            }}
            placeholder="Search users..."
            className="w-full p-2 border rounded-lg"
          />

          <div className="mt-4">
            {userSearchResults.map((user) => (
              <div
                key={user.user_id}
                onClick={() => setInviteUserId(user.user_id)}
                className={`p-2 cursor-pointer rounded-lg ${
                  inviteUserId === user.user_id
                    ? "bg-teal-100"
                    : "hover:bg-gray-100"
                }`}
              >
                {user.username || user.email}
              </div>
            ))}
          </div>
        </div>

        {inviteUserId && (
          <div className="flex justify-end gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
            >
              Send Invitation
            </button>
          </div>
        )}
      </form>
    </EnhancedModal>
  );

  const DeleteConfirmationModal = () => (
    <EnhancedModal
      title="Confirm Delete"
      onClose={() =>
        setModalState({ ...modalState, isDeleteConfirmationOpen: false })
      }
      isDarkMode={isDarkMode}
    >
      <div className="space-y-4">
        <p>
          Are you sure you want to delete this{" "}
          {selectedIds.taskToDelete ? "task" : "project"}?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() =>
              setModalState({ ...modalState, isDeleteConfirmationOpen: false })
            }
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={
              selectedIds.taskToDelete ? handleDeleteTask : handleDeleteProject
            }
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </EnhancedModal>
  );

  const renderTaskBoard = () => {
    if (isFetchingTasks) {
      return <LoadingSpinner />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow overflow-hidden">
        {Object.entries(tasksByStatus).map(([status, tasksInStatus]) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasksInStatus}
            onEditTask={handleEditTask}
            onDeleteTask={(taskId) => {
              setSelectedIds({ ...selectedIds, taskToDelete: taskId });
              setModalState({ ...modalState, isDeleteConfirmationOpen: true });
            }}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen ${darkModeClasses} transition-all duration-300`}
    >
      {/* Show loading overlay */}
      {isLoading && <LoadingOverlay isDarkMode={isDarkMode} />}

      <Navbar
        userPool={userPool}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80"
      />
      <Toaster position="top-right" />

      <main className="container mx-auto px-4 py-8 pt-20">
        {/* Add Analytics Tab/Section */}
        <motion.section className="space-y-8 mb-12">
          <div className="flex justify-between items-center">
            <h2
              className={`text-2xl font-bold ${
                isDarkMode ? THEME.dark.text : THEME.light.text
              }`}
            >
              Analytics Overview
            </h2>
          </div>
          <AnalyticsDashboard
            tasks={globalTasks.allTasks} // Pass allTasks instead of tasks
            projects={projects}
            isDarkMode={isDarkMode}
          />
        </motion.section>

        {/* Projects Section */}
        <motion.section className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1
              className={`text-3xl font-bold ${
                isDarkMode ? THEME.dark.text : THEME.light.text
              }`}
            >
              Projects
            </h1>
            <div className="flex items-center gap-4">
              <NotificationBell
                count={pendingInvites.length}
                onClick={() => setShowInvitesModal(true)}
                isDarkMode={isDarkMode}
              />
              <CreateButton
                onClick={() =>
                  setModalState({ ...modalState, isProjectModalOpen: true })
                }
                label="New Project"
                icon={<FaPlusCircle />}
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.project_id}
                project={project}
                onEdit={() => handleEditProject(project)}
                onDelete={() => handleDeleteProject(project.project_id)}
                onViewTasks={() => handleTaskModalOpen(project.project_id)}
                onInvite={() => handleInviteModal(project.project_id)}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        </motion.section>

        {/* Modals */}
        <AnimatePresence>
          {modalState.isProjectModalOpen && (
            <EnhancedModal
              title={
                selectedIds.selectedProjectId
                  ? "Edit Project"
                  : "Create Project"
              }
              onClose={() =>
                setModalState({ ...modalState, isProjectModalOpen: false })
              }
              isDarkMode={isDarkMode}
            >
              <ProjectForm
                initialData={selectedProject}
                onSubmit={handleProjectSubmit}
                isDarkMode={isDarkMode}
              />
            </EnhancedModal>
          )}

          {modalState.isTaskModalOpen && (
            <TaskBoardModal
              onClose={() =>
                setModalState({ ...modalState, isTaskModalOpen: false })
              }
              onCreateTask={() =>
                setModalState({ ...modalState, isCreateTaskModalOpen: true })
              }
              isDarkMode={isDarkMode}
              onDragEnd={handleDragEnd} // Pass handleDragEnd here
            >
              {renderTaskBoard()}
            </TaskBoardModal>
          )}

          {modalState.isCreateTaskModalOpen && (
            <EnhancedModal
              title={selectedIds.selectedTaskId ? "Edit Task" : "Create Task"}
              onClose={() =>
                setModalState({ ...modalState, isCreateTaskModalOpen: false })
              }
              isDarkMode={isDarkMode}
            >
              <TaskForm
                onSubmit={(e) =>
                  handleTaskSubmit(e, !!selectedIds.selectedTaskId)
                }
                initialData={
                  selectedIds.selectedTaskId
                    ? {
                        name: formState.newTaskName,
                        description: formState.newTaskDescription,
                        assigned_to: formState.assignedTo,
                        task_id: selectedIds.selectedTaskId,
                      }
                    : {}
                }
                isDarkMode={isDarkMode}
                projectMembers={
                  projects.find(
                    (p) => p.project_id === selectedIds.selectedProjectId
                  )?.members || []
                }
              />
            </EnhancedModal>
          )}

          {showInviteModal && <InviteUserModal />}
          {showInvitesModal && <InvitationsModal />}
          {modalState.isDeleteConfirmationOpen && <DeleteConfirmationModal />}
        </AnimatePresence>
      </main>
    </div>
  );
};

const TaskBoardModal = ({
  title,
  onClose,
  onCreateTask,
  isDarkMode,
  children,
  onDragEnd, // Add this prop
}) => (
  <EnhancedModal
    title="Project Tasks"
    onClose={onClose}
    maxWidth="max-w-screen-2xl"
    customStyles="mt-16"
    isDarkMode={isDarkMode}
  >
    <div className="flex flex-col h-[80vh]">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-slate-800 z-10 py-4">
        <h3
          className={`text-xl font-semibold ${
            isDarkMode ? "text-slate-200" : "text-slate-700"
          }`}
        >
          Tasks Board
        </h3>
        <CreateButton
          onClick={onCreateTask}
          label="New Task"
          icon={<FaPlusCircle />}
          isDarkMode={isDarkMode}
        />
      </div>
      <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>
    </div>
  </EnhancedModal>
);

const ProjectCard = ({
  project,
  onEdit,
  onDelete,
  onViewTasks,
  onInvite,
  isDarkMode,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={`
      ${isDarkMode ? THEME.dark.card : THEME.light.card}
      rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
      border border-slate-200 dark:border-slate-700
      p-6 flex flex-col gap-4
    `}
  >
    {/* Card content with enhanced styling */}
    <div className="flex items-start justify-between">
      <div>
        <h3
          className={`text-xl font-semibold ${
            isDarkMode ? THEME.dark.text : THEME.light.text
          }`}
        >
          {project.name}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
          {project.description}
        </p>
      </div>
      <ProjectMenu
        onEdit={onEdit}
        onDelete={onDelete}
        onViewTasks={onViewTasks}
        onInvite={onInvite}
        isDarkMode={isDarkMode}
      />
    </div>

    {/* Project metadata */}
    <div className="flex items-center gap-4 mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
      <MemberCount
        count={project.members?.length || 1}
        isDarkMode={isDarkMode}
      />
      <RoleBadge role={project.role} isDarkMode={isDarkMode} />
    </div>
  </motion.div>
);

// ... Continue with other enhanced component definitions ...

// Add new utility components for consistency and reusability
const CreateButton = ({ onClick, label, icon, isDarkMode }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-lg
      ${
        isDarkMode
          ? "bg-indigo-600 hover:bg-indigo-700"
          : "bg-indigo-500 hover:bg-indigo-600"
      }
      text-white font-medium shadow-lg hover:shadow-xl
      transition-all duration-300
    `}
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

const NotificationBell = ({ count, onClick, isDarkMode }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`relative p-3 rounded-full ${
      isDarkMode
        ? "bg-slate-700 hover:bg-slate-600"
        : "bg-white hover:bg-slate-50"
    } shadow-lg transition-all duration-300`}
  >
    <FaBell
      className={`${count > 0 ? "text-indigo-500" : "text-slate-400"} text-xl`}
    />
    {count > 0 && (
      <span
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 
                      text-xs flex items-center justify-center animate-bounce"
      >
        {count}
      </span>
    )}
  </motion.button>
);

const ProjectMenu = ({
  onEdit,
  onDelete,
  onViewTasks,
  onInvite,
  isDarkMode,
}) => (
  <Menu
    menuButton={
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`p-2 rounded-lg ${
          isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
        } transition-colors`}
      >
        <FaEllipsisV
          className={isDarkMode ? "text-slate-400" : "text-slate-600"}
        />
      </motion.button>
    }
    transition
    className="z-50"
  >
    <MenuItem onClick={onEdit}>
      <FaEdit className="mr-2" /> Edit
    </MenuItem>
    <MenuItem onClick={onDelete}>
      <FaTrashAlt className="mr-2" /> Delete
    </MenuItem>
    <MenuItem onClick={onViewTasks}>
      <FaTasks className="mr-2" /> Tasks
    </MenuItem>
    <MenuItem onClick={onInvite}>
      <FaUserPlus className="mr-2" /> Invite
    </MenuItem>
  </Menu>
);

const TaskColumn = ({
  status,
  tasks,
  onEditTask,
  onDeleteTask,
  isDarkMode,
}) => (
  <Droppable droppableId={status}>
    {(provided, snapshot) => (
      <div
        ref={provided.innerRef}
        {...provided.droppableProps}
        className={`
          flex flex-col rounded-lg border-2
          ${statusColors[status]}
          ${
            snapshot.isDraggingOver
              ? isDarkMode
                ? "bg-slate-700"
                : "bg-slate-50"
              : ""
          }
          p-4 overflow-hidden
        `}
      >
        <h4
          className={`font-semibold mb-4 ${
            isDarkMode ? "text-slate-200" : "text-slate-700"
          } sticky top-0 bg-inherit z-10 flex items-center justify-between py-2`}
        >
          {STATUS_DISPLAY_NAMES[status]}
          <span
            className={`${
              isDarkMode ? "bg-slate-600" : "bg-slate-200"
            } px-3 py-1 rounded-full text-sm`}
          >
            {tasks.length}
          </span>
        </h4>

        <div className="overflow-y-auto flex-grow space-y-3">
          {tasks.map((task, index) => (
            <TaskCard
              key={task.task_id}
              task={task}
              index={index}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.task_id)}
              isDarkMode={isDarkMode}
            />
          ))}
          {provided.placeholder}
        </div>
      </div>
    )}
  </Droppable>
);

const TaskCard = ({ task, index, onEdit, onDelete, isDarkMode }) => (
  <Draggable draggableId={task.task_id} index={index}>
    {(provided, snapshot) => (
      <motion.div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`
          p-4 rounded-lg shadow-sm
          ${
            isDarkMode
              ? "bg-slate-700 hover:bg-slate-600"
              : "bg-white hover:bg-slate-50"
          }
          ${snapshot.isDragging ? "shadow-lg" : "hover:shadow-md"}
          transition-all duration-200
        `}
      >
        <div className="flex justify-between items-start">
          <h5
            className={`font-medium ${
              isDarkMode ? "text-slate-200" : "text-slate-800"
            }`}
          >
            {task.name}
          </h5>
          <div className="flex gap-2">
            <IconButton
              icon={<FaEdit />}
              onClick={onEdit}
              className={
                isDarkMode
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-800"
              }
            />
            <IconButton
              icon={<FaTrashAlt />}
              onClick={onDelete}
              className="text-red-400 hover:text-red-600"
            />
          </div>
        </div>

        {task.assignee_username && (
          <span
            className={`
            text-xs px-2 py-1 rounded-full mt-2 inline-block
            ${
              isDarkMode
                ? "bg-slate-600 text-slate-200"
                : "bg-slate-100 text-slate-600"
            }
          `}
          >
            {task.assignee_username}
          </span>
        )}

        <p
          className={`text-sm mt-2 ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {task.description}
        </p>
      </motion.div>
    )}
  </Draggable>
);

const LoadingOverlay = ({ isDarkMode }) => (
  <div
    className={`
    fixed inset-0 flex items-center justify-center z-50
    ${isDarkMode ? "bg-slate-900/80" : "bg-white/80"} backdrop-blur-sm
  `}
  >
    <LoadingSpinner />
  </div>
);

export default Dashboard;

const EnhancedModal = ({
  title,
  children,
  onClose,
  maxWidth = "max-w-md",
  customStyles = "",
  isDarkMode,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center overflow-y-auto p-4 z-50"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className={`
        ${isDarkMode ? THEME.dark.card : THEME.light.card}
        rounded-xl shadow-2xl w-full ${maxWidth} p-6 my-20 max-h-[85vh] overflow-y-auto ${customStyles}
      `}
    >
      <div className="flex justify-between items-center mb-4">
        <h2
          className={`text-2xl font-semibold ${
            isDarkMode ? THEME.dark.text : THEME.light.text
          }`}
        >
          {title}
        </h2>
        <button
          onClick={onClose}
          className={`${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          } hover:text-red-500`}
        >
          <FaTimesCircle size={24} />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

const MemberCount = ({ count, isDarkMode }) => (
  <div
    className={`flex items-center gap-2 ${
      isDarkMode ? "text-slate-400" : "text-slate-600"
    }`}
  >
    <FaUserPlus />
    <span>
      {count} member{count !== 1 ? "s" : ""}
    </span>
  </div>
);

const RoleBadge = ({ role, isDarkMode }) => (
  <span
    className={`
    px-3 py-1 rounded-full text-sm font-medium
    ${
      isDarkMode ? "bg-slate-700 text-slate-200" : "bg-slate-100 text-slate-700"
    }
  `}
  >
    {role}
  </span>
);

const IconButton = ({ icon, onClick, className, label }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center ${className}`}
    title={label}
  >
    {icon}
    {label && <span className="ml-2">{label}</span>}
  </button>
);
