// ========================================
// Contributor Management Hook
// ========================================

import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../../../application/store';
import {
  addCollaboratorToList,
  loadShoppingList,
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

        // Create optimistic collaborator for immediate UI update
        const optimisticCollaborator = {
          id: `temp-${Date.now()}`,
          userId: email, // Use email as userId for now
          name: email.split('@')[0] || 'Unknown',
          email: email.trim(),
          listId: selectedListForContributor,
          role: 'editor' as const,
          permissions: ['read', 'write'],
          invitedAt: new Date().toISOString(),
        };

        // Optimistically update Redux state immediately
        dispatch(
          addCollaboratorToList({
            listId: selectedListForContributor,
            collaborator: optimisticCollaborator,
          })
        );

        try {
          // Import shopping list API
          const { shoppingListApi } = await import('../../../../infrastructure/api');

          // Add collaborator via API - using email as user_id since that's what the logs show
          const response = await shoppingListApi.addCollaborator(selectedListForContributor, {
            user_id: email,
            role: 'editor',
            permissions: {
              can_edit_items: true,
              can_add_items: true,
              can_delete_items: false,
              can_invite_others: false,
            },
          });

          if (!response.data) {
            // Revert optimistic update on failure
            dispatch(
              removeCollaboratorFromList({
                listId: selectedListForContributor,
                userId: email,
              })
            );
            throw new Error(response.detail ?? 'Failed to add contributor');
          }

          shoppingLogger.debug('✅ Contributor added successfully to backend:', response.data);

          // Refresh the current list to sync with server
          dispatch(loadShoppingList(selectedListForContributor)).catch(console.error);
        } catch (apiError) {
          // Revert optimistic update on API failure
          dispatch(
            removeCollaboratorFromList({
              listId: selectedListForContributor,
              userId: email,
            })
          );
          shoppingLogger.error('❌ Failed to add contributor to backend:', apiError);
          throw apiError;
        }

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

        // Optimistically update Redux state immediately
        dispatch(
          removeCollaboratorFromList({
            listId,
            userId,
          })
        );

        try {
          // Import shopping list API
          const { shoppingListApi } = await import('../../../../infrastructure/api');

          // Remove collaborator via API
          const response = await shoppingListApi.removeCollaborator(listId, userId);

          if (response.detail) {
            // Revert optimistic update on failure - would need to re-add the collaborator
            // For now, just refresh the list to sync with server
            dispatch(loadShoppingList(listId)).catch(console.error);
            throw new Error(response.detail ?? 'Failed to remove contributor');
          }

          shoppingLogger.debug('✅ Contributor removed successfully from backend');

          // Refresh the current list to sync with server
          dispatch(loadShoppingList(listId)).catch(console.error);
        } catch (apiError) {
          // Refresh list to sync with actual server state since we can't easily revert the optimistic update
          dispatch(loadShoppingList(listId)).catch(console.error);
          shoppingLogger.error('❌ Failed to remove contributor from backend:', apiError);
          throw apiError;
        }
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
