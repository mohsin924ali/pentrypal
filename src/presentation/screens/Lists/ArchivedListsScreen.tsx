// ========================================
// Archived Lists Screen - Dedicated screen for viewing archived shopping lists with pagination
// ========================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Image, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';

// Components
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/atoms/Typography/Typography';
import { GradientBackground } from '../../components/atoms/GradientBackground/GradientBackground';
import { ArchivedListModal } from './components/ArchivedListModal';

// Store
import type { AppDispatch } from '../../../application/store';
import {
  loadShoppingLists,
  selectIsLoadingLists,
} from '../../../application/store/slices/shoppingListSlice';
import { selectUser } from '../../../application/store/slices/authSlice';
import { selectFriends } from '../../../application/store/slices/socialSlice';

// Types
import type { AvatarType, CurrencyCode, ShoppingList } from '../../../shared/types/lists';

// Styles
import { baseStyles } from './ArchivedListsScreen.styles';

// Theme
import { useTheme } from '../../providers/ThemeProvider';

// Utils
import { DEFAULT_CURRENCY, formatCurrency } from '../../../shared/utils/currencyUtils';
import { getAvatarProps, getFallbackAvatar } from '../../../shared/utils/avatarUtils';
import { shoppingLogger } from '../../../shared/utils/logger';

// Navigation
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ListsStackParamList } from '../../navigation/ListsStackNavigator';

// Props
export interface ArchivedListsScreenProps {
  onBackPress?: () => void;
}

type NavigationProp = StackNavigationProp<ListsStackParamList, 'ArchivedLists'>;

