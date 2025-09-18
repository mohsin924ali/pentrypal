// ========================================
// Add Contributor Modal - List Collaboration
// ========================================

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// Components
import { Typography } from '../../atoms/Typography/Typography';
import { Button } from '../../atoms/Button/Button';

// Hooks and Utils
import { useTheme } from '../../../providers/ThemeProvider';

// Redux
import type { AppDispatch } from '../../../../application/store';
import {
  loadFriends,
  selectFriends,
  selectIsLoadingFriends,
  selectSocialError,
} from '../../../../application/store/slices/socialSlice';
import { selectUser } from '../../../../application/store/slices/authSlice';

// Types
import type { Friendship } from '../../../../shared/types/social';
import type { ShoppingList } from '../../../../shared/types/lists';

// ========================================
// Types
// ========================================

export interface AddContributorModalProps {
  visible: boolean;
  onClose: () => void;
  selectedList: ShoppingList | null;
  onAddContributor: (friendId: string, friendName: string) => Promise<void>;
  onRemoveContributor: (friendId: string) => Promise<void>;
  isLoading?: boolean;
}

// ========================================
// Add Contributor Modal Component
// ========================================

export const AddContributorModal: React.FC<AddContributorModalProps> = ({
  visible,
  onClose,
  selectedList,
  onAddContributor,
  onRemoveContributor,
  isLoading = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();

  // Redux selectors
  const friendships = useSelector(selectFriends);
  const isLoadingFriends = useSelector(selectIsLoadingFriends);
  const socialError = useSelector(selectSocialError);
  const currentUser = useSelector(selectUser);

  // Local state
  const [processingFriendId, setProcessingFriendId] = useState<string | null>(null);
  const [localCollaboratorIds, setLocalCollaboratorIds] = useState<Set<string>>(new Set());
  const [isProcessingAny, setIsProcessingAny] = useState(false);

  // Use ref to prevent multiple simultaneous calls
  const isProcessingRef = useRef(false);

  // Animation
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));

  // Safe theme with comprehensive fallbacks
  const safeTheme = {
    colors: {
      primary: theme?.colors?.primary || { '500': '#22c55e' },
      text: theme?.colors?.text || {
        primary: '#000000',
        secondary: '#666666',
        tertiary: '#999999',
      },
      background: (theme?.colors as any)?.background || { primary: '#ffffff' },
      surface: theme?.colors?.surface || { background: '#ffffff', card: '#ffffff' },
      border: theme?.colors?.border || { primary: '#e5e5e5' },
      semantic: theme?.colors?.semantic || {
        error: { '500': '#ef4444' },
        success: { '500': '#22c55e' },
      },
    },
    spacing: theme?.spacing || { sm: 8, md: 16, lg: 24 },
  };

  // ========================================
  // Effects
  // ========================================

  // Load friends when modal opens
  useEffect(() => {
    if (visible && currentUser?.id) {
      console.log('🤝 Loading friends for contributor modal');
      dispatch(loadFriends());
    }
  }, [visible, currentUser?.id, dispatch]);

  // Initialize local collaborator state when selected list changes
  useEffect(() => {
    if (selectedList?.collaborators) {
      const collaboratorIds = new Set(selectedList.collaborators.map(c => c.userId));
      setLocalCollaboratorIds(collaboratorIds);
    } else {
      setLocalCollaboratorIds(new Set());
    }
  }, [selectedList?.collaborators]);

  // Handle modal animations
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  // ========================================
  // Helper Functions
  // ========================================

  // Get friend user from friendship
  const getFriendUser = useCallback(
    (friendship: Friendship) => {
      if (!currentUser?.id) return null;

      // Determine which user is the friend (not the current user)
      const isCurrentUserUser1 = friendship.user1Id === currentUser.id;
      return isCurrentUserUser1 ? friendship.user2 : friendship.user1;
    },
    [currentUser?.id]
  );

  // Check if friend is already a contributor (using local state for immediate updates)
  const isFriendContributor = useCallback(
    (friendId: string) => {
      return localCollaboratorIds.has(friendId);
    },
    [localCollaboratorIds]
  );

  // ========================================
  // Event Handlers
  // ========================================

  const handleClose = useCallback(() => {
    if (isLoading || processingFriendId) return;
    onClose();
  }, [isLoading, processingFriendId, onClose]);

  const handleFriendAction = useCallback(
    async (friendship: Friendship) => {
      // IMMEDIATE blocking using ref - prevents any race conditions
      if (isProcessingRef.current) {
        console.log('⚠️ BLOCKED: Operation already in progress (ref check)');
        return;
      }

      const friendUser = getFriendUser(friendship);
      if (!friendUser || !selectedList) return;

      const isContributor = isFriendContributor(friendUser.id);

      // Additional state-based checks
      if (processingFriendId === friendUser.id || isProcessingAny) {
        console.log('⚠️ BLOCKED: Operation already in progress (state check)');
        return;
      }

      // Set ref immediately to block any other calls
      isProcessingRef.current = true;
      setProcessingFriendId(friendUser.id);
      setIsProcessingAny(true);

      console.log(
        `🚀 Starting ${isContributor ? 'REMOVE' : 'ADD'} operation for:`,
        friendUser.name
      );

      try {
        if (isContributor) {
          await onRemoveContributor(friendUser.id);
          console.log('✅ Contributor removed:', friendUser.name);

          // Update local state immediately
          setLocalCollaboratorIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(friendUser.id);
            return newSet;
          });
        } else {
          await onAddContributor(friendUser.id, friendUser.name);
          console.log('✅ Contributor added:', friendUser.name);

          // Update local state immediately
          setLocalCollaboratorIds(prev => {
            const newSet = new Set(prev);
            newSet.add(friendUser.id);
            return newSet;
          });
        }
      } catch (error: any) {
        console.error('❌ Failed to update contributor:', error);
        Alert.alert(
          'Error',
          `Failed to ${isContributor ? 'remove' : 'add'} contributor. Please try again.`,
          [{ text: 'OK' }]
        );
      } finally {
        // Reset all processing states
        isProcessingRef.current = false;
        setProcessingFriendId(null);
        setIsProcessingAny(false);
        console.log('🔄 Processing states reset');
      }
    },
    [
      getFriendUser,
      selectedList,
      isFriendContributor,
      onAddContributor,
      onRemoveContributor,
      processingFriendId,
      isProcessingAny,
    ]
  );

  // ========================================
  // Render Functions
  // ========================================

  const renderFriendItem = useCallback(
    (friendship: Friendship) => {
      const friendUser = getFriendUser(friendship);
      if (!friendUser) return null;

      const isContributor = isFriendContributor(friendUser.id);
      const isProcessing = processingFriendId === friendUser.id;

      return (
        <View
          key={friendship.id}
          style={[
            styles.friendItem,
            {
              backgroundColor: safeTheme.colors.surface.card || '#ffffff',
              borderColor: safeTheme.colors.border.primary || '#e5e5e5',
            },
          ]}>
          <View style={styles.friendInfo}>
            {/* Avatar */}
            <View
              style={[
                styles.friendAvatar,
                { backgroundColor: safeTheme.colors.primary['500'] || '#22c55e' },
              ]}>
              {friendUser.avatar ? (
                <Image
                  source={{
                    uri: friendUser.avatar.replace(
                      'http://localhost:8000',
                      'https://pantrypalbe-production.up.railway.app'
                    ),
                  }}
                  style={styles.friendAvatarImage as any}
                  resizeMode='cover'
                />
              ) : (
                <Typography variant='h6' style={{ color: '#ffffff' }}>
                  {friendUser.name?.charAt(0)?.toUpperCase() || '?'}
                </Typography>
              )}
            </View>

            {/* Friend Details */}
            <View style={styles.friendDetails}>
              <Typography
                variant='h6'
                color={safeTheme.colors.text.primary || '#000000'}
                style={styles.friendName}>
                {friendUser.name || 'Unknown Friend'}
              </Typography>
              <Typography
                variant='body2'
                color={safeTheme.colors.text.secondary || '#666666'}
                style={styles.friendContact}>
                {friendUser.email || friendUser.phone || 'No contact info'}
              </Typography>
              {isContributor && (
                <Typography
                  variant='caption'
                  color={safeTheme.colors.semantic.success['500'] || '#22c55e'}
                  style={styles.contributorBadge}>
                  ✓ Contributor
                </Typography>
              )}
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={() => handleFriendAction(friendship)}
            disabled={isProcessing || isLoading || !!processingFriendId || isProcessingAny}
            style={[
              styles.actionButton,
              isContributor
                ? { backgroundColor: safeTheme.colors.semantic.error['500'] || '#ef4444' }
                : { backgroundColor: safeTheme.colors.primary['500'] || '#22c55e' },
              (isProcessing || isLoading || !!processingFriendId || isProcessingAny) &&
                styles.disabledButton,
            ]}>
            <Typography variant='caption' style={[styles.actionButtonText, { color: '#ffffff' }]}>
              {isProcessing || isProcessingAny ? '...' : isContributor ? 'Remove' : 'Add'}
            </Typography>
          </TouchableOpacity>
        </View>
      );
    },
    [
      getFriendUser,
      isFriendContributor,
      processingFriendId,
      isLoading,
      isProcessingAny,
      safeTheme,
      handleFriendAction,
    ]
  );

  const renderContent = () => {
    if (isLoadingFriends) {
      return (
        <View style={styles.loadingContainer}>
          <Typography
            variant='body1'
            color={safeTheme.colors.text.secondary || '#666666'}
            style={styles.loadingText}>
            Loading your friends...
          </Typography>
        </View>
      );
    }

    if (socialError) {
      return (
        <View style={styles.errorContainer}>
          <Typography
            variant='body1'
            color={safeTheme.colors.semantic.error['500'] || '#ef4444'}
            style={styles.errorText}>
            Failed to load friends. Please try again.
          </Typography>
          <Button
            title='Retry'
            variant='outline'
            size='sm'
            onPress={() => dispatch(loadFriends())}
            style={styles.retryButton}
          />
        </View>
      );
    }

    if (!friendships || friendships.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Typography
            variant='h5'
            color={safeTheme.colors.text.secondary || '#666666'}
            style={styles.emptyIcon}>
            👥
          </Typography>
          <Typography
            variant='h6'
            color={safeTheme.colors.text.secondary || '#666666'}
            style={styles.emptyTitle}>
            No Friends Yet
          </Typography>
          <Typography
            variant='body2'
            color={safeTheme.colors.text.tertiary || '#999999'}
            style={styles.emptySubtitle}>
            Add friends first to collaborate on lists
          </Typography>
        </View>
      );
    }

    return (
      <ScrollView style={styles.friendsList} showsVerticalScrollIndicator={false}>
        {friendships.map(renderFriendItem)}
      </ScrollView>
    );
  };

  // ========================================
  // Main Render
  // ========================================

  return (
    <Modal
      visible={visible}
      animationType='none'
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      {/* Modal Container */}
      <Animated.View
        style={
          [
            styles.modalContainer,
            {
              backgroundColor: safeTheme.colors.background.primary || '#ffffff',
              transform: [{ translateY: slideAnim }],
            },
          ] as any
        }>
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: safeTheme.colors.border.primary || '#e5e5e5' },
          ]}>
          <View style={styles.headerContent}>
            <Typography
              variant='h4'
              color={safeTheme.colors.text.primary || '#000000'}
              style={styles.headerTitle}>
              Add Contributor
            </Typography>
            {selectedList && (
              <Typography
                variant='body2'
                color={safeTheme.colors.text.secondary || '#666666'}
                style={styles.headerSubtitle}>
                {selectedList.name}
              </Typography>
            )}
          </View>

          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            disabled={isLoading || !!processingFriendId}>
            <Typography variant='h5' color={safeTheme.colors.text.secondary || '#666666'}>
              ✕
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>{renderContent()}</View>
      </Animated.View>
    </Modal>
  );
};

// ========================================
// Styles
// ========================================

const styles = {
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontStyle: 'italic' as const,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 48,
  },
  loadingText: {
    textAlign: 'center' as const,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 48,
  },
  errorText: {
    textAlign: 'center' as const,
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: '600' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  emptySubtitle: {
    textAlign: 'center' as const,
    paddingHorizontal: 32,
  },
  friendsList: {
    flex: 1,
    paddingTop: 16,
  },
  friendItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  friendInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 16,
    overflow: 'hidden' as const,
  },
  friendAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  friendContact: {
    marginBottom: 4,
  },
  contributorBadge: {
    fontWeight: '600' as const,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  disabledButton: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontWeight: '600' as const,
    fontSize: 12,
  },
};
