import React from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import EnhancedModal from './EnhancedModal';

const InvitationsModal = ({ 
  pendingInvites, 
  onClose, 
  onResponse 
}) => (
  <EnhancedModal
    title="Project Invitations"
    onClose={onClose}
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
                onClick={() => onResponse(invite.project_id, "ACCEPTED")}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 
                          transition-colors flex-1 flex items-center justify-center gap-2"
              >
                <FaCheck /> Accept
              </button>
              <button
                onClick={() => onResponse(invite.project_id, "REJECTED")}
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

export default InvitationsModal;
