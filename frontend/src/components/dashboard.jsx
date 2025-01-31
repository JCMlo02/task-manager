import React, { useEffect, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";
import { FaPlusCircle, FaChartLine, FaClock, FaUsers } from "react-icons/fa"; 
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/slide.css";
import LoadingSpinner from "./common/LoadingSpinner";
import AnalyticsDashboard from "./dashboard/DashboardFeatures/AnalyticsDashboard";
import InvitationsModal from "./dashboard/Invites/InvitationsModal";
import ProjectForm from "./dashboard/Projects/ProjectForm";
import TaskForm from "./dashboard/Tasks/TaskForm";
import { TASK_STATUSES } from "../constants"; 
import { ProjectCard } from "./dashboard/Projects/ProjectCard"; 
import {
  LoadingOverlay,
  TaskColumn,
  TaskBoardModal,
} from "./dashboard/Tasks/TaskBoard";
import { CreateButton } from "./common/Button"; // Update this import
import { NotificationBell } from "./common/NotificationBell";
import { CacheService } from "../services/cacheService";
import { useMediaQuery, BREAKPOINTS } from "../styles/responsive";
import { taskService, projectService } from "../services/apiService";
import { useAppState } from "../states/stateManagement";
import { validateProjectForm, handleApiError } from "../utils/utils";
import { useTasks } from "./hooks/useTasks";
import { useProjects } from "./hooks/useProjects";
import { useInvites } from "./hooks/useInvites";
import { useLoadingState } from "./hooks/useLoadingState";
import { useDataFetching } from "./hooks/useDataFetching";
import InviteUserModal from "./dashboard/Invites/InviteUserModal";
import DeleteConfirmationModal from "./common/DeleteConfirmationModal";
import ProjectModal from "./dashboard/Projects/ProjectModal";
import TaskModal from "./dashboard/Tasks/TaskModal";
import ActivityTimeline from "./dashboard/DashboardFeatures/ActivityTimeline";
import TeamStats from "./dashboard/DashboardFeatures/TeamStats";
import CommentsModal from "./dashboard/Comments/CommentsModal";
import { v4 as uuid } from "uuid";
const API_URL = "https://9ehr6i4dpi.execute-api.us-east-1.amazonaws.com/dev";

const POLLING_INTERVAL = 60000 * 5; // 5 minute in milliseconds

const getGridColumns = (isMobile, numItems) => {
  if (isMobile) return "grid-cols-1";
  if (numItems < 3) return "md:grid-cols-2";
  return "md:grid-cols-2 lg:grid-cols-3";
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
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md})`);
  const navigate = useNavigate();

  const {
    isSessionValid,
    setIsSessionValid,
    user,
    setUser,
    sub,
    setSub,
    error,
    setError,
    isDarkMode,
    setIsDarkMode,
    modalState,
    setModalState,
    formState,
    setFormState,
    selectedIds,
    setSelectedIds,
  } = useAppState();

  const { showLoading, handleLoading } = useLoadingState();
  const { projects, setProjects, isFetchingProjects, fetchProjects } =
    useProjects(sub);
  const { taskState, setTaskState, fetchAllTasks } = useTasks(sub); 
  const {
    pendingInvites,
    showInviteModal,
    setShowInviteModal,
    inviteUserId,
    setInviteUserId,
    handleInviteUser,
    handleInviteResponse,
    fetchPendingInvites,
  } = useInvites(sub, fetchProjects); 

  const { fetchWithTracking } = useDataFetching(
    API_URL,
    handleLoading,
    sub,
    handleApiError
  );

  const [commentsModalState, setCommentsModalState] = useState({
    isOpen: false,
    task: null,
  });

  const darkModeClasses = useMemo(() => {
    return isDarkMode
      ? "bg-gray-900 text-gray-100"
      : "bg-gradient-to-br from-emerald-50 via-cyan-50 to-sky-50 text-gray-900";
  }, [isDarkMode]);

  const handleDragEnd = useCallback(
    async ({ destination, draggableId, source }) => {
      if (
        !destination ||
        !draggableId ||
        destination.droppableId === source.droppableId
      ) {
        return;
      }

      const taskId = String(draggableId);
      const task = taskState.allTasks.find((t) => String(t.task_id) === taskId);

      if (!task) {
        console.error("Task not found:", taskId);
        return;
      }

      const newStatus = destination.droppableId;
      const updatedTask = {
        ...task,
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      try {
        const updatedTasks = taskState.allTasks.map((t) =>
          String(t.task_id) === taskId ? updatedTask : t
        );

        setTaskState((prev) => ({
          ...prev, // Keep existing state
          allTasks: updatedTasks,
        }));
        console.log("Task state after drag:", taskState);
        console.log(taskState);

        // Make API call
        const response = await taskService.updateTaskStatus(
          taskId,
          updatedTask.project_id,
          newStatus,
          sub
        );

        if (response) {
          const finalTask = { ...response, task_id: taskId };

          setTaskState((prev) => ({
            ...prev,
            allTasks: prev.allTasks.map((t) =>
              String(t.task_id) === taskId ? finalTask : t
            ),
          }));
          console.log("Task state after API call:", taskState);
          console.log(taskState);

          // Update cache
          CacheService.updateTask(finalTask, sub);
        }
      } catch (error) {
        console.error("Task update failed:", error);
        // Load from cache instead of setting empty array
        const cachedTasks = CacheService.getTasks(sub) || taskState.allTasks;
        setTaskState((prev) => ({
          ...prev,
          allTasks: cachedTasks,
        }));
        console.log("Task state after error cache update:");
        console.log(taskState);
        toast.error("Failed to update task status");
      }
    },
    [taskState, sub, setTaskState]
  );

  const handleTaskModalOpen = useCallback(
    (projectId) => {
      setSelectedIds((prev) => ({ ...prev, selectedProjectId: projectId }));
      setModalState((prev) => ({ ...prev, isTaskModalOpen: true }));
    },
    [setSelectedIds, setModalState]
  );

  const handleEditProject = useCallback(
    (project) => {
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
    },
    [selectedIds, modalState, setSelectedIds, setFormState, setModalState]
  );

  const handleDeleteClick = useCallback(
    (projectId) => {
      setSelectedIds((prev) => ({
        ...prev,
        projectToDelete: projectId,
        selectedProjectId: projectId,
      }));
      setModalState((prev) => ({
        ...prev,
        isDeleteConfirmationOpen: true,
      }));
    },
    [setSelectedIds, setModalState]
  );
  const selectedProject = useMemo(
    () =>
      (Array.isArray(projects) ? projects : []).find(
        (p) => p && p.project_id === selectedIds.selectedProjectId
      ),
    [projects, selectedIds.selectedProjectId]
  );

  const handleDeleteProject = useCallback(async () => {
    if (!selectedIds.projectToDelete) return;

    try {
      // Update cache first for optimistic update
      CacheService.deleteProject(selectedIds.projectToDelete, sub);

      setProjects((prev) =>
        prev.filter((p) => p.project_id !== selectedIds.projectToDelete)
      );

      await projectService.deleteProject(selectedIds.projectToDelete, sub);
    } catch (err) {
      // Revert cache on failure
      const originalProjects = CacheService.getProjects(sub);
      setProjects(originalProjects);
      handleApiError(err, "Failed to delete project", setError, navigate);
    } finally {
      setSelectedIds((prev) => ({
        ...prev,
        projectToDelete: null,
        selectedProjectId: null,
      }));
      setModalState((prev) => ({ ...prev, isDeleteConfirmationOpen: false }));
    }
  }, [
    selectedIds.projectToDelete,
    sub,
    navigate,
    setError,
    setModalState,
    setProjects,
    setSelectedIds,
  ]);

  const handleEditTask = useCallback(
    async (task, isCommentUpdate = false) => {
      if (isCommentUpdate) {
        handleLoading(true);
        try {
          // Make sure all required fields are included
          const updateData = {
            ...task,
            task_id: task.task_id,
            project_id: selectedIds.selectedProjectId,
            userId: sub,
            status: task.status || "BACKLOG",
            assigned_to: task.assigned_to || null,
            assignee_username: task.assignee_username,
            creator_username: task.creator_username,
            name: task.name,
            description: task.description,
            priority: task.priority || "MEDIUM",
            comments: task.comments || [],
            created_at: task.created_at,
            updated_at: new Date().toISOString(),
          };

          // Update cache first
          CacheService.updateTask(updateData, sub);

          // Make API call
          const updatedTask = await taskService.updateTask(
            task.task_id,
            updateData
          );

          // Update state
          setTaskState((prev) => ({
            ...prev,
            allTasks: prev.allTasks.map((t) =>
              t.task_id === task.task_id ? updatedTask : t
            ),
          }));
          console.log("Task state after task update:");
          console.log(taskState);

          // Update modal state
          setCommentsModalState((prev) => ({
            ...prev,
            task: updatedTask,
          }));

          toast.success("Comment added successfully");
        } catch (error) {
          console.error("Failed to update task:", error);
          toast.error("Failed to save comment");
        } finally {
          handleLoading(false);
        }
        return;
      }

      // Regular task update logic
      setSelectedIds((prev) => ({
        ...prev,
        selectedTaskId: task.task_id,
      }));
      setFormState((prev) => ({
        ...prev,
        newTaskName: task.name,
        newTaskDescription: task.description,
        assignedTo: task.assigned_to,
        priority: task.priority, 
        creator_username: task.creator_username, 
        assignee_username: task.assignee_username,
      }));
      setModalState((prev) => ({
        ...prev,
        isCreateTaskModalOpen: true,
      }));
    },
    [
      setTaskState,
      setSelectedIds,
      setFormState,
      setModalState,
      handleLoading,
      selectedIds.selectedProjectId,
      sub,
      taskState,
    ]
  );

  const handleTaskSubmit = useCallback(
    async (e, formData, isUpdate = false) => {
      e.preventDefault();
      const { name, description, assigned_to, priority } = formData;

      if (!name.trim()) {
        toast.error("Task name is required");
        return;
      }

      const taskId = isUpdate ? selectedIds.selectedTaskId : String(uuid());

      // Get project and member info
      const currentProject = projects.find(
        (p) => p.project_id === selectedIds.selectedProjectId
      );
      const assignedMember = currentProject?.members?.find(
        (m) => m.user_id === assigned_to
      );

      const taskData = {
        task_id: taskId,
        name: name.trim(),
        description: description.trim(),
        project_id: selectedIds.selectedProjectId,
        userId: sub,
        assigned_to: assigned_to || null,
        assignee_username: assigned_to ? assignedMember?.username : null,
        priority: priority || "MEDIUM",
        creator_username: user["cognito:username"],
        status: "BACKLOG", // Always start in BACKLOG
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        // Update state first for immediate UI feedback
        setTaskState((prev) => ({
          ...prev,
          allTasks: isUpdate
            ? prev.allTasks.map((t) =>
                String(t.task_id) === taskId ? taskData : t
              )
            : [...prev.allTasks, taskData],
        }));
        console.log("Task state after update:");
        console.log(taskState);

        // Update cache
        if (isUpdate) {
          await CacheService.updateTask(taskData, sub);
        } else {
          await CacheService.addTask(taskData, sub);
        }

        // Make API call
        const response = await (isUpdate
          ? taskService.updateTask(taskId, taskData)
          : taskService.createTask(taskData));

        // Update state and cache with response
        const finalTask = { ...response, task_id: taskId }; // Ensure consistent task ID

        setTaskState((prev) => ({
          ...prev,
          allTasks: prev.allTasks.map((t) =>
            String(t.task_id) === taskId ? finalTask : t
          ),
        }));
        console.log("Task state after API call:");
        console.log(taskState);

        await CacheService.updateTask(finalTask, sub);

        toast.success(`Task ${isUpdate ? "updated" : "created"} successfully`);

        // Close both modals
        setModalState((prev) => ({
          ...prev,
          isCreateTaskModalOpen: false,
          isTaskModalOpen: false, // Close the board modal too
        }));

        // Reset form and selection state
        setFormState({
          newTaskName: "",
          newTaskDescription: "",
          assignedTo: "",
          priority: "MEDIUM",
        });

        setSelectedIds((prev) => ({
          ...prev,
          selectedTaskId: null,
        }));
      } catch (error) {
        console.error("Task operation error:", error);
        // Revert on failure
        const originalTasks = CacheService.getTasks(sub);
        setTaskState((prev) => ({ ...prev, allTasks: originalTasks }));
        console.log("Task state after error cache update:");
        console.log(taskState);
        toast.error(`Failed to ${isUpdate ? "update" : "create"} task`);
      }
    },
    [
      selectedIds.selectedProjectId,
      selectedIds.selectedTaskId,
      projects,
      sub,
      user,
      setTaskState,
      setModalState,
      setFormState,
      setSelectedIds,
      taskState,
    ]
  );

  const handleProjectSubmit = useCallback(
    async (formData, isUpdate) => {
      const errors = validateProjectForm(formData);
      if (Object.keys(errors).length > 0) {
        Object.values(errors).forEach((error) => toast.error(error));
        return;
      }

      try {
        handleLoading(true);

        const projectData = {
          ...formData,
          userId: sub,
          project_id: isUpdate
            ? selectedIds.selectedProjectId
            : Date.now().toString(),
          members: isUpdate ? selectedProject?.members || [] : [],
          created_at: isUpdate
            ? selectedProject?.created_at
            : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Make API call first
        const response = await (isUpdate
          ? projectService.updateProject(
              selectedIds.selectedProjectId,
              projectData
            )
          : projectService.createProject(projectData));

        // Update local state with new data
        setProjects((prevProjects) => {
          console.log("Previous projects:", prevProjects);
          const updatedProjects = isUpdate
            ? prevProjects.map((p) =>
                p.project_id === response.project_id ? response : p
              )
            : [...prevProjects, response];
          console.log("Updated projects:", updatedProjects);
          return updatedProjects;
        });

        // Update cache
        await CacheService.setProjects(
          isUpdate
            ? projects.map((p) =>
                p.project_id === response.project_id ? response : p
              )
            : [...projects, response],
          sub
        );

        // Fetch fresh data to ensure consistency
        await fetchProjects();

        toast.success(
          `Project ${isUpdate ? "updated" : "created"} successfully`
        );
      } catch (err) {
        console.error("Project operation failed:", err);
        toast.error(`Failed to ${isUpdate ? "update" : "create"} project`);
        handleApiError(
          err,
          `Failed to ${isUpdate ? "update" : "create"} project`,
          setError,
          navigate
        );
      } finally {
        handleLoading(false);
        setModalState((prev) => ({ ...prev, isProjectModalOpen: false }));
        setFormState({
          newProjectName: "",
          newProjectDescription: "",
          assignedTo: "",
        });
        setSelectedIds((prev) => ({
          ...prev,
          selectedProjectId: null,
        }));
      }
    },
    [
      selectedIds.selectedProjectId,
      selectedProject,
      sub,
      projects,
      handleLoading,
      setProjects,
      navigate,
      setError,
      setModalState,
      setFormState,
      setSelectedIds,
      fetchProjects,
    ]
  );

  const handleInviteModal = useCallback(
    (projectId) => {
      setSelectedIds((prev) => ({ ...prev, selectedProjectId: projectId }));
      setShowInviteModal(true);
    },
    [setSelectedIds, setShowInviteModal]
  );

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      localStorage.setItem("isDarkMode", newValue);
      return newValue;
    });
  }, [setIsDarkMode]);

  const handleDeleteTask = useCallback(async () => {
    if (!selectedIds.taskToDelete || !selectedIds.selectedProjectId) return;

    const updatedTasks = CacheService.deleteTask(selectedIds.taskToDelete, sub);
    setTaskState((prev) => ({ ...prev, allTasks: updatedTasks }));
    setModalState((prev) => ({ ...prev, isDeleteConfirmationOpen: false }));
    setSelectedIds((prev) => ({ ...prev, taskToDelete: null }));

    try {
      await taskService.deleteTask(
        selectedIds.taskToDelete,
        selectedIds.selectedProjectId,
        sub
      );
      toast.success("Task deleted successfully");
    } catch (error) {
      // Revert on failure
      const originalTasks = CacheService.getTasks(sub);
      setTaskState((prev) => ({ ...prev, allTasks: originalTasks }));
      toast.error("Failed to delete task");
    }
  }, [
    selectedIds.taskToDelete,
    selectedIds.selectedProjectId,
    sub,
    setModalState,
    setSelectedIds,
    setTaskState,
  ]);

  const handleInviteResponseWrapper = useCallback(
    async (projectId, response) => {
      console.log("Dashboard handling invite response:", {
        projectId,
        response,
      });
      try {
        await handleInviteResponse(projectId, response);
        await fetchProjects();
        await fetchPendingInvites(); // refresh invites
        setModalState((prev) => ({ ...prev, isInvitesModalOpen: false }));
        toast.success(`Invitation ${response.toLowerCase()} successfully`);
      } catch (error) {
        console.error("Error handling invite response:", error);
        toast.error("Failed to handle invitation response");
      }
    },
    [handleInviteResponse, fetchProjects, fetchPendingInvites, setModalState]
  );

  // Add comment handling callback
  const handleCommentClick = useCallback((task) => {
    setCommentsModalState({
      isOpen: true,
      task,
    });
  }, []);

  const handleAddComment = useCallback(
    async (comment) => {
      if (!commentsModalState.task) return;

      const newComment = {
        id: String(Date.now()),
        text: comment,
        user: user["cognito:username"],
        timestamp: new Date().toISOString(),
      };

      const updatedTask = {
        ...commentsModalState.task,
        comments: [...(commentsModalState.task.comments || []), newComment],
      };

      try {
        // Make API call first
        const response = await taskService.updateTask(updatedTask.task_id, {
          ...updatedTask,
          project_id: selectedIds.selectedProjectId,
          userId: sub,
        });

        // If successful, update local state and cache
        if (response) {
          setTaskState((prev) => ({
            ...prev,
            allTasks: prev.allTasks.map((t) =>
              t.task_id === response.task_id ? response : t
            ),
          }));

          setCommentsModalState((prev) => ({
            ...prev,
            task: response,
          }));

          // Update cache after successful API call
          CacheService.updateTask(response, sub);

          toast.success("Comment added successfully");
        }
      } catch (error) {
        console.error("Failed to add comment:", error);
        toast.error("Failed to add comment");
      }
    },
    [
      commentsModalState.task,
      user,
      sub,
      selectedIds.selectedProjectId,
      setTaskState,
    ]
  );

  useEffect(() => {
    console.log("Auth State:", { isSessionValid, user, sub });
  }, [isSessionValid, user, sub]);

  useEffect(() => {
    let isMounted = true;

    const checkAuthAndInitialize = async () => {
      try {
        const currentUser = userPool.getCurrentUser();
        if (!currentUser) {
          throw new Error("No current user found");
        }

        const session = await new Promise((resolve, reject) => {
          currentUser.getSession((err, session) => {
            if (err) reject(err);
            else resolve(session);
          });
        });

        if (!session.isValid()) {
          throw new Error("Invalid session");
        }

        // Get user data from session
        const userData = session.getIdToken().payload;

        if (isMounted) {
          setSub(userData.sub);
          setUser(userData);
          setIsSessionValid(true);
          setIsAuthChecked(true);
          console.log("Auth check successful:", { userData });
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (isMounted) {
          // Clear auth data
          localStorage.removeItem("userSub");
          localStorage.removeItem("userData");
          localStorage.removeItem("isAuthenticated");
          setSub(null);
          setUser(null);
          setIsSessionValid(false);
          navigate("/login");
        }
      }
    };

    // Immediate check without setTimeout
    checkAuthAndInitialize();

    return () => {
      isMounted = false;
    };
  }, [userPool, navigate, setSub, setUser, setIsSessionValid]);

  // Add initialization state
  const [isInitialized, setIsInitialized] = useState(false);

  // Add auth checking state
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Modified state to track loading status of initial data fetch
  const [initialDataFetched, setInitialDataFetched] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let pollTimer = null;

    const initializeDashboard = async () => {
      if (!isAuthChecked || !sub || !isSessionValid || initialDataFetched) {
        console.log("Skipping data fetch:", {
          isAuthChecked,
          sub,
          isSessionValid,
          initialDataFetched,
        });
        return;
      }

      try {
        console.log("Starting initial data fetch...");
        handleLoading(true);
        await Promise.all([
          fetchWithTracking("projects", true, fetchProjects),
          fetchWithTracking("tasks", true, fetchAllTasks),
          fetchWithTracking("invites", true, fetchPendingInvites),
        ]);
        console.log("Initial data fetch complete");
        if (isMounted) {
          setInitialDataFetched(true);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Data fetch error:", error);
        if (isMounted) setError("Failed to load dashboard data");
      } finally {
        if (isMounted) handleLoading(false);
      }
    };

    initializeDashboard();

    if (initialDataFetched) {
      pollTimer = setInterval(() => {
        if (document.visibilityState === "visible" && sub && isSessionValid) {
          console.log("Polling for updates silently...");
          Promise.all([
            fetchWithTracking("projects", false, fetchProjects),
            fetchWithTracking("tasks", false, fetchAllTasks),
            fetchWithTracking("invites", false, fetchPendingInvites),
          ]).catch(console.error);
        }
      }, POLLING_INTERVAL);
    }

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [
    isAuthChecked,
    sub,
    isSessionValid,
    initialDataFetched, 
    fetchWithTracking,
    fetchProjects,
    fetchAllTasks,
    fetchPendingInvites,
    handleLoading,
    setError,
  ]);

  const renderTaskBoard = useCallback(() => {
    if (taskState.isLoading) return <LoadingSpinner />;

    const currentProjectId = selectedIds.selectedProjectId;
    if (!currentProjectId) return null;

    const projectTasks = taskState.allTasks.filter(
      (task) => task && String(task.project_id) === String(currentProjectId)
    );

    return (
      <DragDropContext
        onDragUpdate={(update) => {
          const { destination, source } = update;
          console.log(
            "Dragging from",
            source.droppableId,
            "to",
            destination?.droppableId
          );
        }}
        onDragEnd={handleDragEnd}
      >
        <div
          className={`
            ${
              isMobile
                ? "flex flex-col space-y-4"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            }
            relative
            h-[calc(100vh-12rem)]
            w-full
            auto-rows-fr
          `}
        >
          {Object.entries(TASK_STATUSES).map(([key, status]) => (
            <Droppable
              key={status}
              droppableId={status}
              type="task"
              mode="standard"
              direction="vertical"
            >
              {(provided, snapshot) => (
                <TaskColumn
                  status={status}
                  tasks={projectTasks}
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
                  onCommentClick={handleCommentClick}
                  isDarkMode={isDarkMode}
                  currentUser={user}
                  isDraggingOver={snapshot.isDraggingOver}
                  droppableRef={provided.innerRef}
                  droppableProps={provided.droppableProps}
                >
                  {provided.placeholder}
                </TaskColumn>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    );
  }, [
    taskState,
    selectedIds.selectedProjectId,
    isDarkMode,
    handleEditTask,
    handleDragEnd,
    isMobile,
    setModalState,
    setSelectedIds,
    user,
    handleCommentClick,
  ]);

  if (!isAuthChecked) {
    console.log("Checking authentication...");
    return <LoadingSpinner />;
  }

  if (!isSessionValid || !sub || !user) {
    console.log("Auth not valid, redirecting...");
    return <LoadingSpinner />;
  }

  if (!isInitialized || isFetchingProjects) {
    console.log("Dashboard not initialized or fetching projects");
    return <LoadingSpinner />;
  }

  if (error) {
    console.log("Error state:", error);
    return <div className="text-red-500 p-4">Error: {error}</div>;
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
        className={`
          fixed w-full top-0 z-50 transition-colors duration-300
          ${
            isDarkMode
              ? "bg-gray-900/95 text-white border-b border-gray-800"
              : "bg-emerald-600/95 text-white border-b border-emerald-500 shadow-sm"
          }
        `}
      />
      <Toaster position={isMobile ? "bottom-center" : "top-right"} />

      {/* Main container - Update height and scrolling */}
      <main
        className={`
          container mx-auto 
          ${isMobile ? "px-3" : "px-4"} 
          py-8 
          ${isMobile ? "pt-16" : "pt-20"}
          min-h-[calc(100vh-4rem)]
        `}
      >
        {!modalState.isTeamStatsModalOpen &&
          !modalState.isActivityModalOpen &&
          !modalState.isAnalyticsModalOpen && (
            <motion.section
              className={`
                h-full
                space-y-6 
                ${
                  !isDarkMode
                    ? "bg-white-950/50 rounded-xl shadow-sm backdrop-blur-sm p-6"
                    : "bg-slate-950 rounded-xl shadow-sm backdrop-blur-sm p-6"
                }
              `}
            >
              {/* Header */}
              <div className="flex justify-between items-center flex-wrap gap-4">
                <h1
                  className={`text-2xl md:text-3xl font-bold ${
                    isDarkMode ? "text-gray-100" : "text-emerald-900"
                  }`}
                >
                  Projects
                </h1>
                <div className="flex items-center gap-2">
                  <NotificationBell
                    count={pendingInvites.length}
                    onClick={() =>
                      setModalState((prev) => ({
                        ...prev,
                        isInvitesModalOpen: true,
                      }))
                    }
                    isDarkMode={isDarkMode}
                  />
                  <CreateButton
                    onClick={() =>
                      setModalState((prev) => ({
                        ...prev,
                        isTeamStatsModalOpen: true,
                      }))
                    }
                    label="Team"
                    icon={<FaUsers className="w-4 h-4" />}
                    isDarkMode={isDarkMode}
                  />
                  <CreateButton
                    onClick={() =>
                      setModalState((prev) => ({
                        ...prev,
                        isActivityModalOpen: true,
                      }))
                    }
                    label="Activity"
                    icon={<FaClock className="w-4 h-4" />}
                    isDarkMode={isDarkMode}
                  />
                  <CreateButton
                    onClick={() =>
                      setModalState((prev) => ({
                        ...prev,
                        isAnalyticsModalOpen: true,
                      }))
                    }
                    label="Analytics"
                    icon={<FaChartLine className="w-4 h-4" />}
                    isDarkMode={isDarkMode}
                  />
                  <CreateButton
                    onClick={() => {
                      setSelectedIds((prev) => ({
                        ...prev,
                        selectedProjectId: null,
                      })); // Reset selectedProjectId
                      setModalState({
                        ...modalState,
                        isProjectModalOpen: true,
                      });
                      setFormState({
                        // Reset form state
                        newProjectName: "",
                        newProjectDescription: "",
                        assignedTo: "",
                      });
                    }}
                    label="New"
                    icon={<FaPlusCircle className="w-4 h-4" />}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>

              {/* Projects Grid */}
              <div
                className={`
                  grid 
                  ${getGridColumns(isMobile, projects.length)} 
                  gap-4 md:gap-6
                  ${
                    isDarkMode ? "bg-slate-800/50" : "bg-slate-100/50"
                  } // Updated background
                  rounded-xl 
                  shadow-sm 
                  backdrop-blur-sm 
                  p-6
                  max-h-[calc(100vh-16rem)]
                  overflow-y-auto
                  scrollbar-thin
                  ${
                    isDarkMode
                      ? "scrollbar-thumb-slate-600"
                      : "scrollbar-thumb-slate-500" 
                  }
                  scrollbar-track-transparent
                  relative
                  isolate
                `}
              >
                {projects.map((project) => (
                  <ProjectCard
                    key={project.project_id}
                    project={project}
                    onEdit={() => handleEditProject(project)}
                    onDelete={() => handleDeleteClick(project.project_id)}
                    onViewTasks={() => handleTaskModalOpen(project.project_id)}
                    onInvite={() => handleInviteModal(project.project_id)}
                    isDarkMode={isDarkMode}
                    isMobile={isMobile}
                  />
                ))}
              </div>
            </motion.section>
          )}
        {modalState.isTeamStatsModalOpen && (
          <TeamStats
            projects={projects}
            tasks={taskState.allTasks}
            isDarkMode={isDarkMode}
            onClose={() =>
              setModalState((prev) => ({
                ...prev,
                isTeamStatsModalOpen: false,
              }))
            }
          />
        )}
        {modalState.isActivityModalOpen && (
          <ActivityTimeline
            projects={projects}
            tasks={taskState.allTasks}
            isDarkMode={isDarkMode}
            onClose={() =>
              setModalState((prev) => ({ ...prev, isActivityModalOpen: false }))
            }
          />
        )}
        {modalState.isAnalyticsModalOpen && (
          <AnalyticsDashboard
            tasks={taskState.allTasks}
            projects={projects}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            onClose={() =>
              setModalState((prev) => ({
                ...prev,
                isAnalyticsModalOpen: false,
              }))
            }
          />
        )}
        {/* Modals */}
        <AnimatePresence>
          {modalState.isProjectModalOpen && (
            <ProjectModal
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
                isMobile={isMobile}
              />
            </ProjectModal>
          )}

          {modalState.isTaskModalOpen && (
            <TaskBoardModal
              onClose={() =>
                setModalState((prev) => ({ ...prev, isTaskModalOpen: false }))
              }
              onCreateTask={() => {
                setSelectedIds((prev) => ({ ...prev, selectedTaskId: null }));
                setFormState({
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
              onCommentClick={handleCommentClick}
            >
              <div className="min-h-full">{renderTaskBoard()}</div>
            </TaskBoardModal>
          )}

          {modalState.isCreateTaskModalOpen && (
            <TaskModal
              title={selectedIds.selectedTaskId ? "Edit Task" : "Create Task"}
              onClose={() => {
                setModalState((prev) => ({
                  ...prev,
                  isCreateTaskModalOpen: false,
                }));
                setSelectedIds((prev) => ({ ...prev, selectedTaskId: null }));
                setFormState({
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
                currentUser={user}
              />
            </TaskModal>
          )}

          {showInviteModal && (
            <InviteUserModal
              isDarkMode={isDarkMode}
              onClose={() => setShowInviteModal(false)}
              onSubmit={handleInviteUser}
              inviteUserId={inviteUserId}
              setInviteUserId={setInviteUserId}
              userId={sub}
              selectedProjectId={selectedIds.selectedProjectId} // Add this prop
            />
          )}
          {modalState.isInvitesModalOpen && (
            <InvitationsModal
              pendingInvites={pendingInvites}
              onClose={() =>
                setModalState((prev) => ({
                  ...prev,
                  isInvitesModalOpen: false,
                }))
              }
              onResponse={handleInviteResponseWrapper}
              isDarkMode={isDarkMode}
            />
          )}
          {modalState.isDeleteConfirmationOpen && (
            <DeleteConfirmationModal
              isDarkMode={isDarkMode}
              isProjectDelete={!!selectedIds.projectToDelete}
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
              onConfirm={
                selectedIds.projectToDelete
                  ? handleDeleteProject
                  : handleDeleteTask
              }
            />
          )}
          {commentsModalState.isOpen && commentsModalState.task && (
            <CommentsModal
              task={commentsModalState.task}
              onClose={() =>
                setCommentsModalState({ isOpen: false, task: null })
              }
              onAddComment={handleAddComment}
              isDarkMode={isDarkMode}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
