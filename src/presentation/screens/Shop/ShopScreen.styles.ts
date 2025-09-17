// ========================================
// Shop Screen Styles - Clean, Theme-based Styling
// ========================================

import { StyleSheet, TextStyle, ViewStyle } from 'react-native';

/**
 * Create fallback theme object - extracted from component
 */
export const createFallbackTheme = () => ({
  colors: {
    primary: { '500': '#3b82f6' },
    text: { primary: '#000000', secondary: '#666666', tertiary: '#999999' },
    background: { primary: '#ffffff' },
    surface: { background: '#ffffff', secondary: '#f5f5f5', card: '#ffffff' },
    border: { primary: '#e5e5e5' },
    success: { primary: '#3b82f6' },
    gray: { '50': '#F9F9F9', '200': '#E5E5E5', '400': '#9CA3AF', '500': '#6B7280' },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
});

/**
 * Base styles - theme-independent using StyleSheet.create
 */
export const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  // Header structure
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 0,
    position: 'relative',
    paddingBottom: 20,
  } as ViewStyle,

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  } as ViewStyle,

  headerSubtitleInShopping: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  } as ViewStyle,

  headerTitle: {
    fontWeight: '700',
    marginBottom: 2,
  } as ViewStyle,

  headerSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  } as ViewStyle,

  // Avatar layouts
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  } as ViewStyle,

  stackedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: -8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  } as ViewStyle,

  stackedAvatarText: {
    fontSize: 12,
    fontWeight: '600',
  } as ViewStyle,

  // Navigation and buttons
  backButton: {
    padding: 12,
    borderRadius: 50,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  finishButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  } as ViewStyle,

  finishButtonText: {
    fontWeight: 'bold',
  } as ViewStyle,

  // List cards - Compact and elegant design
  listCard: {
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderLeftWidth: 4, // Color strip width
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 80, // Ensure minimum height for proper strip display
  } as ViewStyle,

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  } as ViewStyle,

  listMeta: {
    flex: 1,
  } as ViewStyle,

  listTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  } as ViewStyle,

  listItemCount: {
    fontSize: 12,
    opacity: 0.7,
  } as ViewStyle,

  listProgress: {
    alignItems: 'flex-end',
    minWidth: 70,
  } as ViewStyle,

  listCardContent: {} as ViewStyle,

  listCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  } as ViewStyle,

  progressText: {
    fontSize: 11,
    marginBottom: 4,
  } as ViewStyle,

  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  } as ViewStyle,

  // Start Shopping Button
  startShoppingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-end',
  } as ViewStyle,

  startShoppingButtonText: {
    fontSize: 12,
    fontWeight: '600',
  } as ViewStyle,

  listStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as ViewStyle,

  listStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  } as ViewStyle,

  listStatText: {
    fontSize: 11,
    opacity: 0.8,
  } as ViewStyle,

  progressFill: {
    height: '100%',
    borderRadius: 4,
  } as ViewStyle,

  shopButtonText: {
    fontWeight: '600',
    fontSize: 16,
  } as ViewStyle,

  // Progress section
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  } as ViewStyle,

  progressBarLarge: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  } as ViewStyle,

  integratedProgressBar: {
    backgroundColor: 'transparent',
    marginTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
  } as ViewStyle,

  progressFillLarge: {
    height: '100%',
    borderRadius: 6,
  } as ViewStyle,

  // Shopping items
  shoppingItemContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  } as ViewStyle,

  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  shoppingItemCompleted: {
    opacity: 0.6,
  } as ViewStyle,

  shoppingItemAssigned: {
    borderLeftWidth: 4,
  } as ViewStyle,

  shoppingItemReadOnly: {
    opacity: 0.5,
  } as ViewStyle,

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  } as ViewStyle,

  checkboxCompleted: {
    borderWidth: 2,
  } as ViewStyle,

  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
  } as ViewStyle,

  itemIcon: {
    fontSize: 24,
    marginRight: 16,
  } as ViewStyle,

  itemInfo: {
    flex: 1,
  } as ViewStyle,

  itemName: {
    fontWeight: '600',
    marginBottom: 2,
  } as ViewStyle,

  itemNameCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  } as ViewStyle,

  itemQuantity: {
    fontSize: 12,
  } as ViewStyle,

  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  } as ViewStyle,

  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  } as ViewStyle,

  assignmentIndicator: {
    fontSize: 12,
    fontWeight: '500',
  } as ViewStyle,

  assignedAvatarInline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
  } as ViewStyle,

  assignedAvatarText: {
    fontSize: 12,
    fontWeight: '600',
  } as ViewStyle,

  permissionIndicator: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  } as ViewStyle,

  // Amount input
  amountContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  } as ViewStyle,

  amountLabel: {
    fontSize: 12,
    marginBottom: 8,
  } as ViewStyle,

  amountInputContainer: {
    marginHorizontal: 16,
    marginTop: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    marginBottom: 12,
  } as ViewStyle,

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  amountInputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    minWidth: 80,
    height: 32,
  } as ViewStyle,

  currencySymbol: {
    marginRight: 8,
    fontWeight: '600',
  } as ViewStyle,

  amountInput: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 8,
    flex: 1,
  } as ViewStyle,

  amountButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,

  amountCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  } as ViewStyle,

  amountConfirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  } as ViewStyle,

  // Empty states
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  } as ViewStyle,

  emptyTitle: {
    marginBottom: 12,
  } as ViewStyle,

  emptyText: {
    textAlign: 'center',
  } as ViewStyle,
});

/**
 * Create themed styles that depend on theme values
 */
