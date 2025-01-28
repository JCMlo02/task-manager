import React from "react";
import EnhancedModal from "./EnhancedModal";
import { motion } from "framer-motion";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { memo } from "react";
import { STATUS_DISPLAY_NAMES } from "../../constants";
import {
  FaEllipsisV,
  FaEdit,
  FaTrashAlt,
  FaUserPlus,
  FaUser,
  FaPlusCircle,
  FaListUl,
  FaRegClock,
  FaFlask,
  FaCheckDouble,
  FaTimesCircle,
} from "react-icons/fa";
import { MenuItem, Menu } from "@szhsin/react-menu";
import LoadingSpinner from "./LoadingSpinner";

const STATUS_ICONS = {
  BACKLOG: <FaListUl className="w-4 h-4" />,
  IN_PROGRESS: <FaRegClock className="w-4 h-4" />,
  IN_TESTING: <FaFlask className="w-4 h-4" />,
  DONE: <FaCheckDouble className="w-4 h-4" />,
};

export const TaskBoardModal = ({
  onClose,
  onCreateTask,
  isDarkMode,
  children,
  project,
}) => (
  <EnhancedModal
    title={null}
    onClose={onClose}
    maxWidth="max-w-[90vw]"
    customStyles={`mt-16 z-50 ${
      isDarkMode ? "bg-slate-900/95" : "bg-white/95"
    }`}
    isDarkMode={isDarkMode}
  >
    <div className="flex flex-col h-[85vh]">
      <div
        className={`
        flex justify-between items-center sticky top-0 backdrop-blur-sm z-10 px-6 pb-6 
        ${
          isDarkMode
            ? "bg-slate-900/95 border-slate-700"
            : "bg-white/95 border-slate-200"
        }
        border-b
      `}
      >
        <div>
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-slate-200" : "text-slate-700"
            }`}
          >
            {project?.name}
          </h2>
          <p
            className={`mt-1 text-sm ${
              isDarkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {project?.description}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`text-sm ${
              isDarkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {project?.members?.length || 0} team members
          </div>
          <CreateButton
            onClick={onCreateTask}
            label="New Task"
            icon={<FaPlusCircle />}
            isDarkMode={isDarkMode}
          />
          <button 
            onClick={onClose}
            className={`rounded-lg p-2 transition-colors duration-200
              ${isDarkMode 
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
          >
            <FaTimesCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className={`flex-1 overflow-auto p-6 ${isDarkMode ? "bg-slate-900" : "bg-white"}`}>
        {children}
      </div>
    </div>
  </EnhancedModal>
);

export const CreateButton = ({ onClick, label, icon, isDarkMode }) => (
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

export const TaskColumn = memo(
  ({
    status,
    tasks = [],
    onEditTask,
    onDeleteTask,
    isDarkMode,
    projectMembers,
  }) => {
    const theme = isDarkMode ? taskColors.dark : taskColors.light;

    return (
      <Droppable droppableId={String(status)}>
        {(provided, snapshot) => (
          <motion.div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`
            flex flex-col rounded-xl border backdrop-blur-sm h-full
            ${theme.column[status]}
            ${snapshot.isDraggingOver ? theme.dragOverlay : ""}
            transition-all duration-200
          `}
            {...columnAnimations}
          >
            <div className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`
                px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2
                ${theme.label[status]}
              `}
                >
                  {STATUS_ICONS[status]}
                  <span>{STATUS_DISPLAY_NAMES[status]}</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-opacity-20 backdrop-blur-sm">
                    {tasks.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                {tasks.map((task, index) => (
                  <TaskCard
                    key={task.task_id}
                    task={task}
                    index={index}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    isDarkMode={isDarkMode}
                    projectMembers={projectMembers}
                  />
                ))}
                {provided.placeholder}
              </div>
            </div>
          </motion.div>
        )}
      </Droppable>
    );
  }
);

export const TaskCard = memo(
  ({ task, index, onEdit, onDelete, isDarkMode, projectMembers }) => {
    const theme = isDarkMode ? taskColors.dark : taskColors.light;

    return (
      <Draggable draggableId={String(task.task_id)} index={index}>
        {(provided, snapshot) => (
          <motion.div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`
            group rounded-lg border p-3
            ${theme.card}
            ${snapshot.isDragging ? theme.dragOverlay : ""}
            transition-all duration-200
          `}
            {...cardAnimations}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-grow">
                <h4
                  className={`font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {task.name}
                </h4>
                {task.description && (
                  <p
                    className={`mt-1 text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {task.description}
                  </p>
                )}
              </div>

              <Menu
                menuButton={
                  <button
                    className={`
                  p-1.5 rounded-lg opacity-0 group-hover:opacity-100
                  ${isDarkMode ? "hover:bg-slate-600" : "hover:bg-gray-100"}
                  transition-all duration-200
                `}
                  >
                    <FaEllipsisV
                      className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                    />
                  </button>
                }
                transition
              >
                <MenuItem onClick={() => onEdit(task)}>
                  <FaEdit className="mr-2" /> Edit
                </MenuItem>
                <MenuItem onClick={() => onDelete(task.task_id)}>
                  <FaTrashAlt className="mr-2" /> Delete
                </MenuItem>
              </Menu>
            </div>

            <div
              className={`mt-3 flex items-center gap-3 text-xs ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {task.creator_username && (
                <div className="flex items-center gap-1">
                  <FaUserPlus className="w-3 h-3" />
                  <span>{task.creator_username}</span>
                </div>
              )}
              {task.assigned_to && (
                <div className="flex items-center gap-1">
                  <FaUser className="w-3 h-3" />
                  <span>{task.assignee_username}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </Draggable>
    );
  }
);

TaskColumn.displayName = "TaskColumn";
TaskCard.displayName = "TaskCard";

export const LoadingOverlay = ({ isDarkMode }) => (
  <div
    className={`
      fixed inset-0 flex items-center justify-center z-50
      ${isDarkMode ? "bg-slate-900/80" : "bg-white/80"} backdrop-blur-sm
    `}
  >
    <LoadingSpinner />
  </div>
);
const taskColors = {
  light: {
    column: {
      BACKLOG: "bg-white border-slate-200 shadow-sm",
      IN_PROGRESS: "bg-white border-blue-200 shadow-sm",
      IN_TESTING: "bg-white border-amber-200 shadow-sm",
      DONE: "bg-white border-emerald-200 shadow-sm",
    },
    label: {
      BACKLOG: "bg-slate-100 text-slate-700",
      IN_PROGRESS: "bg-blue-100 text-blue-700",
      IN_TESTING: "bg-amber-100 text-amber-700",
      DONE: "bg-emerald-100 text-emerald-700",
    },
    card: "bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow",
    dragOverlay: "ring-2 ring-indigo-500",
  },
  dark: {
    column: {
      BACKLOG: "bg-slate-800/50 border-slate-700 shadow-md backdrop-blur-sm",
      IN_PROGRESS: "bg-slate-800/50 border-blue-800 shadow-md backdrop-blur-sm",
      IN_TESTING: "bg-slate-800/50 border-amber-800 shadow-md backdrop-blur-sm",
      DONE: "bg-slate-800/50 border-emerald-800 shadow-md backdrop-blur-sm",
    },
    label: {
      BACKLOG: "bg-slate-700/50 text-slate-200",
      IN_PROGRESS: "bg-blue-900/50 text-blue-200",
      IN_TESTING: "bg-amber-900/50 text-amber-200",
      DONE: "bg-emerald-900/50 text-emerald-200",
    },
    card: "bg-slate-700/50 border-slate-600 hover:border-slate-500 shadow-md hover:shadow-lg backdrop-blur-sm",
    dragOverlay: "ring-2 ring-indigo-400",
  },
};

const columnAnimations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2 },
};

const cardAnimations = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.1 },
};
