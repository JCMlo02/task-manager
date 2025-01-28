import React, {
  useEffect,
  useState,
  useReducer,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { FaPlusCircle } from "react-icons/fa";
import { DragDropContext } from "react-beautiful-dnd";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import LoadingSpinner from "./dashboard/LoadingSpinner";
import AnalyticsDashboard from "./dashboard/AnalyticsDashboard";
import InvitationsModal from "./dashboard/InvitationsModal";
import ProjectForm from "./dashboard/ProjectForm";
import TaskForm from "./dashboard/TaskForm";
import { taskReducer } from "./dashboard/index.js";
import { TASK_STATUSES, THEME } from "../constants";
import { TaskColumn } from "./dashboard/TaskBoard";
import { ProjectCard, EnhancedModal } from "./dashboard/ProjectCard";
import { LoadingOverlay } from "./dashboard/TaskBoard";
import { NotificationBell } from "./dashboard/NotificationBell";
import { CreateButton } from "./dashboard/TaskBoard";
import { TaskBoardModal } from "./dashboard/TaskBoard";
import { debounce } from "lodash"; // Add this import at the top
import { CacheService } from "../services/cacheService";

const API_URL = "https://9ehr6i4dpi.execute-api.us-east-1.amazonaws.com/dev";

// Add these constants at the top of the file, after imports
const POLLING_INTERVAL = 60000; // 1 minute in milliseconds

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
  // Add initialFetchRef to prevent duplicate initial fetches
  const initialFetchRef = useRef(false);

  const [isSessionValid, setIsSessionValid] = useState(true);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [sub, setSub] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("isDarkMode") === "true"
  );

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

  const [isFetchingProjects, setIsFetchingProjects] = useState(false);

  const navigate = useNavigate();

  // Replace tasks state with useReducer
  const [taskState, dispatchTasks] = useReducer(taskReducer, {
    allTasks: [], // All tasks across all projects
    tasksByProject: {}, // Tasks organized by project and status
    isLoading: false,
    error: null,
  });

  // Add loading debounce control
  const [showLoading, setShowLoading] = useState(false);
  const loadingTimeout = useRef(null);

  // Debounced loading handler
  const handleLoading = useCallback((isLoading) => {
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
    }

    if (isLoading) {
      loadingTimeout.current = setTimeout(() => {
        setShowLoading(true);
      }, 500); // Only show loading if operation takes more than 500ms
    } else {
      setShowLoading(false);
    }
  }, []);

  // Enhanced error handling for fetch operations
  const handleApiError = useCallback(
    (error, defaultMessage) => {
      console.error("API Error:", error);
      if (error.message === "Failed to fetch") {
        toast.error("Network error. Please check your connection.");
      } else if (error.status === 401 || error.status === 403) {
        setIsSessionValid(false);
        navigate("/");
      } else {
        toast.error(error.message || defaultMessage);
      }
      setError(error.message || defaultMessage);
    },
    [navigate]
  );

  // Add request tracking ref
  const requestTracker = useRef({
    inFlight: new Set(),
    lastFetch: {
      projects: 0,
      tasks: 0,
      invites: 0,
    },
  });

  const fetchAllTasks = useCallback(
    async (force = false) => {
      const requestKey = "tasks";
      if (requestTracker.current.inFlight.has(requestKey)) {
        return;
      }

      const now = Date.now();
      const timeSinceLastFetch =
        now - requestTracker.current.lastFetch[requestKey];
      if (!force && timeSinceLastFetch < POLLING_INTERVAL) {
        return;
      }

      try {
        requestTracker.current.inFlight.add(requestKey);
        handleLoading(true);

        if (!force && CacheService.isCacheValid()) {
          const cachedTasks = CacheService.getTasks(sub);
          if (cachedTasks.length > 0) {
            dispatchTasks({ type: "SET_TASKS", tasks: cachedTasks });
            return;
          }
        }

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

        if (JSON.stringify(taskState.allTasks) !== JSON.stringify(data)) {
          dispatchTasks({ type: "SET_TASKS", tasks: data });
          CacheService.setTasks(data, sub);
        }
      } catch (err) {
        console.error("Error fetching all tasks:", err);
        dispatchTasks({ type: "SET_ERROR", error: err.message });
        toast.error("Failed to fetch tasks");
      } finally {
        requestTracker.current.lastFetch[requestKey] = Date.now();
        requestTracker.current.inFlight.delete(requestKey);
        handleLoading(false);
      }
    },
    [sub, taskState.allTasks, handleLoading]
  );

  const fetchProjects = useCallback(
    async (force = false) => {
      const requestKey = "projects";
      if (requestTracker.current.inFlight.has(requestKey)) {
        return;
      }

      const now = Date.now();
      const timeSinceLastFetch =
        now - requestTracker.current.lastFetch[requestKey];
      if (!force && timeSinceLastFetch < POLLING_INTERVAL) {
        return;
      }

      try {
        requestTracker.current.inFlight.add(requestKey);
        setIsFetchingProjects(true);

        if (!force && CacheService.isCacheValid()) {
          const cachedProjects = CacheService.getProjects(sub);
          if (cachedProjects.length > 0) {
            setProjects(cachedProjects);
            return;
          }
        }

        const response = await fetch(`${API_URL}/projects?userId=${sub}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(
            (await response.text()) || "Failed to fetch projects"
          );
        }

        const data = await response.json();

        if (JSON.stringify(projects) !== JSON.stringify(data)) {
          setProjects(data);
          CacheService.setProjects(data, sub);
        }
      } catch (err) {
        handleApiError(err, "Failed to fetch projects");
      } finally {
        requestTracker.current.lastFetch[requestKey] = Date.now();
        requestTracker.current.inFlight.delete(requestKey);
        setIsFetchingProjects(false);
      }
    },
    [sub, handleApiError, projects]
  );

  const fetchPendingInvites = useCallback(
    async (force = false) => {
      const requestKey = "invites";
      if (requestTracker.current.inFlight.has(requestKey)) {
        return;
      }

      const now = Date.now();
      const timeSinceLastFetch =
        now - requestTracker.current.lastFetch[requestKey];
      if (!force && timeSinceLastFetch < POLLING_INTERVAL) {
        return;
      }

      try {
        requestTracker.current.inFlight.add(requestKey);
        const response = await fetch(`${API_URL}/invites?userId=${sub}`);
        const data = await response.json();

        if (JSON.stringify(pendingInvites) !== JSON.stringify(data)) {
          setPendingInvites(data);
        }
      } catch (err) {
        console.error("Error fetching invites:", err);
      } finally {
        requestTracker.current.lastFetch[requestKey] = Date.now();
        requestTracker.current.inFlight.delete(requestKey);
      }
    },
    [sub, pendingInvites]
  );

  // Replace the initial fetch useEffect and polling useEffect with a single unified version
  useEffect(() => {
    if (!sub || !isSessionValid) return;

    let isSubscribed = true;
    let pollTimer = null;

    const fetchData = async (force = false) => {
      if (!isSubscribed) return;

      try {
        await Promise.all([
          fetchProjects(force),
          fetchAllTasks(force),
          fetchPendingInvites(force),
        ]);
      } catch (error) {
        console.error("Data fetch error:", error);
      }
    };

    // Initial fetch
    if (!initialFetchRef.current) {
      initialFetchRef.current = true;
      fetchData(true); // Force initial fetch
    }

    // Set up polling
    const startPolling = () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchData(false);
        }
      }, POLLING_INTERVAL);
    };

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData(true); // Force fetch on tab focus
        startPolling();
      } else if (pollTimer) {
        clearInterval(pollTimer);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startPolling();

    // Cleanup
    return () => {
      isSubscribed = false;
      if (pollTimer) clearInterval(pollTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sub, isSessionValid, fetchProjects, fetchAllTasks, fetchPendingInvites]);

  // Add these functions before any conditional logic or returns
  const validateProjectForm = (formData) => {
    const errors = {};
    if (!formData.name?.trim()) {
      errors.name = "Project name is required";
    }
    if (formData.name?.length > 100) {
      errors.name = "Project name must be less than 100 characters";
    }
    if (formData.description?.length > 500) {
      errors.description = "Description must be less than 500 characters";
    }
    return errors;
  };

  // Move useEffect hooks to be with other hooks
  useEffect(() => {
    return () => {
      toast.dismiss();
    };
  }, []);

  // Enhanced useEffect for session management
  useEffect(() => {
    const checkSession = async () => {
      const currentUser = userPool.getCurrentUser();
      if (currentUser) {
        try {
          const session = await new Promise((resolve, reject) => {
            currentUser.getSession((err, session) => {
              if (err) reject(err);
              else resolve(session);
            });
          });

          if (!session.isValid()) {
            setIsSessionValid(false);
            navigate("/");
            return;
          }

          setUser(currentUser);
          setSub(session.getIdToken().payload.sub);
        } catch (err) {
          console.error("Session error:", err);
          setIsSessionValid(false);
          navigate("/");
        }
      } else {
        setIsSessionValid(false);
        navigate("/");
      }
    };

    checkSession();
    // Set up session check interval
    const intervalId = setInterval(checkSession, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(intervalId);
  }, [userPool, navigate]);

  useEffect(() => {
    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, []);

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
    if (!selectedIds.projectToDelete) return;

    await withLoading(async () => {
      await deleteProject(selectedIds.projectToDelete, sub);
      CacheService.deleteProject(selectedIds.projectToDelete, sub);
      setProjects((prev) =>
        prev.filter((p) => p.project_id !== selectedIds.projectToDelete)
      );
      setSelectedIds((prev) => ({
        ...prev,
        projectToDelete: null,
        selectedProjectId: null,
      }));
      setModalState((prev) => ({
        ...prev,
        isDeleteConfirmationOpen: false,
      }));
      toast.success("Project deleted successfully");
    });
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData || "Failed to delete task");
      }

      CacheService.deleteTask(taskId, sub);

      dispatchTasks({
        type: "SET_TASKS",
        tasks: taskState.allTasks.filter((task) => task.task_id !== taskId),
      });

      setModalState((prev) => ({ ...prev, isDeleteConfirmationOpen: false }));
      setSelectedIds((prev) => ({ ...prev, taskToDelete: null }));
      toast.success("Task deleted successfully");
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error(err.message || "Failed to delete task");
      throw err;
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedIds.taskToDelete || !selectedIds.selectedProjectId) return;

    await withLoading(async () => {
      await deleteTask(selectedIds.taskToDelete, selectedIds.selectedProjectId);
    });
  };

  /**
   * Handles project form submission for create/update operations
   * @param {Event} e - Form submission event
   * @param {boolean} isUpdate - Flag indicating if this is an update operation
   */
  const handleProjectSubmit = async (formData, isUpdate) => {
    const errors = validateProjectForm(formData);
    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((error) => toast.error(error));
      return;
    }

    await withLoading(async () => {
      try {
        let url = `${API_URL}/projects`;
        if (isUpdate) {
          url += `?project_id=${selectedIds.selectedProjectId}`;
        }

        const response = await fetch(url, {
          method: isUpdate ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            userId: sub,
            project_id: isUpdate ? selectedIds.selectedProjectId : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to ${isUpdate ? "update" : "create"} project`
          );
        }

        if (isUpdate) {
          // Update cache
          CacheService.updateProject(
            {
              ...formData,
              project_id: selectedIds.selectedProjectId,
            },
            sub
          ); // Add sub parameter
        } else {
          // Add to cache
          const newProject = {
            ...formData,
            project_id: response.data.project_id,
          };
          CacheService.setProjects(
            [...CacheService.getProjects(sub), newProject],
            sub
          ); // Add sub parameter
        }

        await fetchProjects();
        setModalState((prev) => ({ ...prev, isProjectModalOpen: false }));
        toast.success(
          `Project ${isUpdate ? "updated" : "created"} successfully`
        );
      } catch (err) {
        handleApiError(
          err,
          `Failed to ${isUpdate ? "update" : "create"} project`
        );
      }
    });
  };

  const handleTaskSubmit = async (e, formData, isUpdate = false) => {
    e.preventDefault(); // Ensure preventDefault is called on the event object
    await withLoading(async () => {
      const { name, description, assigned_to } = formData;

      // Validate required fields
      if (!name.trim()) {
        toast.error("Task name is required");
        return;
      }

      try {
        const url = isUpdate
          ? `${API_URL}/tasks?task_id=${selectedIds.selectedTaskId}`
          : `${API_URL}/tasks`;

        // If updating, find existing task to preserve its status
        const existingTask = isUpdate
          ? taskState.allTasks.find(
              (t) => t.task_id === selectedIds.selectedTaskId
            )
          : null;

        const requestBody = {
          name: name.trim(),
          description: description.trim(),
          project_id: selectedIds.selectedProjectId,
          userId: sub,
          assigned_to: assigned_to || null,
          // Only set status to BACKLOG for new tasks
          status: isUpdate ? existingTask?.status : "BACKLOG",
        };

        console.log("Creating/Updating task with:", requestBody);

        const response = await fetch(url, {
          method: isUpdate ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData || `Failed to ${isUpdate ? "update" : "create"} task`
          );
        }

        const data = await response.json();
        console.log("Server response:", data);

        // Get current user's username for new tasks
        const currentUser = userPool.getCurrentUser();
        const session = await new Promise((resolve, reject) => {
          currentUser.getSession((err, session) => {
            if (err) reject(err);
            else resolve(session);
          });
        });
        const username = session.getIdToken().payload["cognito:username"];

        // Ensure we have valid task data with usernames
        const newTask = {
          ...(data.task || data),
          name: name.trim(),
          description: description.trim(),
          task_id: String(data.task_id || data.task?.task_id),
          project_id: String(selectedIds.selectedProjectId),
          created_by: sub,
          creator_username: username, // Add creator's username
          assigned_to: assigned_to || null,
          status: isUpdate ? existingTask?.status : "BACKLOG",
          assignee_username: assigned_to
            ? projects
                .find((p) => p.project_id === selectedIds.selectedProjectId)
                ?.members.find((m) => m.user_id === assigned_to)?.username
            : null,
        };

        // Update tasks state
        if (isUpdate) {
          dispatchTasks({
            type: "SET_TASKS",
            tasks: taskState.allTasks.map((task) =>
              task.task_id === selectedIds.selectedTaskId
                ? { ...task, ...newTask }
                : task
            ),
          });
          CacheService.updateTask(newTask, sub); // Add sub parameter
        } else {
          dispatchTasks({
            type: "SET_TASKS",
            tasks: [...taskState.allTasks, newTask],
          });
          CacheService.setTasks([...CacheService.getTasks(sub), newTask], sub); // Add sub parameter
        }

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

  const handleProjectInvitation = async (projectId, inviteUserId) => {
    if (!projectId || !inviteUserId) {
      throw new Error("Project ID and User ID are required");
    }

    try {
      const response = await fetch(`${API_URL}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: projectId,
          invitee_id: inviteUserId,
          userId: sub, // Current user's ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send invitation");
      }

      toast.success("Invitation sent successfully");
      setShowInviteModal(false);
      setInviteUserId("");
    } catch (err) {
      console.error("Error sending invitation:", err);
      throw new Error(err.message || "Failed to send invitation");
    }
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
    handleLoading(true);
    try {
      await operation();
    } catch (err) {
      toast.error(err.message || "An error occurred");
      setError(err.message);
    } finally {
      handleLoading(false);
    }
  };

  // Move useCallback hooks to the top, before any conditional returns
  const handleTaskModalOpen = useCallback((projectId) => {
    setSelectedIds((prev) => ({
      ...prev,
      selectedProjectId: projectId,
    }));
    setModalState((prev) => ({
      ...prev,
      isTaskModalOpen: true,
    }));
  }, []); // Remove taskState.tasks dependency since we're using global state

  const handleEditTask = useCallback((task) => {
    setSelectedIds((prev) => ({
      ...prev,
      selectedTaskId: task.task_id,
    }));
    setFormState((prev) => ({
      ...prev,
      newTaskName: task.name,
      newTaskDescription: task.description,
      assignedTo: task.assigned_to,
    }));
    setModalState((prev) => ({
      ...prev,
      isCreateTaskModalOpen: true,
    }));
  }, []);

  const handleDragEnd = useCallback(
    async (result) => {
      const { destination, source, draggableId } = result;

      if (!destination || !draggableId) {
        return;
      }

      const task = taskState.allTasks.find(
        (t) => String(t.task_id) === String(draggableId)
      );
      console.log(task);
      if (!task) {
        console.error("Task not found:", draggableId);
        return;
      }

      // Apply optimistic update
      dispatchTasks({
        type: "UPDATE_TASK_STATUS",
        taskId: String(draggableId),
        status: destination.droppableId,
      });

      try {
        const response = await fetch(
          `${API_URL}/tasks?task_id=${draggableId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              task_id: String(draggableId),
              project_id: String(task.project_id),
              status: destination.droppableId,
              userId: sub,
              name: task.name,
              description: task.description,
              assigned_to: task.assigned_to,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update task status");
        }
      } catch (error) {
        // Revert on failure
        dispatchTasks({
          type: "UPDATE_TASK_STATUS",
          taskId: String(draggableId),
          status: source.droppableId,
        });
        toast.error(error.message);
      }
    },
    [taskState.allTasks, sub]
  );

  const renderTaskBoard = useCallback(() => {
    if (taskState.isLoading) return <LoadingSpinner />;

    const currentProject = projects.find(
      (p) => String(p.project_id) === String(selectedIds.selectedProjectId)
    );

    const projectTasks = taskState.tasksByProject[
      selectedIds.selectedProjectId
    ] || {
      BACKLOG: [],
      IN_PROGRESS: [],
      IN_TESTING: [],
      DONE: [],
    };

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
          {Object.entries(TASK_STATUSES).map(([_, status]) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={projectTasks[status] || []}
              onEditTask={handleEditTask}
              onDeleteTask={(taskId) => {
                setSelectedIds((prev) => ({
                  ...prev,
                  taskToDelete: taskId,
                }));
                setModalState((prev) => ({
                  ...prev,
                  isDeleteConfirmationOpen: true,
                }));
              }}
              isDarkMode={isDarkMode}
              projectMembers={currentProject?.members || []}
            />
          ))}
        </div>
      </DragDropContext>
    );
  }, [
    taskState.isLoading,
    selectedIds.selectedProjectId,
    taskState.tasksByProject,
    projects,
    isDarkMode,
    handleEditTask,
    handleDragEnd,
  ]);

  // Now we can have our conditional returns
  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!user) {
    return <LoadingSpinner />;
  }

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

  const handleDeleteClick = (projectId) => {
    // First set the project to delete
    setSelectedIds((prev) => ({
      ...prev,
      projectToDelete: projectId,
      selectedProjectId: projectId, // Also set this to ensure proper context
    }));
    // Then open the confirmation modal
    setModalState((prev) => ({
      ...prev,
      isDeleteConfirmationOpen: true,
    }));
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

  if (!user) {
    return <LoadingSpinner />;
  }

  const InviteUserModal = React.memo(() => {
    const [localSearchQuery, setLocalSearchQuery] = useState("");
    const [localSearchResults, setLocalSearchResults] = useState([]);

    const debouncedSearch = useMemo(
      () =>
        debounce(async (query) => {
          if (!query.trim()) {
            setLocalSearchResults([]);
            return;
          }

          try {
            const response = await fetch(
              `${API_URL}/users?query=${query}&userId=${sub}`,
              {
                headers: { "Content-Type": "application/json" },
              }
            );
            if (!response.ok) throw new Error("Failed to search users");
            const data = await response.json();
            setLocalSearchResults(data);
          } catch (err) {
            toast.error("Error searching users");
            console.error(err);
          }
        }, 300),
      []
    );

    useEffect(() => {
      return () => {
        debouncedSearch.cancel();
      };
    }, [debouncedSearch]);

    return (
      <EnhancedModal
        title="Invite User"
        onClose={() => setShowInviteModal(false)}
        isDarkMode={isDarkMode}
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={localSearchQuery}
              onChange={(e) => {
                setLocalSearchQuery(e.target.value);
                debouncedSearch(e.target.value);
              }}
              placeholder="Search users..."
              className="w-full p-2 border rounded-lg"
            />

            <div className="mt-4">
              {localSearchResults.map((user) => (
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
  });

  const DeleteConfirmationModal = () => {
    const [confirmText, setConfirmText] = useState("");
    const isProjectDelete = !!selectedIds.projectToDelete;
    const itemType = isProjectDelete ? "project" : "task";
    const requiredText = isProjectDelete ? "delete" : "confirm";

    return (
      <EnhancedModal
        title={`Delete ${itemType}`}
        onClose={() => {
          setModalState((prev) => ({
            ...prev,
            isDeleteConfirmationOpen: false,
          }));
          setSelectedIds((prev) => ({
            ...prev,
            projectToDelete: null,
            taskToDelete: null,
          }));
        }}
        isDarkMode={isDarkMode}
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this {itemType}?</p>
          <p className="text-sm text-red-500">This action cannot be undone.</p>
          <input
            type="text"
            placeholder={`Type '${requiredText}' to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setModalState((prev) => ({
                  ...prev,
                  isDeleteConfirmationOpen: false,
                }));
                setSelectedIds((prev) => ({
                  ...prev,
                  projectToDelete: null,
                  taskToDelete: null,
                }));
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={isProjectDelete ? handleDeleteProject : handleDeleteTask}
              disabled={confirmText !== requiredText}
              className={`px-4 py-2 text-white rounded-lg ${
                confirmText === requiredText
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-red-300 cursor-not-allowed"
              }`}
            >
              Delete
            </button>
          </div>
        </div>
      </EnhancedModal>
    );
  };

  if (!isSessionValid) {
    return null; // Let the navigation handle redirect
  }

  return (
    <div
      className={`min-h-screen ${darkModeClasses} transition-all duration-300`}
    >
      {/* Only show loading overlay when showLoading is true */}
      {showLoading && <LoadingOverlay isDarkMode={isDarkMode} />}

      <Navbar
        userPool={userPool}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        className={`fixed w-full top-0 z-50 transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-900/95 text-white border-b border-gray-800"
            : "bg-white/95 text-gray-800 border-b border-gray-200"
        }`}
      />
      <Toaster position="top-right" />

      {/* Add padding-top to main to account for fixed Navbar */}
      <main className="container mx-auto px-4 py-8 pt-20">
        {" "}
        {/* Removed pt-32 */}
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
            tasks={taskState.allTasks} // Use taskState instead of globalTasks
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
                onClick={() => {
                  setSelectedIds((prev) => ({
                    ...prev,
                    selectedProjectId: null,
                  })); // Reset selectedProjectId
                  setModalState({ ...modalState, isProjectModalOpen: true });
                  setFormState({
                    // Reset form state
                    newProjectName: "",
                    newProjectDescription: "",
                    assignedTo: "",
                  });
                }}
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
                onDelete={() => handleDeleteClick(project.project_id)}
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
              onClose={() => {
                setModalState((prev) => ({
                  ...prev,
                  isProjectModalOpen: false,
                }));
                setSelectedIds((prev) => ({
                  ...prev,
                  selectedProjectId: null,
                })); // Reset on close
                setFormState({
                  // Reset form state
                  newProjectName: "",
                  newProjectDescription: "",
                  assignedTo: "",
                });
              }}
              isDarkMode={isDarkMode}
            >
              <ProjectForm
                initialData={selectedProject}
                onSubmit={handleProjectSubmit}
                onCancel={() =>
                  setModalState((prev) => ({
                    ...prev,
                    isProjectModalOpen: false,
                  }))
                }
                isDarkMode={isDarkMode}
              />
            </EnhancedModal>
          )}

          {modalState.isTaskModalOpen && (
            <TaskBoardModal
              onClose={() =>
                setModalState((prev) => ({ ...prev, isTaskModalOpen: false }))
              }
              onCreateTask={() => {
                setSelectedIds((prev) => ({ ...prev, selectedTaskId: null })); // Reset selectedTaskId
                setFormState({
                  // Reset form state
                  newTaskName: "",
                  newTaskDescription: "",
                  assignedTo: "",
                });
                setModalState((prev) => ({
                  ...prev,
                  isCreateTaskModalOpen: true,
                }));
              }}
              isDarkMode={isDarkMode}
              project={selectedProject}
            >
              {renderTaskBoard()}
            </TaskBoardModal>
          )}

          {modalState.isCreateTaskModalOpen && (
            <EnhancedModal
              title={selectedIds.selectedTaskId ? "Edit Task" : "Create Task"}
              onClose={() => {
                setModalState((prev) => ({
                  ...prev,
                  isCreateTaskModalOpen: false,
                }));
                setSelectedIds((prev) => ({ ...prev, selectedTaskId: null })); // Reset on close
                setFormState({
                  // Reset form state
                  newTaskName: "",
                  newTaskDescription: "",
                  assignedTo: "",
                });
              }}
              isDarkMode={isDarkMode}
            >
              <TaskForm
                onSubmit={(e, formData) =>
                  handleTaskSubmit(e, formData, !!selectedIds.selectedTaskId)
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
                onCancel={() =>
                  setModalState({ ...modalState, isCreateTaskModalOpen: false })
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
          {showInvitesModal && (
            <InvitationsModal
              pendingInvites={pendingInvites}
              onClose={() => setShowInvitesModal(false)}
              onResponse={handleInviteResponse}
            />
          )}
          {modalState.isDeleteConfirmationOpen && <DeleteConfirmationModal />}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
