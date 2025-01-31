import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTimesCircle, FaPaperPlane } from "react-icons/fa";
import { format } from "date-fns";
import { useMediaQuery, BREAKPOINTS } from "../../../styles/responsive";

const CommentsModal = ({ task, onClose, onAddComment, isDarkMode }) => {
  const [newComment, setNewComment] = useState("");
  const [localTask, setLocalTask] = useState(task);
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md})`);

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await onAddComment(newComment.trim());
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className={`fixed inset-0 ${
          isDarkMode ? "bg-black/70" : "bg-black/50"
        } backdrop-blur-sm`}
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`
            relative w-full max-w-2xl rounded-xl shadow-2xl
            ${isDarkMode ? "bg-slate-800" : "bg-white"}
            ${isMobile ? "min-h-[calc(100vh-2rem)]" : ""}
            overflow-hidden
          `}
        >
          {/* Header */}
          <div
            className={`
            px-6 py-4 border-b flex items-center justify-between
            ${isDarkMode ? "border-slate-700" : "border-slate-200"}
          `}
          >
            <h3
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Comments - {task.name}
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700`}
            >
              <FaTimesCircle
                className={isDarkMode ? "text-gray-400" : "text-gray-600"}
              />
            </button>
          </div>

          {/* Comments List */}
          <div
            className={`
            flex-1 overflow-y-auto max-h-[60vh] p-6 space-y-4
            ${isDarkMode ? "bg-slate-800" : "bg-white"}
          `}
          >
            {localTask.comments?.length > 0 ? (
              localTask.comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`
                    p-4 rounded-lg
                    ${isDarkMode ? "bg-slate-700" : "bg-gray-50"}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {comment.user}
                    </span>
                    <span
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {format(
                        new Date(comment.timestamp),
                        "MMM d, yyyy h:mm a"
                      )}
                    </span>
                  </div>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {comment.text}
                  </p>
                </div>
              ))
            ) : (
              <p
                className={`text-center ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No comments yet
              </p>
            )}
          </div>

          {/* Comment Form */}
          <div
            className={`
            p-4 border-t
            ${
              isDarkMode
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-white"
            }
          `}
          >
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className={`
                  flex-1 px-3 py-2 rounded-lg border
                  ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  }
                  focus:outline-none focus:ring-2 focus:ring-teal-500
                `}
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className={`
                  px-4 py-2 rounded-lg font-medium flex items-center gap-2
                  ${
                    isDarkMode
                      ? "bg-teal-600 hover:bg-teal-500"
                      : "bg-teal-500 hover:bg-teal-600"
                  }
                  text-white transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <FaPaperPlane className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CommentsModal;