export const ArchivedListsScreen: React.FC<ArchivedListsScreenProps> = ({ onBackPress }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  // Redux selectors
  const user = useSelector(selectUser);
  const friends = useSelector(selectFriends);
  const isLoading = useSelector(selectIsLoadingLists);

  // Local state
  const [userCurrency, setUserCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  // Archive pagination state
  const [archivePage, setArchivePage] = useState(0);
  const [archiveLimit] = useState(10);
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  const [archivedListsData, setArchivedListsData] = useState<ShoppingList[]>([]);
  const [hasMoreArchived, setHasMoreArchived] = useState(true);
  const isLoadingRef = useRef(false);

  // Archive modal state
  const [showArchivedDetailModal, setShowArchivedDetailModal] = useState(false);
  const [archivedListDetail, setArchivedListDetail] = useState<ShoppingList | null>(null);

  // Load user currency preference
  useEffect(() => {
    const userPrefs = user?.preferences;
    const preferredCurrency = (userPrefs as { currency?: string })?.currency;
    if (typeof preferredCurrency === 'string' && preferredCurrency.length > 0) {
      setUserCurrency(preferredCurrency as CurrencyCode);
    }
  }, [user]);

  // Load archived lists with pagination
  const loadArchivedLists = useCallback(
    async (page: number, append: boolean = false) => {
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;
      setIsLoadingArchive(true);
      try {
        const skip = page * archiveLimit;
        const result = await dispatch(
          loadShoppingLists({
            status: 'archived',
            skip,
            limit: archiveLimit,
          })
        ).unwrap();

        const newArchivedLists = result.filter(list => list.status === 'archived');

        if (append) {
          setArchivedListsData(prev => [...prev, ...newArchivedLists]);
        } else {
          setArchivedListsData(newArchivedLists);
        }

        setHasMoreArchived(newArchivedLists.length === archiveLimit);
      } catch (loadError) {
        console.error('Failed to load archived lists:', loadError);
      } finally {
        isLoadingRef.current = false;
        setIsLoadingArchive(false);
      }
    },
    [dispatch, archiveLimit]
  );

  // Load initial archived lists
  useEffect(() => {
    if (user?.id) {
      loadArchivedLists(0, false);
    }
  }, [user?.id, loadArchivedLists]);

  // Archive pagination handlers
  const handlePreviousArchivePage = useCallback(() => {
    if (archivePage > 0) {
      const prevPage = archivePage - 1;
      setArchivePage(prevPage);
      loadArchivedLists(prevPage, false);
    }
  }, [archivePage, loadArchivedLists]);

  const handleNextArchivePage = useCallback(() => {
    if (hasMoreArchived) {
      const nextPage = archivePage + 1;
      setArchivePage(nextPage);
      loadArchivedLists(nextPage, false);
    }
  }, [archivePage, hasMoreArchived, loadArchivedLists]);

  // Handle view archived list detail
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

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (typeof user?.id !== 'string' || user.id.length === 0) return;

    shoppingLogger.debug('🔄 Archived Lists - Refreshing...');
    setArchivePage(0);
    await loadArchivedLists(0, false);
  }, [user?.id, loadArchivedLists]);

  // Handle back navigation
  const handleBackPress = useCallback(() => {
    if (onBackPress) {
      onBackPress();
    } else {
      navigation.goBack();
    }
  }, [navigation, onBackPress]);

  // Get user avatar helper
  const getUserAvatar = useCallback(
    (userId: string): AvatarType => {
      // First check if it's the current user
      if (user && user.id === userId) {
        return user.avatar ?? getFallbackAvatar(user.name);
      }

      // Look up in collaborators from all lists
      for (const list of archivedListsData) {
        const collaborator = list.collaborators.find(c => c.userId === userId);
        if (collaborator) {
          return collaborator.avatar ?? getFallbackAvatar(collaborator.name);
        }
      }

      // Look up in friends list
      const friendship = friends?.find(f => f.user1Id === userId || f.user2Id === userId);
      if (friendship) {
        const friend = friendship.user1Id === userId ? friendship.user1 : friendship.user2;
        return friend?.avatar ?? getFallbackAvatar(friend?.name ?? 'Unknown');
      }

      return '👤';
    },
    [user, archivedListsData, friends]
  );

  // Safe theme access
  const safeTheme = useMemo(
    () =>
      theme || {
        colors: {
          text: { primary: '#000000', secondary: '#666666' },
          surface: { primary: '#ffffff' },
        },
      },
    [theme]
  );

  // Avatar rendering helper
  const renderAvatar = useCallback(
    (avatar: AvatarType, size: number = 20) => {
      try {
        const avatarProps = getAvatarProps(avatar);

        const containerStyle = {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: safeTheme?.colors?.primary?.['500'] || '#3b82f6',
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          overflow: 'hidden' as const,
        };

        const imageStyle = {
          width: size,
          height: size,
          borderRadius: size / 2,
        };

        const textStyle = {
          fontSize: size * 0.6,
          fontWeight: '600' as const,
          color:
            (safeTheme?.colors as any)?.background?.primary ||
            safeTheme?.colors?.text?.onPrimary ||
            '#ffffff',
        };

        switch (avatarProps.type) {
          case 'asset':
          case 'uri':
            return (
              <View style={containerStyle}>
                <Image source={avatarProps.source as any} style={imageStyle} />
              </View>
            );

          case 'emoji':
            return (
              <View style={containerStyle}>
                <Typography style={textStyle}>{avatarProps.emoji}</Typography>
              </View>
            );

          default:
            return (
              <View style={containerStyle}>
                <Typography style={textStyle}>👤</Typography>
              </View>
            );
        }
      } catch (renderError) {
        shoppingLogger.error('Error in renderAvatar:', renderError);
        // Return a fallback avatar
        return (
          <View
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: '#3b82f6',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Typography style={{ fontSize: size * 0.6, fontWeight: '600', color: '#ffffff' }}>
              👤
            </Typography>
          </View>
        );
      }
    },
    [safeTheme]
  );

  // Memoized archived lists with proper sorting
  const archivedLists = useMemo(
    () =>
      archivedListsData.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
    [archivedListsData]
  );

  // Render archived list card
  const renderListCard = useCallback(
    (list: ShoppingList) => {
      const isShared = list.collaborators.length > 1;

      return (
        <View key={list.id} style={baseStyles.listCardContainer}>
          <View style={[baseStyles.listCard, baseStyles.archivedListCard]}>
            {/* Header - Following same design as EnhancedListsScreen */}
            <View style={baseStyles.newCardHeader}>
              <View style={baseStyles.leftSection}>
                <Typography
                  variant='h5'
                  color={safeTheme?.colors?.text?.primary || '#000000'}
                  style={baseStyles.cardTitle}>
                  {list.name}
                </Typography>
                {isShared && (
                  <Typography
                    variant='caption'
                    color={safeTheme?.colors?.text?.secondary || '#666666'}
                    style={baseStyles.sharedBadge}>
                    Shared
                  </Typography>
                )}
              </View>

              <View style={baseStyles.cardRightSection}>
                {/* Collaborator avatars */}
                {list.collaborators.length > 0 && (
                  <View style={baseStyles.avatarsContainer}>
                    {list.collaborators.slice(0, 2).map((collaborator, index) => (
                      <View
                        key={`${collaborator.id}-${index}`}
                        style={[baseStyles.avatarWrapper, { marginLeft: index > 0 ? -8 : 0 }]}>
                        {renderAvatar(getUserAvatar(collaborator.userId), 24)}
                      </View>
                    ))}
                  </View>
                )}

                {/* View button for archived lists */}
                <TouchableOpacity
                  style={baseStyles.viewButton}
                  onPress={() => handleViewArchivedList(list)}
                  accessibilityRole='button'
                  accessibilityLabel={`View archived ${list.name} list`}
                  activeOpacity={0.7}>
                  <Typography style={baseStyles.viewButtonText}>View</Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* Progress info - stats on one line */}
            <View style={baseStyles.progressInfo}>
              <View style={baseStyles.statsRow}>
                <Typography
                  variant='caption'
                  color={safeTheme?.colors?.text?.secondary || '#666666'}
                  style={baseStyles.statsText}>
                  ✓ {list.completedCount || 0}/{list.itemsCount || 0} items
                </Typography>
                {list.totalSpent > 0 && (
                  <>
                    <Typography
                      variant='caption'
                      color={safeTheme?.colors?.text?.secondary || '#666666'}
                      style={baseStyles.statsSeparator}>
                      •
                    </Typography>
                    <Typography variant='caption' color='#f59e0b' style={baseStyles.statsText}>
                      💰 {formatCurrency(list.totalSpent, userCurrency)}
                    </Typography>
                  </>
                )}
              </View>

              {/* Progress bar */}
              <View style={baseStyles.progressBarSection}>
                <View style={baseStyles.thinProgressBar}>
                  <View
                    style={[
                      baseStyles.progressFill,
                      {
                        width: `${
                          list.itemsCount > 0
                            ? Math.round(((list.completedCount || 0) / list.itemsCount) * 100)
                            : 0
                        }%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Archived badge */}
            <View style={baseStyles.archivedBadge}>
              <Typography variant='caption' style={baseStyles.archivedText}>
                📦 Archived
              </Typography>
            </View>
          </View>
        </View>
      );
    },
    [safeTheme, renderAvatar, getUserAvatar, userCurrency, handleViewArchivedList]
  );

  return (
    <GradientBackground>
      <SafeAreaView style={baseStyles.container}>
        {/* Header */}
        <View style={baseStyles.header}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={baseStyles.backButton}
            accessibilityRole='button'
            accessibilityLabel='Go back'>
            <Typography style={baseStyles.backButtonText}>← Back</Typography>
          </TouchableOpacity>

          <Typography variant='h2' style={baseStyles.headerTitle}>
            Archived Lists
          </Typography>

          <View style={baseStyles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={baseStyles.scrollView}
          contentContainerStyle={baseStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={safeTheme.colors.text.secondary}
            />
          }>
          {isLoading && archivedLists.length === 0 ? (
            <View style={baseStyles.emptyContainer}>
              <Typography
                variant='h3'
                color={safeTheme.colors.text.secondary}
                style={baseStyles.loadingText}>
                Loading archived lists...
              </Typography>
            </View>
          ) : archivedLists.length > 0 ? (
            <>
              {/* Render archived list cards */}
              {archivedLists.map(renderListCard)}

              {/* Archive Pagination Controls */}
              <View style={baseStyles.paginationContainer}>
                <View style={baseStyles.paginationInfo}>
                  <Typography
                    variant='caption'
                    color={safeTheme.colors.text.secondary}
                    style={baseStyles.paginationText}>
                    Page {archivePage + 1} • {archivedLists.length} of {archiveLimit} per page
                  </Typography>
                </View>

                <View style={baseStyles.paginationButtons}>
                  {/* Previous Page Button */}
                  <TouchableOpacity
                    style={[
                      baseStyles.paginationButton,
                      archivePage === 0 && baseStyles.paginationButtonDisabled,
                    ]}
                    onPress={handlePreviousArchivePage}
                    disabled={archivePage === 0 || isLoadingArchive}
                    accessibilityRole='button'
                    accessibilityLabel='Previous page'>
                    <Typography
                      style={[
                        baseStyles.paginationButtonText,
                        archivePage === 0 && baseStyles.paginationButtonTextDisabled,
                      ]}>
                      ← Previous
                    </Typography>
                  </TouchableOpacity>

                  {/* Next Page Button */}
                  <TouchableOpacity
                    style={[
                      baseStyles.paginationButton,
                      !hasMoreArchived && baseStyles.paginationButtonDisabled,
                    ]}
                    onPress={handleNextArchivePage}
                    disabled={!hasMoreArchived || isLoadingArchive}
                    accessibilityRole='button'
                    accessibilityLabel='Next page'>
                    <Typography
                      style={[
                        baseStyles.paginationButtonText,
                        !hasMoreArchived && baseStyles.paginationButtonTextDisabled,
                      ]}>
                      Next →
                    </Typography>
                  </TouchableOpacity>
                </View>

                {/* Loading indicator */}
                {isLoadingArchive && (
                  <View style={baseStyles.paginationLoading}>
                    <Typography variant='caption' color={safeTheme.colors.text.secondary}>
                      Loading...
                    </Typography>
                  </View>
                )}
              </View>
            </>
          ) : (
            <View style={baseStyles.emptyContainer}>
              <Typography
                variant='h3'
                color={safeTheme.colors.text.secondary}
                style={baseStyles.emptyTitle}>
                No Archived Lists
              </Typography>
              <Typography
                variant='body1'
                color={safeTheme.colors.text.secondary}
                style={baseStyles.emptyText}>
                Archived lists will appear here when you finish shopping.
              </Typography>
            </View>
          )}
        </ScrollView>

        {/* Archived List Detail Modal */}
        <ArchivedListModal
          visible={showArchivedDetailModal}
          list={archivedListDetail}
          onClose={handleCloseArchivedModal}
        />
      </SafeAreaView>
    </GradientBackground>
  );
};
