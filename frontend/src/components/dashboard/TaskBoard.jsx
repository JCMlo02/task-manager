import React from "react";
import EnhancedModal from "./EnhancedModal";
import { motion } from "framer-motion";
import { Draggable, Droppable } from "react-beautiful-dnd";
import { memo } from "react";
import { STATUS_DISPLAY_NAMES } from "../../constants";
import {
  FaGripVertical,
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
} from "react-icons/fa";
import { MenuItem, Menu } from "@szhsin/react-menu";
import LoadingSpinner from "./LoadingSpinner";
const statusColors = {
  BACKLOG: "bg-slate-50 border-slate-200 hover:bg-slate-50/80",
  IN_PROGRESS: "bg-blue-50 border-blue-200 hover:bg-blue-50/80",
  IN_TESTING: "bg-amber-50 border-amber-200 hover:bg-amber-50/80",
  DONE: "bg-emerald-50 border-emerald-200 hover:bg-emerald-50/80",
};

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
    customStyles="mt-32 z-50"  // Adjust margin-top and z-index here
    isDarkMode={isDarkMode}
  >
    <div className="flex flex-col h-[85vh]">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10 py-4 px-6 -mx-6 border-b border-slate-200 dark:border-slate-700">
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
        </div>
      </div>
      {children}
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
  }) => (
    <Droppable droppableId={String(status)}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`
            flex flex-col rounded-lg border
            ${statusColors[status]}
            ${snapshot.isDraggingOver ? "ring-2 ring-indigo-500" : ""}
            p-4 h-full max-h-full
          `}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span
                className={`${
                  isDarkMode ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {STATUS_ICONS[status]}
              </span>
              <h4
                className={`font-semibold ${
                  isDarkMode ? "text-slate-200" : "text-slate-700"
                }`}
              >
                {STATUS_DISPLAY_NAMES[status]}
              </h4>
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium
                ${
                  isDarkMode
                    ? "bg-slate-700 text-slate-300"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tasks.length}
              </span>
            </div>
          </div>

          <div className="overflow-y-auto flex-grow space-y-3 min-h-[100px] pr-2">
            {tasks
              .filter((task) => task && task.task_id)
              .map((task, index) => (
                <TaskCard
                  key={String(task.task_id)}
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
      )}
    </Droppable>
  )
);

// Update TaskCard component
export const TaskCard = memo(
  ({ task, index, onEdit, onDelete, isDarkMode, projectMembers }) => {
    const taskId = String(task?.task_id || "");

    if (!taskId) {
      console.error("Invalid task:", task);
      return null;
    }

    return (
      <Draggable key={taskId} draggableId={taskId} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`
              group rounded-lg border transition-all duration-200
              ${
                isDarkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-slate-200"
              }
              ${
                snapshot.isDragging
                  ? "shadow-lg ring-2 ring-indigo-500"
                  : "shadow-sm"
              }
            `}
          >
            <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div
                  {...provided.dragHandleProps}
                  className={`p-1 -ml-1 rounded opacity-0 group-hover:opacity-100 transition-opacity
                  ${isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"}`}
                >
                  <FaGripVertical
                    className={`w-4 h-4 ${
                      isDarkMode ? "text-slate-500" : "text-slate-400"
                    }`}
                  />
                </div>
                <h4
                  className={`flex-grow font-medium ${
                    isDarkMode ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  {task.name}
                </h4>
                <Menu
                  menuButton={
                    <button
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity
                    ${
                      isDarkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
                    }`}
                    >
                      <FaEllipsisV
                        className={
                          isDarkMode ? "text-slate-400" : "text-slate-600"
                        }
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

              {task.description && (
                <p
                  className={`mt-2 text-sm ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {task.description}
                </p>
              )}

              <div
                className={`mt-3 space-y-1 text-xs ${
                  isDarkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {task.creator_username && (
                  <div className="flex items-center gap-1">
                    <FaUserPlus className="w-3 h-3" />
                    <span>Created by: {task.creator_username}</span>
                  </div>
                )}
                {task.assigned_to && (
                  <div className="flex items-center gap-1">
                    <FaUser className="w-3 h-3" />
                    <span>Assigned to: {task.assignee_username}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.task?.task_id === nextProps.task?.task_id &&
      prevProps.task?.name === nextProps.task?.name &&
      prevProps.task?.description === nextProps.task?.description &&
      prevProps.task?.status === nextProps.task?.status &&
      prevProps.task?.assigned_to === nextProps.task?.assigned_to &&
      prevProps.index === nextProps.index &&
      prevProps.isDarkMode === nextProps.isDarkMode
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
