// ========================================
// Contributor Management Hook
// ========================================

import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../../application/store';
import {
  addCollaboratorToList,
  removeCollaboratorFromList,
} from '../../../../application/store/slices/shoppingListSlice';
import { selectUser } from '../../../../application/store/slices/authSlice';
import { shoppingLogger } from '../../../../shared/utils/logger';

interface UseContributorManagementReturn {
  // State
  showAddContributorModal: boolean;
  selectedListForContributor: string | null;

  // Actions
  handleAddContributor: (listId: string) => void;
  handleCloseContributorModal: () => void;
  handleAddContributorToList: (email: string) => Promise<void>;
  handleRemoveContributorFromList: (listId: string, userId: string) => Promise<void>;
}

export const useContributorManagement = (): UseContributorManagementReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector(selectUser);

  // State management
  const [showAddContributorModal, setShowAddContributorModal] = useState(false);
  const [selectedListForContributor, setSelectedListForContributor] = useState<string | null>(null);

  // Handle add contributor
  const handleAddContributor = useCallback((listId: string) => {
    setSelectedListForContributor(listId);
    setShowAddContributorModal(true);
  }, []);

  // Handle close contributor modal
  const handleCloseContributorModal = useCallback(() => {
    setShowAddContributorModal(false);
    setSelectedListForContributor(null);
  }, []);

  // Handle add contributor to list
  const handleAddContributorToList = useCallback(
    async (email: string) => {
      if (!selectedListForContributor || !currentUser?.id) {
        shoppingLogger.warn('🚨 Cannot add contributor - missing list or user');
        return;
      }

      try {
        shoppingLogger.debug('👥 Adding contributor to list...', {
          listId: selectedListForContributor,
          email,
          currentUserId: currentUser.id,
        });

        // Note: addCollaboratorToList is a reducer action, not async thunk
        // In a real implementation, this would be an API call first
        const mockCollaborator = {
          id: `temp-${Date.now()}`,
          userId: `user-${email}`,
          name: email.split('@')[0] || 'Unknown',
          email: email.trim(),
          listId: selectedListForContributor,
          role: 'editor' as const,
          permissions: ['read', 'write'],
          invitedAt: new Date().toISOString(),
        };

        dispatch(
          addCollaboratorToList({
            listId: selectedListForContributor,
            collaborator: mockCollaborator,
          })
        );

        shoppingLogger.debug('✅ Contributor added successfully:', mockCollaborator);

        // Close modal after successful addition
        handleCloseContributorModal();
      } catch (error) {
        shoppingLogger.error('❌ Failed to add contributor:', error);
        throw error; // Re-throw for component to handle
      }
    },
    [dispatch, selectedListForContributor, currentUser?.id, handleCloseContributorModal]
  );

  // Handle remove contributor from list
  const handleRemoveContributorFromList = useCallback(
    async (listId: string, userId: string) => {
      if (!currentUser?.id) {
        shoppingLogger.warn('🚨 Cannot remove contributor - user not authenticated');
        return;
      }

      try {
        shoppingLogger.debug('👥 Removing contributor from list...', {
          listId,
          userId,
          currentUserId: currentUser.id,
        });

        dispatch(
          removeCollaboratorFromList({
            listId,
            userId,
          })
        );

        shoppingLogger.debug('✅ Contributor removed successfully');
      } catch (error) {
        shoppingLogger.error('❌ Failed to remove contributor:', error);
        throw error; // Re-throw for component to handle
      }
    },
    [dispatch, currentUser?.id]
  );

  return {
    // State
    showAddContributorModal,
    selectedListForContributor,

    // Actions
    handleAddContributor,
    handleCloseContributorModal,
    handleAddContributorToList,
    handleRemoveContributorFromList,
  };
};
