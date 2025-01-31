import { useState } from 'react';

export const useModalState = () => {
  const [modalState, setModalState] = useState({
    isProjectModalOpen: false,
    isTaskModalOpen: false,
    isCreateTaskModalOpen: false,
    isDeleteConfirmationOpen: false,
    isInvitesModalOpen: false,
  });

  return {
    modalState,
    setModalState,
  };
};
