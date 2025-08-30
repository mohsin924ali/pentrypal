// ========================================
// Add Friend Modal - Comprehensive Friend Management
// ========================================

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

// Components
import { Typography } from '../../atoms/Typography/Typography';
import { Button } from '../../atoms/Button/Button';

// Hooks and Utils
import { useTheme } from '../../../providers/ThemeProvider';

// Redux
import {
  clearError,
  clearSearchResults,
  resetSendingState,
  searchUsers,
  selectIsSearching,
  selectIsSendingRequest,
  selectSearchResults,
  selectSocialError,
  sendFriendRequest,
} from '../../../../application/store/slices/socialSlice';
import type { AppDispatch } from '../../../../application/store';

// Types
import type { AddFriendModalProps, FriendSearchResult } from '../../../../shared/types/social';

const { width: screenWidth } = Dimensions.get('window');

// ========================================
// Add Friend Modal Component
// ========================================

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  visible,
  onClose,
  onSendRequest,
  isLoading = false,
  error = null,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();

  // Redux state
  const searchResults = useSelector(selectSearchResults);
  const isSearching = useSelector(selectIsSearching);
  const isSendingRequest = useSelector(selectIsSendingRequest);
  const socialError = useSelector(selectSocialError);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('🔍 AddFriendModal state:', {
      searchQuery,
      isSearching,
      searchResultsCount: searchResults.length,
      searchResults: searchResults.map(r => (r as any).name),
      socialError,
    });
  }, [searchQuery, isSearching, searchResults, socialError]);
  const [selectedUser, setSelectedUser] = useState<FriendSearchResult | null>(null);
  const [message, setMessage] = useState('');
  const [showMessageInput, setShowMessageInput] = useState(false);

  // Animation
  const [slideAnim] = useState(new Animated.Value(screenWidth));
  const [fadeAnim] = useState(new Animated.Value(0));

  // Safe theme with fallbacks
  const safeTheme = theme?.colors
    ? theme
    : {
        colors: {
          primary: { '500': '#22c55e' },
          text: { primary: '#000000', secondary: '#666666', tertiary: '#999999' },
          background: { primary: '#ffffff' },
          surface: { background: '#ffffff', secondary: '#f5f5f5' },
          border: { primary: '#e5e5e5' },
          semantic: { error: { '500': '#ef4444' } },
        },
      };

  // ========================================
  // Effects
  // ========================================

  useEffect(() => {
    if (visible) {
      // Reset any stuck sending state when modal opens
      dispatch(resetSendingState());

      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Reset state when modal closes
      setSearchQuery('');
      setSelectedUser(null);
      setMessage('');
      setShowMessageInput(false);
      dispatch(clearSearchResults());
      dispatch(clearError());
      dispatch(resetSendingState());

      // Reset animations
      slideAnim.setValue(screenWidth);
      fadeAnim.setValue(0);
    }
  }, [visible, slideAnim, fadeAnim, dispatch]);

  // Search with debounce
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timeoutId = setTimeout(() => {
        dispatch(
          searchUsers({
            filters: {
              query: searchQuery,
              limit: 20,
            },
          })
        );
      }, 500);

      return () => clearTimeout(timeoutId);
    }

    if (searchQuery.length === 0) {
      dispatch(clearSearchResults());
    }

    return; // Explicit return for all other paths
  }, [searchQuery, dispatch]);

  // ========================================
  // Handlers
  // ========================================

  const handleClose = useCallback(() => {
    if (isSendingRequest) return; // Prevent closing while sending request

    // Animate out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [slideAnim, fadeAnim, onClose, isSendingRequest]);

  const handleSelectUser = useCallback((result: FriendSearchResult) => {
    if (result.canSendRequest) {
      setSelectedUser(result);
      setShowMessageInput(true);
    }
  }, []);

  const handleSendRequest = useCallback(async () => {
    if (!selectedUser) return;

    try {
      const request = {
        toUserId: selectedUser.user.id,
        message: message.trim() || undefined,
      } as any;

      // Use Redux action
      const resultAction = await dispatch(sendFriendRequest(request));

      if (sendFriendRequest.fulfilled.match(resultAction)) {
        // Success
        Alert.alert('Success', 'Friend request sent successfully!', [
          { text: 'OK', onPress: handleClose },
        ]);
      } else {
        // Error handled by Redux
        const errorMessage =
          (resultAction.payload as any)?.message || 'Failed to send friend request';
        Alert.alert('Error', errorMessage);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send friend request');
    }
  }, [selectedUser, message, dispatch, handleClose]);

  const handleBackToSearch = useCallback(() => {
    setSelectedUser(null);
    setMessage('');
    setShowMessageInput(false);
  }, []);

  // ========================================
  // Render Methods
  // ========================================

  const renderSearchResult = useCallback(
    (result: FriendSearchResult) => {
      const getStatusText = () => {
        switch (result.relationshipStatus) {
          case 'friend':
            return 'Already friends';
          case 'request_sent':
            return 'Request sent';
          case 'request_received':
            return 'Request received';
          case 'blocked':
            return 'Blocked';
          default:
            return 'Send request';
        }
      };

      const getStatusColor = () => {
        switch (result.relationshipStatus) {
          case 'friend':
            return safeTheme?.colors?.primary?.['500'] || '#22c55e';
          case 'request_sent':
            return safeTheme?.colors?.text?.secondary || '#666666';
          case 'request_received':
            return safeTheme?.colors?.primary?.['500'] || '#22c55e';
          case 'blocked':
            return safeTheme?.colors?.semantic?.error?.['500'] || '#ef4444';
          default:
            return safeTheme?.colors?.primary?.['500'] || '#22c55e';
        }
      };

      return (
        <TouchableOpacity
          key={result.user.id}
          style={[
            styles.searchResultItem,
            {
              backgroundColor: safeTheme?.colors?.surface?.background || '#ffffff',
              borderColor: safeTheme?.colors?.border?.primary || '#e5e5e5',
            },
          ]}
          onPress={() => handleSelectUser(result)}
          disabled={!result.canSendRequest}
          activeOpacity={result.canSendRequest ? 0.7 : 1}>
          <View style={styles.userInfo}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: safeTheme?.colors?.primary?.['500'] || '#22c55e' },
              ]}>
              <Typography variant='h6' style={{ color: '#ffffff' }}>
                {result.user.avatar || result.user.name.charAt(0).toUpperCase()}
              </Typography>
            </View>

            <View style={styles.userDetails}>
              <Typography
                variant='body1'
                color={safeTheme?.colors?.text?.primary || '#000000'}
                style={styles.userName}>
                {result.user.name}
              </Typography>

              <Typography variant='caption' color={safeTheme?.colors?.text?.secondary || '#666666'}>
                {result.user.email}
              </Typography>

              {result.mutualFriendsCount > 0 && (
                <Typography
                  variant='caption'
                  color={safeTheme?.colors?.text?.tertiary || '#999999'}
                  style={styles.mutualFriends}>
                  {result.mutualFriendsCount} mutual friend
                  {result.mutualFriendsCount !== 1 ? 's' : ''}
                </Typography>
              )}
            </View>
          </View>

          <View style={styles.actionSection}>
            <Typography variant='caption' style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Typography>
          </View>
        </TouchableOpacity>
      );
    },
    [safeTheme, handleSelectUser]
  );

  const renderSearchView = () => (
    <View style={styles.searchContainer}>
      {/* Search Input */}
      <View
        style={[
          styles.searchInputContainer,
          {
            backgroundColor: (safeTheme?.colors?.surface as any)?.secondary || '#f5f5f5',
            borderColor: safeTheme?.colors?.border?.primary || '#e5e5e5',
          },
        ]}>
        <TextInput
          style={[styles.searchInput, { color: safeTheme?.colors?.text?.primary || '#000000' }]}
          placeholder='Search by name or email...'
          placeholderTextColor={safeTheme?.colors?.text?.tertiary || '#999999'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          returnKeyType='search'
        />
      </View>

      {/* Search Results */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {isSearching && (
          <View style={styles.loadingContainer}>
            <Typography variant='body2' color={safeTheme?.colors?.text?.secondary || '#666666'}>
              Searching...
            </Typography>
          </View>
        )}

        {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
          <View style={styles.emptyContainer}>
            <Typography variant='body2' color={safeTheme?.colors?.text?.secondary || '#666666'}>
              No users found matching "{searchQuery}"
            </Typography>
          </View>
        )}

        {!isSearching && searchQuery.length < 2 && (
          <View style={styles.emptyContainer}>
            <Typography variant='body2' color={safeTheme?.colors?.text?.secondary || '#666666'}>
              Enter at least 2 characters to search
            </Typography>
          </View>
        )}

        {searchResults.map(renderSearchResult)}
      </ScrollView>
    </View>
  );

  const renderMessageView = () => (
    <View style={styles.messageContainer}>
      {/* Selected User Info */}
      <View
        style={[
          styles.selectedUserCard,
          {
            backgroundColor: (safeTheme?.colors?.surface as any)?.secondary || '#f5f5f5',
            borderColor: safeTheme?.colors?.border?.primary || '#e5e5e5',
          },
        ]}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: safeTheme?.colors?.primary?.['500'] || '#22c55e' },
          ]}>
          <Typography variant='h6' style={{ color: '#ffffff' }}>
            {selectedUser?.user.avatar || selectedUser?.user.name.charAt(0).toUpperCase()}
          </Typography>
        </View>

        <View style={styles.selectedUserInfo}>
          <Typography variant='h6' color={safeTheme?.colors?.text?.primary || '#000000'}>
            {selectedUser?.user.name}
          </Typography>

          <Typography variant='caption' color={safeTheme?.colors?.text?.secondary || '#666666'}>
            {selectedUser?.user.email}
          </Typography>
        </View>
      </View>

      {/* Message Input */}
      <View style={styles.messageInputSection}>
        <Typography
          variant='body2'
          color={safeTheme?.colors?.text?.primary || '#000000'}
          style={styles.messageLabel}>
          Add a personal message (optional)
        </Typography>

        <TextInput
          style={[
            styles.messageInput,
            {
              backgroundColor: safeTheme?.colors?.surface?.background || '#ffffff',
              borderColor: safeTheme?.colors?.border?.primary || '#e5e5e5',
              color: safeTheme?.colors?.text?.primary || '#000000',
            },
          ]}
          placeholder="Hi! I'd like to add you as a friend..."
          placeholderTextColor={safeTheme?.colors?.text?.tertiary || '#999999'}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={3}
          maxLength={500}
          textAlignVertical='top'
        />

        <Typography
          variant='caption'
          color={safeTheme?.colors?.text?.tertiary || '#999999'}
          style={styles.characterCount}>
          {message.length}/500
        </Typography>
      </View>

      {/* Action Buttons */}
      <View style={styles.messageActions}>
        <Button
          title='Back'
          variant='outline'
          size='md'
          onPress={handleBackToSearch}
          style={styles.backButton}
          disabled={isSendingRequest}
        />

        <Button
          title='Send Request'
          variant='primary'
          size='md'
          onPress={handleSendRequest}
          style={styles.sendButton}
          loading={isSendingRequest}
          disabled={isSendingRequest}
        />
      </View>
    </View>
  );

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
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.modalContainer,
          {
            backgroundColor: (safeTheme?.colors as any)?.background?.primary || '#ffffff',
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: safeTheme?.colors?.border?.primary || '#e5e5e5' },
          ]}>
          <Typography
            variant='h4'
            color={safeTheme?.colors?.text?.primary || '#000000'}
            style={styles.headerTitle}>
            {showMessageInput ? 'Send Friend Request' : 'Add Friend'}
          </Typography>

          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            disabled={isSendingRequest}>
            <Typography variant='h5' color={safeTheme?.colors?.text?.secondary || '#666666'}>
              ✕
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {showMessageInput ? renderMessageView() : renderSearchView()}
        </View>

        {/* Error Display */}
        {(socialError || error) && (
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: safeTheme?.colors?.semantic?.error?.['500'] || '#ef4444' },
            ]}>
            <Typography variant='caption' style={{ color: '#ffffff' }}>
              {socialError || error}
            </Typography>
          </View>
        )}
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
    top: 50, // Add top margin for status bar clearance
    right: 0,
    bottom: 0,
    width: screenWidth,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 20, // Consistent with AssignmentModal
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '600' as const,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    flex: 1,
    padding: 20,
  },
  searchInputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchInput: {
    paddingVertical: 12,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center' as const,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center' as const,
  },
  searchResultItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  userInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  mutualFriends: {
    marginTop: 2,
  },
  actionSection: {
    alignItems: 'flex-end' as const,
  },
  statusText: {
    fontWeight: '500' as const,
  },
  messageContainer: {
    flex: 1,
    padding: 20,
  },
  selectedUserCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  selectedUserInfo: {
    flex: 1,
  },
  messageInputSection: {
    marginBottom: 24,
  },
  messageLabel: {
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
    fontSize: 16,
  },
  characterCount: {
    textAlign: 'right' as const,
    marginTop: 4,
  },
  messageActions: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  backButton: {
    flex: 1,
  },
  sendButton: {
    flex: 2,
  },
  errorContainer: {
    padding: 12,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
} as const;
