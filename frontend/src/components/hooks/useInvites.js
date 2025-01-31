import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { inviteService } from "../../services/apiService";
import { useDataLoading } from './useDataLoading';

export const useInvites = (userId, onInviteHandled) => {
  const [pendingInvites, setPendingInvites] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");
  
  const { load } = useDataLoading();

  const fetchPendingInvites = useCallback(async () => {
    try {
      const invites = await load(
        () => inviteService.getPendingInvites(userId),
        {
          useCache: false
        }
      );
      setPendingInvites(invites);
    } catch (error) {
      console.error('Failed to fetch invites:', error);
      toast.error('Failed to fetch invitations');
    }
  }, [userId, load]);

  const handleInviteUser = useCallback(
    async (projectId, inviteeId) => {
      try {
        await inviteService.sendInvite(projectId, inviteeId, userId);
        setShowInviteModal(false);
        setInviteUserId("");
        toast.success("Invitation sent successfully");
      } catch (error) {
        console.error("Error inviting user:", error);
        toast.error(error.message || "Failed to send invitation");
        throw error;
      }
    },
    [userId]
  );

  const handleInviteResponse = useCallback(
    async (projectId, response) => {
      try {
        await inviteService.respondToInvite(projectId, response, userId);
        setPendingInvites((prev) =>
          prev.filter((invite) => invite.project_id !== projectId)
        );
        if (onInviteHandled) {
          await onInviteHandled();
        }
        return true;
      } catch (error) {
        console.error("Error handling invite response:", error);
        toast.error(error.message || "Failed to handle invitation");
        throw error;
      }
    },
    [userId, onInviteHandled]
  );

  return {
    pendingInvites,
    showInviteModal,
    setShowInviteModal,
    inviteUserId,
    setInviteUserId,
    handleInviteUser,
    handleInviteResponse,
    fetchPendingInvites,
  };
};