export const createThemedStyles = (theme: any) =>
  StyleSheet.create({
    amountCancelButton: {
      borderColor: theme.colors.border.primary,
    } as ViewStyle,

    amountConfirmButton: {
      backgroundColor: theme.colors.primary?.['500'] || '#3b82f6',
    } as ViewStyle,

    amountInputContainer: {
      backgroundColor: theme.colors.surface.card || theme.colors.surface.background,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border.primary,
    } as ViewStyle,

    amountInputField: {
      backgroundColor: theme.colors.surface.background,
      borderColor: theme.colors.border.primary,
    } as ViewStyle,

    assignedAvatarInline: {
      borderColor: theme.colors.border.primary,
    } as ViewStyle,

    backButton: {
      backgroundColor: theme.colors.gray?.['50'] || '#F9F9F9',
    } as ViewStyle,

    checkbox: {
      borderColor: theme.colors.gray?.['200'] || '#E5E5E5',
      backgroundColor: theme.colors.surface.background,
    } as ViewStyle,

    checkboxCompleted: {
      backgroundColor: theme.colors.primary?.['500'] || '#3b82f6',
      borderColor: theme.colors.primary?.['500'] || '#3b82f6',
    } as ViewStyle,

    checkmark: {
      color: theme.colors.surface.background,
    } as ViewStyle,

    container: {
      // backgroundColor removed to show gradient background
    } as ViewStyle,

    currencySymbol: {
      color: theme.colors.text.primary,
    } as ViewStyle,

    emptyText: {
      color: theme.colors.gray?.['500'] || '#6B7280',
    } as ViewStyle,

    emptyTitle: {
      color: theme.colors.gray?.['500'] || '#6B7280',
    } as ViewStyle,

    finishButton: {
      backgroundColor: theme.colors.primary?.['500'] || '#3b82f6',
    } as ViewStyle,

    finishButtonText: {
      color: theme.colors.surface.background,
    } as ViewStyle,

    header: {
      backgroundColor: theme.colors.surface.background,
      borderBottomColor: theme.colors.border.primary,
    } as ViewStyle,

    listCard: {
      backgroundColor: theme.colors.surface.card || theme.colors.surface.background,
      borderTopColor: theme.colors.border.primary,
      borderRightColor: theme.colors.border.primary,
      borderBottomColor: theme.colors.border.primary,
      // borderLeftColor will be set dynamically for color strip
      shadowColor: theme.colors.text.primary,
    } as ViewStyle,

    moreIndicator: {
      backgroundColor: theme.colors.gray?.['500'] || '#6B7280',
    } as ViewStyle,

    progressBar: {
      backgroundColor: '#F3F4F6',
    } as ViewStyle,

    progressBarLarge: {
      backgroundColor: theme.colors.gray?.['200'] || '#E5E5E5',
    } as ViewStyle,

    progressContainer: {
      backgroundColor: theme.colors.gray?.['50'] || '#F9F9F9',
    } as ViewStyle,

    progressFill: {
      backgroundColor: theme.colors.primary?.['500'] || '#3b82f6',
    } as ViewStyle,

    progressFillLarge: {
      backgroundColor: theme.colors.primary?.['500'] || '#3b82f6',
    } as ViewStyle,

    shopButtonText: {
      color: theme.colors.primary?.['500'] || '#3b82f6',
    } as ViewStyle,

    shoppingItem: {
      backgroundColor: theme.colors.surface.card || theme.colors.surface.background,
      shadowColor: theme.colors.text.primary,
    } as ViewStyle,

    shoppingItemAssigned: {
      backgroundColor: '#F0F9FF', // Light blue background for assigned items
    } as ViewStyle,

    shoppingItemReadOnly: {
      backgroundColor: theme.colors.gray?.['50'] || '#F9FAFB',
    } as ViewStyle,

    stackedAvatar: {
      borderColor: theme.colors.surface.background,
    } as ViewStyle,

    startShoppingButton: {
      borderColor: theme.colors.primary['500'],
    } as ViewStyle,

    startShoppingButtonText: {
      color: theme.colors.primary['500'],
    } as ViewStyle,
  });

/**
 * Color palette for list card strips
 */
export const listCardColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

/**
 * Get color for list card strip based on list index
 */
export const getListCardColor = (index: number): string => {
  const colorIndex = index % listCardColors.length;
  return listCardColors[colorIndex] || '#3B82F6';
};

/**
 * Create dynamic styles that depend on runtime values
 */
export const createDynamicStyles = (theme: any) => ({
  // Progress bar with dynamic width
  createProgressFillStyle: (progress: number) =>
    ({
      width: `${progress}%`,
    }) as ViewStyle,

  // Color strip for list cards
  createColorStripStyle: (color: string) =>
    ({
      backgroundColor: color,
    }) as ViewStyle,

  // List card with border color strip
  createListCardWithColorStrip: (color: string) =>
    ({
      borderLeftColor: color,
    }) as ViewStyle,

  // Shopping item with assignment color
  createAssignedItemStyle: (color: string) =>
    ({
      borderLeftColor: color,
    }) as ViewStyle,

  // Avatar with transparent background
  transparentAvatarStyle: {
    backgroundColor: 'transparent',
  } as ViewStyle,
});

/**
 * Collaborator color palette
 */
export const collaboratorColors = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
];

/**
 * Get collaborator color based on user ID and collaborator list
 */
export const getCollaboratorColor = (userId: string, collaborators: any[] = []): string => {
  const collaboratorIndex = collaborators.findIndex(c => c.userId === userId);
  if (collaboratorIndex === -1) return collaboratorColors[0] || '#4F46E5';
  return collaboratorColors[collaboratorIndex % collaboratorColors.length] || '#4F46E5';
};
