import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";
import { FaSearch, FaUserPlus, FaSpinner } from "react-icons/fa";
import { userService } from "../../../services/apiService";

const InviteUserModal = ({
  isDarkMode,
  onClose,
  onSubmit,
  inviteUserId,
  setInviteUserId,
  userId,
  selectedProjectId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query) => {
        if (!query.trim()) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        setIsSearching(true);
        try {
          const data = await userService.searchUsers(query, userId);
          setSearchResults(data);
        } catch (err) {
          toast.error("Error searching users");
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      }, 300),
    [userId]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!inviteUserId) {
        toast.error("Please select a user to invite");
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(selectedProjectId, inviteUserId);
        toast.success("Invitation sent successfully");
        onClose();
      } catch (error) {
        console.error("Invitation error:", error);
        toast.error(error.message || "Failed to send invitation");
      } finally {
        setIsSubmitting(false);
      }
    },
    [inviteUserId, selectedProjectId, onSubmit, onClose]
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className={`fixed inset-0 ${
          isDarkMode ? "bg-black/70" : "bg-black/50"
        } backdrop-blur-sm`}
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`
            relative w-full max-w-md rounded-xl shadow-2xl
            ${isDarkMode ? "bg-gray-900" : "bg-white"}
            overflow-hidden
          `}
        >
          <div
            className={`
            px-6 py-4 border-b flex items-center justify-between
            ${isDarkMode ? "border-gray-700" : "border-gray-200"}
          `}
          >
            <h3
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Invite User
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <div className="relative">
                  <FaSearch
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      debouncedSearch(e.target.value);
                    }}
                    placeholder="Search users..."
                    className={`
                      w-full pl-10 pr-4 py-2 rounded-lg border
                      ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                      }
                      focus:outline-none focus:ring-2 focus:ring-teal-500
                    `}
                  />
                  {isSearching && (
                    <FaSpinner className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" />
                  )}
                </div>

                <div
                  className={`
                  mt-2 max-h-48 overflow-y-auto rounded-lg border
                  ${isDarkMode ? "border-gray-700" : "border-gray-200"}
                `}
                >
                  {searchResults.map((user) => (
                    <div
                      key={user.user_id}
                      onClick={() => setInviteUserId(user.user_id)}
                      className={`
                        p-3 cursor-pointer flex items-center gap-3
                        ${
                          inviteUserId === user.user_id
                            ? isDarkMode
                              ? "bg-teal-600"
                              : "bg-teal-50"
                            : isDarkMode
                            ? "hover:bg-gray-800"
                            : "hover:bg-gray-50"
                        }
                        ${isDarkMode ? "text-white" : "text-gray-900"}
                        transition-colors
                      `}
                    >
                      <FaUserPlus
                        className={
                          inviteUserId === user.user_id
                            ? "text-white"
                            : "text-gray-400"
                        }
                      />
                      <span>{user.username}</span>
                    </div>
                  ))}
                  {searchQuery &&
                    !isSearching &&
                    searchResults.length === 0 && (
                      <div
                        className={`p-3 text-center ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        No users found
                      </div>
                    )}
                </div>
              </div>

              {inviteUserId && (
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className={`
                      px-4 py-2 rounded-lg
                      ${
                        isDarkMode
                          ? "bg-gray-800 hover:bg-gray-700 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      }
                    `}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
                      px-4 py-2 rounded-lg bg-teal-500 text-white
                      hover:bg-teal-600 disabled:opacity-50
                      flex items-center gap-2
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <FaUserPlus />
                        <span>Send Invitation</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(InviteUserModal);
