// ========================================
// List Management Hook - Loading, Refreshing, Navigation
// ========================================

import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { AppDispatch } from '../../../../application/store';
import {
  clearJustCreatedListId,
  loadShoppingLists,
  selectIsLoadingLists,
  selectJustCreatedListId,
  selectShoppingListError,
  selectShoppingLists,
} from '../../../../application/store/slices/shoppingListSlice';
import { selectUser } from '../../../../application/store/slices/authSlice';
import { shoppingLogger } from '../../../../shared/utils/logger';
import type { ShoppingList } from '../../../../shared/types/lists';

interface UseListManagementReturn {
  // Data
  shoppingLists: ShoppingList[];
  isLoading: boolean;
  error: string | null;

  // Actions
  handleRefresh: () => Promise<void>;
  handleNavigateToCreateList: () => void;
  handleViewArchivedList: (list: ShoppingList) => void;

  // Archived Modal State
  showArchivedDetailModal: boolean;
  archivedListDetail: ShoppingList | null;
  handleCloseArchivedModal: () => void;

  // Success Animation State
  showSuccessAnimation: boolean;
  setShowSuccessAnimation: (show: boolean) => void;
}

export const useListManagement = (): UseListManagementReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const user = useSelector(selectUser);

  // Redux selectors
  const shoppingLists = useSelector(selectShoppingLists);
  const isLoading = useSelector(selectIsLoadingLists);
  const error = useSelector(selectShoppingListError);
  const justCreatedListId = useSelector(selectJustCreatedListId);

  // Archived List Detail Modal state
  const [showArchivedDetailModal, setShowArchivedDetailModal] = useState(false);
  const [archivedListDetail, setArchivedListDetail] = useState<ShoppingList | null>(null);

  // List Creation Success Animation state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Load shopping lists on mount
  useEffect(() => {
    if (typeof user?.id === 'string' && user.id.length > 0) {
      shoppingLogger.debug('🛒 Enhanced Lists - Loading shopping lists for user:', user.id);
      // Load both active and archived lists - PRODUCTION SAFE
      dispatch(loadShoppingLists({ limit: 100 })).catch(loadError => {
        console.error('Failed to load shopping lists:', loadError);
      });
    }
  }, [dispatch, user?.id]);

  // Handle shopping list errors (like authentication failures)
  useEffect(() => {
    if (typeof error === 'string' && error.includes('Not authenticated')) {
      shoppingLogger.warn('🚨 Authentication error in lists - forcing logout');
      // Import and dispatch logout - PRODUCTION SAFE
      import('../../../../application/store/slices/authSlice')
        .then(({ logoutUser }) => {
          dispatch(logoutUser()).catch(logoutError => {
            console.error('Logout failed:', logoutError);
          });
        })
        .catch(importError => {
          console.error('Failed to import logout:', importError);
        });
    }
  }, [error, dispatch]);

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    if (typeof user?.id !== 'string' || user.id.length === 0) return;

    shoppingLogger.debug('🔄 Enhanced Lists - Refreshing shopping lists...');
    try {
      await dispatch(loadShoppingLists({ limit: 100 })).unwrap(); // Load all lists
    } catch (refreshError) {
      shoppingLogger.error('Failed to refresh shopping lists:', refreshError);
    }
  }, [dispatch, user?.id]);

  // Trigger success animation when a list is just created by the user
  useEffect(() => {
    if (justCreatedListId) {
      shoppingLogger.debug(
        '🎉 List just created by user! Triggering success animation...',
        justCreatedListId
      );
      setShowSuccessAnimation(true);
      // Clear the flag after triggering animation
      dispatch(clearJustCreatedListId());
    }
  }, [justCreatedListId, dispatch]);

  // Refresh lists when screen comes into focus (e.g., returning from CreateList)
  useFocusEffect(
    useCallback(() => {
      if (typeof user?.id === 'string' && user.id.length > 0) {
        // Refresh the list data without triggering animations
        dispatch(loadShoppingLists({ limit: 100 })).catch(focusError => {
          console.error('Focus refresh failed:', focusError);
        });
      }
    }, [dispatch, user?.id])
  );

  // Handle view archived list
  const handleViewArchivedList = useCallback((list: ShoppingList) => {
    shoppingLogger.debug('📦 Viewing archived list details:', list.id);
    setArchivedListDetail(list);
    setShowArchivedDetailModal(true);
  }, []);

  // Handle close archived modal
  const handleCloseArchivedModal = useCallback(() => {
    setShowArchivedDetailModal(false);
    setArchivedListDetail(null);
  }, []);

  // Handle navigate to create list
  const handleNavigateToCreateList = useCallback(() => {
    shoppingLogger.debug('🆕 Navigating to create new list...');
    (navigation as any).navigate('CreateList');
  }, [navigation]);

  return {
    // Data
    shoppingLists,
    isLoading,
    error,

    // Actions
    handleRefresh,
    handleNavigateToCreateList,
    handleViewArchivedList,

    // Archived Modal State
    showArchivedDetailModal,
    archivedListDetail,
    handleCloseArchivedModal,

    // Success Animation State
    showSuccessAnimation,
    setShowSuccessAnimation,
  };
};
