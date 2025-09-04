// ========================================
// Enhanced Lists Screen Styles - Complete Extraction (853 lines from original)
// ========================================

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '../../../shared/types/ui';

/**
 * Base styles that don't depend on theme (extracted from original inline styles)
 */
export const baseStyles = StyleSheet.create({
  // Container & Layout Styles
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  } as ViewStyle,

  listsContainer: {
    marginBottom: 32,
  } as ViewStyle,

  listCardContainer: {
    marginBottom: 20,
  } as ViewStyle,

  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } as ViewStyle,

  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  headerTitle: {
    fontWeight: '700',
    fontSize: 18,
  } as ViewStyle,

  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as ViewStyle,

  notificationButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  } as ViewStyle,

  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  } as ViewStyle,

  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  } as ViewStyle,

  // List Card Styles
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } as ViewStyle,

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  } as ViewStyle,

  listInfo: {
    flex: 1,
    marginRight: 16,
  } as ViewStyle,

  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  listTitle: {
    fontWeight: '600',
    marginRight: 12,
  } as ViewStyle,

  sharedText: {
    fontSize: 11,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 2,
  } as ViewStyle,

  listSubtitle: {
    marginBottom: 8,
  } as ViewStyle,

  totalSpent: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  } as ViewStyle,

  lastUpdated: {
    fontSize: 12,
  } as ViewStyle,

  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minHeight: 32,
    paddingTop: 2,
  } as ViewStyle,

  // Progress Styles
  progressBarContainer: {
    marginBottom: 16,
  } as ViewStyle,

  progressBar: {
    width: '100%',
    height: 24,
    backgroundColor: '#F0F4F2',
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
  } as ViewStyle,

  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    minWidth: 2,
  } as ViewStyle,

  progressTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  } as ViewStyle,

  progressText: {
    fontWeight: '600',
    fontSize: 11,
    textAlign: 'center',
  } as ViewStyle,

  // Collaborator Styles
  collaboratorsSection: {
    marginBottom: 16,
  } as ViewStyle,

  collaboratorsLabel: {
    marginBottom: 8,
    fontWeight: '500',
  } as ViewStyle,

  collaboratorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as ViewStyle,

  collaboratorChip: {
    backgroundColor: '#F0F4F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as ViewStyle,

  addContributorButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#22c55e',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  } as ViewStyle,

  addContributorText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.3,
  } as ViewStyle,

  // Items Styles
  listItems: {
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
    paddingTop: 16,
  } as ViewStyle,

  itemsTitle: {
    fontWeight: '600',
    marginBottom: 16,
  } as ViewStyle,

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  } as ViewStyle,

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  } as ViewStyle,

  checkboxCompleted: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  } as ViewStyle,

  itemInfo: {
    flex: 1,
  } as ViewStyle,

  itemNameCompleted: {
    textDecorationLine: 'line-through',
  } as ViewStyle,

  listItemAssigned: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  } as ViewStyle,

  itemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  } as ViewStyle,

  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  } as ViewStyle,

  assignmentIndicator: {
    fontSize: 12,
    fontWeight: '500',
  } as ViewStyle,

  assignedAvatarInline: {
    marginLeft: 8,
  } as ViewStyle,

  assignButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#22c55e30',
  } as ViewStyle,

  // Button Styles
  editButtonContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
    alignItems: 'center',
  } as ViewStyle,

  editButton: {
    minWidth: 200,
    maxWidth: 300,
    height: 44,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  } as ViewStyle,

  addButtonContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  } as ViewStyle,

  addButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 200,
    maxWidth: 300,
  } as ViewStyle,

  archiveButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  } as ViewStyle,

  archiveButton: {
    borderColor: '#6B7280',
    borderWidth: 1,
    minWidth: 200,
    maxWidth: 300,
    height: 44,
    paddingVertical: 12,
  } as ViewStyle,

  // Loading & Empty States
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  loadingText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as ViewStyle,

  emptyContainer: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  emptyTitle: {
    marginBottom: 16,
    textAlign: 'center',
  } as ViewStyle,

  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as ViewStyle,

  // Archived Styles
  archivedListCard: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  } as ViewStyle,

  archivedBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  archivedText: {
    fontWeight: '500',
    fontSize: 11,
  } as ViewStyle,

  archivedListItem: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
  } as ViewStyle,

  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  } as ViewStyle,

  successModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  } as ViewStyle,

  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  } as ViewStyle,

  successIcon: {
    fontSize: 40,
  } as ViewStyle,

  successTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  } as ViewStyle,

  successSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  } as ViewStyle,

  successButton: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  } as ViewStyle,

  successButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  } as ViewStyle,

  // Error Modal Styles
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  } as ViewStyle,

  errorModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  } as ViewStyle,

  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  } as ViewStyle,

  errorIcon: {
    fontSize: 40,
  } as ViewStyle,

  errorTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  } as ViewStyle,

  errorSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  } as ViewStyle,

  errorButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  } as ViewStyle,

  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  } as ViewStyle,

  // Archived Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  } as ViewStyle,

  archivedModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    minHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,

  archivedModalHeader: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  } as ViewStyle,

  archivedModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  } as ViewStyle,

  archivedModalBody: {
    flex: 1,
    padding: 24,
    paddingBottom: 0,
  } as ViewStyle,

  archivedModalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  } as ViewStyle,

  archivedInfoSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  } as ViewStyle,

  archivedInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  archivedInfoLabel: {
    fontSize: 16,
    color: '#4a4a4a',
    fontWeight: '500',
  } as ViewStyle,

  archivedInfoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  } as ViewStyle,

  scrollIndicator: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    alignItems: 'center',
  } as ViewStyle,

  scrollIndicatorText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
    textAlign: 'center',
  } as ViewStyle,

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  } as ViewStyle,

  // Items Section Styles (Archived Modal)
  itemsSection: {
    marginBottom: 24,
  } as ViewStyle,

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  } as ViewStyle,

  completedItemRow: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  } as ViewStyle,

  itemCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  itemCheckboxCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  } as ViewStyle,

  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  } as ViewStyle,

  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  } as ViewStyle,

  completedItemName: {
    color: '#6b7280',
    textDecorationLine: 'line-through',
  } as ViewStyle,

  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  itemQuantity: {
    fontSize: 12,
    color: '#6b7280',
  } as ViewStyle,

  itemAssigned: {
    fontSize: 12,
    color: '#3b82f6',
    marginLeft: 8,
  } as ViewStyle,

  itemRight: {
    alignItems: 'flex-end',
  } as ViewStyle,

  purchaseInfo: {
    alignItems: 'flex-end',
  } as ViewStyle,

  purchaseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  } as ViewStyle,

  purchasedBy: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  } as ViewStyle,

  notPurchased: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  } as ViewStyle,

  noItemsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  } as ViewStyle,

  // Spending Summary Styles
  spendingSummarySection: {
    marginBottom: 24,
  } as ViewStyle,

  spendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  } as ViewStyle,

  spendingUser: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  } as ViewStyle,

  spendingDetails: {
    alignItems: 'flex-end',
  } as ViewStyle,

  spendingAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  } as ViewStyle,

  spendingItems: {
    fontSize: 12,
    color: '#6b7280',
  } as ViewStyle,

  noSpendingText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  } as ViewStyle,

  archivedCollaboratorsList: {
    fontSize: 14,
    color: '#4a4a4a',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  } as ViewStyle,

  archivedModalFooter: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  } as ViewStyle,

  archivedCloseButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  } as ViewStyle,

  archivedCloseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  } as ViewStyle,
});

/**
 * Create themed styles using the provided theme
 */
export const createThemedStyles = (theme: Theme) =>
  StyleSheet.create({
    // Theme-dependent styles can be added here as needed
    containerBackground: {
      backgroundColor: theme.colors.surface.background,
    } as ViewStyle,

    cardBackground: {
      backgroundColor: theme.colors.surface.card,
    } as ViewStyle,

    primaryText: {
      color: theme.colors.text.primary,
    } as TextStyle,

    secondaryText: {
      color: theme.colors.text.secondary,
    } as TextStyle,
  });

/**
 * Create dynamic styles that depend on runtime values
 */
export const createDynamicStyles = (params: {
  theme: Theme;
  // Add any dynamic parameters here as needed
}) =>
  StyleSheet.create({
    // Dynamic styles will go here if needed
  });
