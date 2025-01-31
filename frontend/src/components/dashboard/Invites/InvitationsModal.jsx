import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { FaCheck, FaTimes } from "react-icons/fa";

const InvitationsModal = ({ pendingInvites, onClose, onResponse, isDarkMode }) => {
  const [processingInvites, setProcessingInvites] = useState({});

  const handleResponse = useCallback(
    async (projectId, response) => {
      setProcessingInvites(prev => ({ ...prev, [projectId]: true }));
      
      try {
        await onResponse(projectId, response);
        const remainingInvites = pendingInvites.filter(
          invite => invite.project_id !== projectId
        );
        if (remainingInvites.length === 0) {
          onClose();
        }
      } catch (error) {
        console.error("Error handling invite response:", error);
      } finally {
        setProcessingInvites(prev => ({ ...prev, [projectId]: false }));
      }
    },
    [onResponse, pendingInvites, onClose]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        } rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto`}
      >
        <h2 className="text-xl font-bold mb-4">Pending Invitations</h2>

        {pendingInvites.length === 0 ? (
          <p className="text-gray-500">No pending invitations</p>
        ) : (
          <div className="space-y-4">
            {pendingInvites.map((invite) => (
              <div
                key={invite.project_id}
                className={`${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                } p-4 rounded-lg`}
              >
                <p className="mb-2">
                  Project:{" "}
                  <span className="font-semibold">{invite.project_name}</span>
                </p>
                <p className="mb-3">
                  From:{" "}
                  <span className="font-semibold">{invite.inviter_username}</span>
                </p>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleResponse(invite.project_id, "ACCEPTED")}
                    disabled={processingInvites[invite.project_id]}
                    className={`p-2 bg-green-500 text-white rounded-lg 
                      hover:bg-green-600 transition-colors
                      ${processingInvites[invite.project_id] ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={() => handleResponse(invite.project_id, "REJECTED")}
                    disabled={processingInvites[invite.project_id]}
                    className={`p-2 bg-red-500 text-white rounded-lg 
                      hover:bg-red-600 transition-colors
                      ${processingInvites[invite.project_id] ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className={`mt-4 px-4 py-2 rounded-lg w-full ${
            isDarkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-200 hover:bg-gray-300"
          } transition-colors`}
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default InvitationsModal;
