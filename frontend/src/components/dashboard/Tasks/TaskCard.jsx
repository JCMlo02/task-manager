import React from "react";
import { FaEdit, FaTrashAlt, FaComments } from "react-icons/fa";
import { TASK_PRIORITIES } from "../../../constants";

const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onCommentClick,
  isDarkMode,
  snapshot, 
  currentUser,
}) => {
  const getPriorityBadge = (priority) => {
    const priorityData = TASK_PRIORITIES[priority] || TASK_PRIORITIES.MEDIUM;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${priorityData.color} text-white`}
      >
        {priorityData.icon} {priorityData.label}
      </span>
    );
  };

  return (
    <div
      className={`
        group p-4 rounded-lg
        ${
          isDarkMode
            ? "bg-slate-800 border border-slate-700"
            : "bg-white border border-emerald-200 hover:bg-emerald-50/50"
        }
        ${
          snapshot?.isDragging
            ? "shadow-2xl ring-2 ring-emerald-400 rotate-[2deg] cursor-grabbing"
            : "shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing"
        }
        ${snapshot?.isDragging ? "opacity-90" : "opacity-100"}
        transform-gpu
        touch-none
        transition-all duration-200
      `}
      style={{
        width: snapshot?.isDragging ? "300px" : "auto",
      }}
    >
      <div className="space-y-3">
        {/* Header with title and actions */}
        <div className="flex justify-between items-start gap-2">
          <h3
            className={`font-medium ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {task.name}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCommentClick(task);
              }}
              className={`p-1 rounded hover:bg-emerald-100/50 relative ${
                isDarkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 hover:text-emerald-700"
              }`}
              title="Comments"
            >
              <FaComments className="w-4 h-4" />
              {task.comments?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                  {task.comments.length}
                </span>
              )}
            </button>
            <button
              onClick={() => onEdit(task)}
              className={`p-1 rounded hover:bg-gray-100 ${
                isDarkMode
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task.task_id)}
              className={`p-1 rounded hover:bg-red-100 ${
                isDarkMode
                  ? "text-red-400 hover:text-red-300"
                  : "text-red-600 hover:text-red-700"
              }`}
            >
              <FaTrashAlt className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center gap-2">
          {getPriorityBadge(task.priority)}
          {task.comments?.length > 0 && (
            <span
              className={`
              text-xs px-2 py-0.5 rounded-full
              ${
                isDarkMode
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-100 text-slate-600"
              }
            `}
            >
              {task.comments.length} comments
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div
          className={`
          pt-2 mt-2 border-t flex justify-between items-center text-xs
          ${isDarkMode ? "border-slate-700" : "border-slate-200"}
        `}
        >
          <div className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
            {task.assignee_username
              ? `Assigned to ${task.assignee_username}`
              : "Unassigned"}
          </div>
          <div className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
            {task.creator_username
              ? `Created by ${task.creator_username}`
              : `Created by ${currentUser["cognito:username"]}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export { TaskCard };
export default TaskCard;
