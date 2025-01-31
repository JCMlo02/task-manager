import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { FaPlusCircle, FaTimesCircle } from "react-icons/fa";
import {
  STATUS_DISPLAY_NAMES,
  TASK_COLORS,
  STATUS_ICONS,
} from "../../../constants";
import { CreateButton } from "../../common/Button";
import LoadingSpinner from "../../common/LoadingSpinner";
import TaskCard from "./TaskCard";
import { useMemo } from "react";

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

export const TaskBoardModal = ({
  children,
  onClose,
  onCreateTask,
  isDarkMode,
  project,
  onCommentClick,
}) => (
  <div className="fixed inset-0 z-50 overflow-hidden">
    {" "}
    <div
      className={`absolute inset-0 ${
        isDarkMode ? "bg-black/70" : "bg-black/50"
      } backdrop-blur-sm`}
      onClick={onClose}
    />
    <div
      className={`
        relative w-full h-full
        ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}
      `}
    >
      {/* Header */}
      <div
        className={`
          flex items-center justify-between px-6 py-4
          sticky top-0 z-[60]
          ${isDarkMode ? "bg-slate-900/95" : "bg-indigo-50"}
          border-b ${isDarkMode ? "border-slate-700/50" : "border-indigo-100"}
          backdrop-blur-md
        `}
      >
        <div className="flex-1">
          <h2
            className={`text-xl font-bold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {project?.name}
          </h2>
          <p
            className={`text-sm mt-0.5 ${
              isDarkMode ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {project?.description}
          </p>
        </div>

        <div className="flex items-center gap-3 ml-4">
          <CreateButton
            onClick={onCreateTask}
            label="New"
            icon={<FaPlusCircle className="w-4 h-4" />}
            isDarkMode={isDarkMode}
          />
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg hover:bg-slate-700/10
              ${
                isDarkMode
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }
              transition-colors
            `}
          >
            <FaTimesCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Board Content */}
      <div className="h-[calc(100vh-5rem)] overflow-x-auto">
        <div className="min-w-full p-6">
          <div className="max-w-[1920px] mx-auto">
            {React.cloneElement(children, { onCommentClick })}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const TaskColumn = ({
  status,
  tasks,
  onEditTask,
  onDelete,
  onCommentClick,
  isDarkMode,
  currentUser,
  isDraggingOver,
  droppableRef,
  droppableProps,
  children,
}) => {
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => task && task.status === status) || [];
  }, [tasks, status]);

  const StatusIcon = STATUS_ICONS[status];

  return (
    <div
      ref={droppableRef}
      {...droppableProps}
      className={`
        p-4 rounded-lg
        flex flex-col
        w-full
        overflow-hidden
        ${
          isDarkMode
            ? "bg-slate-800 border border-slate-700"
            : "bg-slate-100 border border-slate-200"
        }
        shadow-md
        ${isDraggingOver ? "ring-2 ring-teal-400 shadow-lg scale-[1.02]" : ""}
        transition-all duration-75 ease-in-out
        hover:ring-2 
        ${isDarkMode ? "hover:ring-teal-500/30" : "hover:ring-teal-500/30"} 
      `}
      style={{
        minHeight: "150px",
        height: "100%",
        maxHeight: "calc(100vh - 12rem)",
      }}
      data-droppable-id={status}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-inherit z-10 pb-2">
        <div className="flex items-center gap-2">
          {StatusIcon && (
            <StatusIcon
              className={`w-5 h-5 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            />
          )}
          <h3
            className={`font-semibold ${
              isDarkMode ? "text-gray-200" : "text-gray-700"
            }`}
          >
            {STATUS_DISPLAY_NAMES[status]}
          </h3>
          <span
            className={`ml-2 px-2 py-1 rounded-full text-xs 
              ${
                isDarkMode ? "bg-gray-700 text-gray-300" : TASK_COLORS[status]
              }`}
          >
            {filteredTasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 -mr-2 relative">
        <div className="space-y-3 min-h-full">
          {filteredTasks.map((task, index) => (
            <Draggable
              key={task.task_id}
              draggableId={String(task.task_id)}
              index={index}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...provided.draggableProps.style,
                    position: snapshot.isDragging ? "fixed" : "relative",
                    zIndex: snapshot.isDragging ? 9999 : "auto",
                    left: snapshot.isDragging
                      ? provided.draggableProps.style.left
                      : "auto",
                    top: snapshot.isDragging
                      ? provided.draggableProps.style.top
                      : "auto",
                  }}
                >
                  <TaskCard
                    task={task}
                    onEdit={onEditTask}
                    onDelete={onDelete}
                    onCommentClick={onCommentClick}
                    isDarkMode={isDarkMode}
                    snapshot={snapshot}
                    currentUser={currentUser}
                  />
                </div>
              )}
            </Draggable>
          ))}
          {isDraggingOver && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(59, 130, 246, 0.1)"
                  : "rgba(59, 130, 246, 0.08)",
                borderRadius: "0.5rem",
              }}
            />
          )}
          <div className="min-h-[100px]">{children}</div>
        </div>
      </div>
    </div>
  );
};
