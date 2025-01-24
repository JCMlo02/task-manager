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
} from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Menu, MenuItem } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import LoadingSpinner from "./dashboard/LoadingSpinner";
import InputField from "./dashboard/InputField";
import TextAreaField from "./dashboard/TextAreaField";
import ModalActions from "./dashboard/ModalActions";

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
  [TASK_STATUSES.BACKLOG]: "bg-gray-100 border-gray-200",
  [TASK_STATUSES.IN_PROGRESS]: "bg-blue-50 border-blue-200",
  [TASK_STATUSES.IN_TESTING]: "bg-yellow-50 border-yellow-200",
  [TASK_STATUSES.DONE]: "bg-green-50 border-green-200",
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
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch projects");
    } finally {
      setIsFetchingProjects(false);
    }
  };

  const fetchTasks = async (projectId) => {
    setIsFetchingTasks(true);
    try {
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
      } else {
        throw new Error("Invalid response format");
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

      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.task_id !== taskId)
      );
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
        const url = isUpdate
          ? `${API_URL}/projects?project_id=${selectedIds.selectedProjectId}`
          : `${API_URL}/projects`;

        const response = await fetch(url, {
          method: isUpdate ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            userId: sub,
          }),
        });

        if (!response.ok)
          throw new Error(
            `Failed to ${isUpdate ? "update" : "create"} project`
          );
        const data = await response.json();

        // No need to manually add creator to members - backend handles this
        await fetchProjects(); // Refresh projects to get updated member information

        setFormState({ newProjectName: "", newProjectDescription: "" });
        setModalState({ ...modalState, isProjectModalOpen: false });
        toast.success(
          `Project ${isUpdate ? "updated" : "created"} successfully`
        );
      } catch (err) {
        setError(err.message);
        toast.error(`Failed to ${isUpdate ? "update" : "create"} project`);
      }
    });
  };

  // Update handleTaskSubmit to correctly handle assigned_to
  const handleTaskSubmit = async (e, isUpdate = false) => {
    e.preventDefault();
    await withLoading(async () => {
      const {
        newTaskName: name,
        newTaskDescription: description,
        assignedTo: assigned_to, // Rename to match backend expectation
      } = formState;

      try {
        const url = isUpdate
          ? `${API_URL}/tasks?task_id=${selectedIds.selectedTaskId}`
          : `${API_URL}/tasks`;

        const response = await fetch(url, {
          method: isUpdate ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            project_id: selectedIds.selectedProjectId,
            userId: sub,
            status: TASK_STATUSES.BACKLOG,
            assigned_to, // Use snake_case for API
          }),
        });

        if (!response.ok)
          throw new Error(`Failed to ${isUpdate ? "update" : "create"} task`);
        const data = await response.json();

        // Update tasks state based on response
        if (isUpdate) {
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.task_id === selectedIds.selectedTaskId
                ? {
                    ...task,
                    name,
                    description,
                    assigned_to,
                    assignee_username: data.assignee_username, // Use the username from response
                  }
                : task
            )
          );
        } else {
          setTasks((prevTasks) => [...prevTasks, data.task]); // Backend returns {task: {...}}
        }

        setFormState({
          newTaskName: "",
          newTaskDescription: "",
          assignedTo: "",
        });
        setModalState({ ...modalState, isCreateTaskModalOpen: false });
        toast.success(`Task ${isUpdate ? "updated" : "created"} successfully`);
      } catch (err) {
        setError(err.message);
        toast.error(`Failed to ${isUpdate ? "update" : "create"} task`);
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

  // Update task status update function to match API
  const updateTaskStatus = async (taskId, newStatus, projectId) => {
    try {
      const response = await fetch(`${API_URL}/tasks?task_id=${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          project_id: projectId,
          userId: sub,
          assigned_to: tasks.find((t) => t.task_id === taskId)?.assigned_to, // Preserve assigned user
        }),
      });
      if (!response.ok) throw new Error("Failed to update task status");

      const updatedTask = await response.json();
      // Update local state with full response data
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.task_id === taskId ? { ...t, ...updatedTask } : t
        )
      );

      toast.success("Task status updated");
    } catch (err) {
      toast.error("Error updating task status");
      console.error(err);
    }
  };

  // Update invitation handling to match API
  const handleProjectInvitation = async (projectId, inviteeId) => {
    try {
      const response = await fetch(`${API_URL}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId,
          invitee_id: inviteeId, // Match backend field name
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

  const acceptProjectInvitation = async (projectId) => {
    await handleInviteResponse(projectId, "ACCEPTED");
    await fetchProjects(); // Refresh projects list after accepting
  };

  const rejectProjectInvitation = async (projectId) => {
    await handleInviteResponse(projectId, "REJECTED");
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

  // Update NotificationsButton to show badge and handle click
  const NotificationsButton = () => (
    <div className="relative">
      <IconButton
        icon={<FaBell className={pendingInvites.length > 0 ? "animate-pulse" : ""} />}
        label={`Invites ${pendingInvites.length > 0 ? `(${pendingInvites.length})` : ''}`}
        onClick={() => setShowInvitesModal(true)}
        className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 
                  transform hover:scale-105 transition-all duration-300"
      >
        {pendingInvites.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center animate-bounce">
            {pendingInvites.length}
          </span>
        )}
      </IconButton>
    </div>
  );

  // Replace the new project button
  const NewProjectButton = () => (
    <IconButton
      icon={<FaPlusCircle />}
      label="New Project"
      onClick={() =>
        withLoading(async () => {
          setModalState({
            ...modalState,
            isProjectModalOpen: true,
          });
        })
      }
      className="px-6 py-3 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 
                transform hover:scale-105 transition-all duration-300"
    />
  );

  // Replace the new task button
  const NewTaskButton = () => (
    <IconButton
      icon={<FaPlusCircle />}
      label="New Task"
      onClick={() =>
        setModalState({
          ...modalState,
          isCreateTaskModalOpen: true,
        })
      }
      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
    />
  );

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

  // Fix Task Edit button - it's using assignedTo instead of assigned_to
  const handleEditTask = (task) => {
    setSelectedIds({
      ...selectedIds,
      selectedTaskId: task.task_id,
    });
    setFormState({
      newTaskName: task.name,
      newTaskDescription: task.description,
      assignedTo: task.assigned_to, // Fix: use assigned_to instead of assignedTo
    });
    setModalState({
      ...modalState,
      isCreateTaskModalOpen: true,
    });
  };

  // Update the invitations modal to show better information and actions
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
                  onClick={() => handleInviteResponse(invite.project_id, "ACCEPTED")}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 
                            transition-colors flex-1 flex items-center justify-center gap-2"
                >
                  <FaCheck /> Accept
                </button>
                <button
                  onClick={() => handleInviteResponse(invite.project_id, "REJECTED")}
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

  return (
    <section
      className={`${darkModeClasses} min-h-screen transition-all duration-300 relative`}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingSpinner size="text-6xl" color="text-white" />
        </div>
      )}
      <Navbar
        userPool={userPool}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 flex justify-center items-center"
      >
        <div className="w-full max-w-6xl bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 my-12">
          <motion.h2
            className="text-4xl font-bold text-center text-teal-700 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Task Manager Dashboard
          </motion.h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 text-red-500 p-4 rounded-lg mb-6"
            >
              <p>{error}</p>
            </motion.div>
          )}

          {user ? (
            <motion.div
              className="mt-8 space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold text-gray-700">
                  Welcome back,{" "}
                  <span className="text-teal-600">{user.getUsername()}</span>
                </h3>
                <div className="relative">
                  <NotificationsButton />
                </div>
                <NewProjectButton />
              </div>

              <AnimatePresence>
                {isFetchingProjects ? (
                  <LoadingSpinner />
                ) : projects.length > 0 ? (
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {projects.map((project) => (
                      <motion.div
                        key={project.project_id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-gradient-to-br from-teal-50 to-white p-6 rounded-xl shadow-lg 
                          hover:shadow-2xl transition-all duration-300 border border-teal-100"
                      >
                        <h4 className="text-xl font-semibold text-teal-700 mb-2">
                          {project.name}
                        </h4>
                        <p className="text-gray-600 mb-2">
                          {project.description}
                        </p>

                        {/* Add member count */}
                        <div className="text-sm text-gray-500 mb-4">
                          {project.members?.length || 1} member
                          {project.members?.length !== 1 ? "s" : ""}
                          {project.role && (
                            <span className="ml-2 px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs">
                              {project.role}
                            </span>
                          )}
                        </div>

                        <Menu
                          menuButton={
                            <button
                              className="px-4 py-2 bg-teal-600 text-white rounded-lg shadow-lg hover:bg-teal-700 
                              flex items-center gap-2"
                            >
                              Actions
                            </button>
                          }
                          transition
                        >
                          {/* Only show certain actions based on role */}
                          {project.role === "OWNER" && (
                            <>
                              <MenuItem
                                onClick={() => {
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
                                }}
                              >
                                <FaEdit className="mr-2" /> Edit
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  setSelectedIds({
                                    ...selectedIds,
                                    projectToDelete: project.project_id,
                                  });
                                  setModalState({
                                    ...modalState,
                                    isDeleteConfirmationOpen: true,
                                  });
                                }}
                              >
                                <FaTrashAlt className="mr-2" /> Delete
                              </MenuItem>
                              <MenuItem
                                onClick={() => setShowInviteModal(true)}
                              >
                                <FaUserPlus className="mr-2" /> Invite
                              </MenuItem>
                            </>
                          )}
                          <MenuItem
                            onClick={() =>
                              handleTaskModalOpen(project.project_id)
                            }
                          >
                            <FaTasks className="mr-2" /> Tasks
                          </MenuItem>
                        </Menu>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState />
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <LoadingSpinner />
          )}

          <AnimatePresence>
            {modalState.isProjectModalOpen && (
              <EnhancedModal
                title={
                  selectedIds.selectedProjectId
                    ? "Edit Project"
                    : "Create New Project"
                }
                onClose={() =>
                  setModalState({ ...modalState, isProjectModalOpen: false })
                }
              >
                <form
                  onSubmit={(e) =>
                    handleProjectSubmit(e, !!selectedIds.selectedProjectId)
                  }
                >
                  <InputField
                    label="Project Name"
                    value={formState.newProjectName}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        newProjectName: e.target.value,
                      })
                    }
                  />
                  <TextAreaField
                    label="Description"
                    value={formState.newProjectDescription}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        newProjectDescription: e.target.value,
                      })
                    }
                  />
                  <ModalActions
                    onCancel={() =>
                      setModalState({
                        ...modalState,
                        isProjectModalOpen: false,
                      })
                    }
                    submitLabel={
                      selectedIds.selectedProjectId
                        ? "Save Changes"
                        : "Create Project"
                    }
                  />
                </form>
              </EnhancedModal>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {modalState.isTaskModalOpen && (
              <EnhancedModal
                title="Project Tasks"
                onClose={() =>
                  setModalState({ ...modalState, isTaskModalOpen: false })
                }
                maxWidth="max-w-7xl"
              >
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="flex flex-col h-[70vh]">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-700">
                        {
                          projects.find(
                            (p) =>
                              p.project_id === selectedIds.selectedProjectId
                          )?.name
                        }
                      </h3>
                      <NewTaskButton />
                    </div>

                    <div className="grid grid-cols-4 gap-4 flex-grow overflow-hidden">
                      {Object.entries(TASK_STATUSES).map(([key, status]) => (
                        <Droppable droppableId={status} key={status}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`flex flex-col rounded-lg border-2 
                                ${statusColors[status]} 
                                ${snapshot.isDraggingOver ? "bg-gray-50" : ""} 
                                p-4 overflow-hidden`}
                            >
                              <h4 className="font-semibold mb-4 text-gray-700 flex items-center justify-between">
                                {status}
                                <span className="bg-gray-200 px-2 py-1 rounded-full text-sm">
                                  {tasksByStatus[status].length}
                                </span>
                              </h4>

                              <div className="overflow-y-auto flex-grow">
                                {isFetchingTasks ? (
                                  <LoadingSpinner />
                                ) : (
                                  tasksByStatus[status].map((task, index) => (
                                    <Draggable
                                      key={task.task_id}
                                      draggableId={task.task_id}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <motion.div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`p-4 bg-white rounded-lg shadow-sm 
                                            ${
                                              snapshot.isDragging
                                                ? "shadow-lg"
                                                : "hover:shadow-md"
                                            } 
                                            mb-2 transition-all duration-200`}
                                        >
                                          <div className="flex justify-between items-start">
                                            <div className="flex-grow">
                                              <h5 className="font-medium text-gray-800">
                                                {task.name}
                                              </h5>
                                              {task.assignee_username && (
                                                <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded-full mt-1 inline-block">
                                                  Assigned to:{" "}
                                                  {task.assignee_username}
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex gap-2">
                                              <IconButton
                                                icon={<FaEdit />}
                                                onClick={() => handleEditTask(task)} // Use the new handleEditTask function
                                                className="text-teal-600 hover:text-teal-800"
                                              />
                                              <IconButton
                                                icon={<FaTrashAlt />}
                                                onClick={() => {
                                                  setSelectedIds({
                                                    ...selectedIds,
                                                    taskToDelete: task.task_id,
                                                  });
                                                  setModalState({
                                                    ...modalState,
                                                    isDeleteConfirmationOpen: true,
                                                  });
                                                }}
                                                className="text-red-600 hover:text-red-800"
                                              />
                                            </div>
                                          </div>
                                          <p className="text-sm text-gray-600 mt-2">
                                            {task.description}
                                          </p>
                                          {task.due_date && (
                                            <div className="text-xs text-gray-500 mt-2">
                                              Due:{" "}
                                              {new Date(
                                                task.due_date
                                              ).toLocaleDateString()}
                                            </div>
                                          )}
                                        </motion.div>
                                      )}
                                    </Draggable>
                                  ))
                                )}
                                {provided.placeholder}
                              </div>
                            </div>
                          )}
                        </Droppable>
                      ))}
                    </div>
                  </div>
                </DragDropContext>
              </EnhancedModal>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {modalState.isCreateTaskModalOpen && (
              <EnhancedModal
                title={
                  selectedIds.selectedTaskId ? "Edit Task" : "Create New Task"
                }
                onClose={() =>
                  setModalState({ ...modalState, isCreateTaskModalOpen: false })
                }
              >
                <form
                  onSubmit={(e) =>
                    handleTaskSubmit(e, !!selectedIds.selectedTaskId)
                  }
                >
                  <InputField
                    label="Task Name"
                    value={formState.newTaskName}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        newTaskName: e.target.value,
                      })
                    }
                  />
                  <TextAreaField
                    label="Description"
                    value={formState.newTaskDescription}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        newTaskDescription: e.target.value,
                      })
                    }
                  />
                  {/* Update the SelectField in create/edit task modal */}
                  <SelectField
                    label="Assign To"
                    value={formState.assignedTo}
                    onChange={(e) =>
                      setFormState({ ...formState, assignedTo: e.target.value })
                    }
                    options={
                      projects
                        .find(
                          (p) => p.project_id === selectedIds.selectedProjectId
                        )
                        ?.members?.filter(
                          (member) =>
                            member.status === "OWNER" ||
                            member.status === "ACCEPTED"
                        )
                        .map((member) => ({
                          value: member.user_id,
                          label: member.username || member.user_id,
                        })) || []
                    }
                    required={false}
                  />
                  <ModalActions
                    onCancel={() =>
                      setModalState({
                        ...modalState,
                        isCreateTaskModalOpen: false,
                      })
                    }
                    submitLabel={
                      selectedIds.selectedTaskId
                        ? "Save Changes"
                        : "Create Task"
                    }
                  />
                </form>
              </EnhancedModal>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {modalState.isDeleteConfirmationOpen && (
              <EnhancedModal
                title="Are you sure you want to delete this?"
                onClose={() =>
                  setModalState({
                    ...modalState,
                    isDeleteConfirmationOpen: false,
                  })
                }
              >
                <ModalActions
                  onCancel={() =>
                    setModalState({
                      ...modalState,
                      isDeleteConfirmationOpen: false,
                    })
                  }
                  onConfirm={() => {
                    if (selectedIds.projectToDelete) {
                      handleDeleteProject();
                    } else if (selectedIds.taskToDelete) {
                      handleDeleteTask();
                    }
                    setModalState({
                      ...modalState,
                      isDeleteConfirmationOpen: false,
                    });
                  }}
                  confirmLabel="Confirm Delete"
                />
              </EnhancedModal>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showInviteModal && (
              <EnhancedModal
                title="Invite User to Project"
                onClose={() => setShowInviteModal(false)}
              >
                {/* Show current members first */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Current Members
                  </h3>
                  {/* Update project member list in invite modal */}
                  <div className="space-y-2 max-h-32 overflow-y-auto mb-4">
                    {projects
                      .find(
                        (p) => p.project_id === selectedIds.selectedProjectId
                      )
                      ?.members?.map((member) => (
                        <div
                          key={member.user_id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span>{member.username || member.user_id}</span>
                          <span className="text-xs bg-teal-100 text-teal-600 px-2 py-1 rounded">
                            {member.status}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Existing invite form */}
                <div className="mb-4">
                  <InputField
                    label="Search Users"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.length >= 2) {
                        searchUsers(e.target.value);
                      } else {
                        setUserSearchResults([]);
                      }
                    }}
                    placeholder="Type to search users..."
                  />

                  {userSearchResults.length > 0 && (
                    <div className="mt-2 border rounded-lg divide-y max-h-48 overflow-y-auto">
                      {userSearchResults.map((user) => (
                        <div
                          key={user.user_id}
                          className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            setInviteUserId(user.user_id);
                            setSearchQuery(user.username);
                            setUserSearchResults([]);
                          }}
                        >
                          <span>{user.username}</span>
                          <button className="text-xs bg-teal-500 text-white px-2 py-1 rounded">
                            Select
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {inviteUserId && (
                  <form onSubmit={handleInviteUser}>
                    <p className="text-sm text-gray-600 mb-4">
                      Selected user: {searchQuery}
                    </p>
                    <ModalActions
                      onCancel={() => setShowInviteModal(false)}
                      submitLabel="Send Invitation"
                    />
                  </form>
                )}
              </EnhancedModal>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showInvitesModal && (
              <InvitationsModal />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};

/**
 * Enhanced Modal Component
 * @component
 * @param {Object} props
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {Function} props.onClose - Close handler
 * @param {string} [props.maxWidth] - Maximum width of modal
 */
const EnhancedModal = ({ title, children, onClose, maxWidth = "max-w-md" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center overflow-y-auto p-4"
  >
    <motion.div
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
      className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} p-6 max-h-screen overflow-y-auto`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-teal-600">{title}</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <FaTimesCircle />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

/**
 * Icon Button Component
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.icon - Icon element to display
 * @param {string} props.label - Button label
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
const IconButton = ({ icon, label, onClick, className }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    className={`flex items-center gap-2 p-2 rounded-lg ${className}`}
    onClick={onClick}
  >
    {icon}
    <span>{label}</span>
  </motion.button>
);

/**
 * Empty State Component
 * @component
 * Displays when no projects are available
 */
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-12"
  >
    <img
      src="/empty-state.svg"
      alt="No projects"
      className="w-48 mx-auto mb-6"
    />
    <p className="text-gray-600 text-lg">
      No projects yet. Create your first project to get started!
    </p>
  </motion.div>
);

export default Dashboard;
