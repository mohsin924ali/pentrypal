// ========================================
// Shopping Lists Screen Styles
// ========================================

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '../../../shared/types/ui';

/**
 * Base styles that don't depend on theme
 */
export const baseStyles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
  } as ViewStyle,

  // List Item
  listItem: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  } as ViewStyle,

  listItemContent: {
    flex: 1,
  } as ViewStyle,

  listItemActions: {
    alignItems: 'flex-end',
  } as ViewStyle,

  // List Item Stats
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  // Status Badge
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  } as ViewStyle,

  statusText: {
    color: '#ffffff',
    textTransform: 'capitalize',
  } as TextStyle,

  // Button Styles
  openButton: {
    minWidth: 60,
  } as ViewStyle,

  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  emptyStateTitle: {
    textAlign: 'center',
  } as TextStyle,

  emptyStateDescription: {
    textAlign: 'center',
  } as TextStyle,

  // Error State
  errorStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  errorStateTitle: {
    textAlign: 'center',
  } as TextStyle,

  errorStateDescription: {
    textAlign: 'center',
  } as TextStyle,

  // Header
  headerContainer: {
    borderBottomWidth: 1,
  } as ViewStyle,

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  // FlatList Content
  flatListContent: {
    flexGrow: 1,
  } as ViewStyle,
});

/**
 * Create themed styles using the provided theme
 */
export const createThemedStyles = (theme: Theme) =>
  StyleSheet.create({
    // List item with theme colors
    listItemThemed: {
      backgroundColor: theme.colors.surface.card,
      shadowColor: (theme.colors as any).shadow || '#000',
    } as ViewStyle,

    // Header with theme colors
    headerContainerThemed: {
      padding: theme.spacing.md,
      borderBottomColor: theme.colors.border.primary,
    } as ViewStyle,
  });

/**
 * Create dynamic styles for runtime calculations
 */
export const createDynamicStyles = (theme: Theme) => ({
  // List item title with dynamic colors and spacing
  listItemTitle: (color: string, marginBottom: number) => ({
    color,
    marginBottom,
  }),

  // List item description with dynamic colors and spacing
  listItemDescription: (color: string, marginBottom: number) => ({
    color,
    marginBottom,
  }),

  // Stats container with dynamic spacing
  statsContainerDynamic: (marginBottom: number) => ({
    marginBottom,
  }),

  // Stats item with dynamic colors and spacing
  statsItem: (color: string, marginRight: number) => ({
    color,
    marginRight,
  }),

  // Progress text with dynamic color
  progressText: (color: string) => ({
    color,
  }),

  // Budget text with dynamic color
  budgetText: (color: string) => ({
    color,
  }),

  // Status badge with dynamic colors and spacing
  statusBadgeDynamic: (backgroundColor: string, marginBottom: number, borderRadius: number) => ({
    backgroundColor,
    marginBottom,
    borderRadius,
  }),

  // Status text with dynamic background color
  statusTextDynamic: (color: string) => ({
    color,
    textTransform: 'capitalize' as const,
  }),

  // Empty state container with dynamic padding
  emptyStateContainerDynamic: (padding: number) => ({
    padding,
  }),

  // Empty state title with dynamic colors and spacing
  emptyStateTitle: (color: string, marginBottom: number) => ({
    color,
    marginBottom,
    textAlign: 'center' as const,
  }),

  // Empty state description with dynamic colors and spacing
  emptyStateDescription: (color: string, marginBottom: number) => ({
    color,
    marginBottom,
    textAlign: 'center' as const,
  }),

  // Error state container with dynamic padding
  errorStateContainerDynamic: (padding: number) => ({
    padding,
  }),

  // Error state title with dynamic colors and spacing
  errorStateTitle: (color: string, marginBottom: number) => ({
    color,
    marginBottom,
    textAlign: 'center' as const,
  }),

  // Error state description with dynamic colors and spacing
  errorStateDescriptionDynamic: (color: string, marginBottom: number) => ({
    color,
    marginBottom,
    textAlign: 'center' as const,
  }),

  // Header title with dynamic color
  headerTitle: (color: string) => ({
    color,
  }),

  // Header subtitle with dynamic color
  headerSubtitle: (color: string) => ({
    color,
  }),

  // FlatList content with dynamic padding
  flatListContentDynamic: (paddingVertical: number) => ({
    paddingVertical,
  }),

  // Refresh control colors
  refreshControlColors: (primaryColor: string) => ({
    colors: [primaryColor],
    tintColor: primaryColor,
  }),
});
