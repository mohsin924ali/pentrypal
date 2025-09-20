// ========================================
// Archived Lists Screen Styles
// ========================================

import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

export const baseStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
  } as ViewStyle,

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  } as ViewStyle,

  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  } as ViewStyle,

  backButtonText: {
    color: '#000000', // Changed to black for better visibility
    fontSize: 16,
    fontWeight: '500',
  } as TextStyle,

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#000000', // Changed to black for better visibility
    fontSize: 20,
    fontWeight: '700',
  } as TextStyle,

  headerSpacer: {
    width: 80, // Same width as back button to center title
  } as ViewStyle,

  // Scroll View Styles
  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  } as ViewStyle,

  // List Card Styles - Following design.txt layout
  listCardContainer: {
    marginBottom: 16,
  } as ViewStyle,

  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  } as ViewStyle,

  archivedListCard: {
    opacity: 0.7,
  } as ViewStyle,

  // Header Section Styles (from design.txt)
  newCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  } as ViewStyle,

  leftSection: {
    flex: 1,
    marginRight: 12,
  } as ViewStyle,

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  } as TextStyle,

  sharedBadge: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  } as TextStyle,

  cardRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as ViewStyle,

  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  avatarWrapper: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
  } as ViewStyle,

  expandButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  expandIcon: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  } as TextStyle,

  // View button styles for archived lists
  viewButton: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  viewButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  } as TextStyle,

  // Progress Section Styles (from design.txt)
  progressInfo: {
    marginBottom: 16,
  } as ViewStyle,

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  statsText: {
    fontSize: 12,
    fontWeight: '500',
  } as TextStyle,

  statsSeparator: {
    marginHorizontal: 8,
    fontSize: 12,
  } as TextStyle,

  progressBarSection: {
    width: '100%',
  } as ViewStyle,

  thinProgressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  } as ViewStyle,

  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  } as ViewStyle,

  // Expanded Section Styles
  expandedSection: {
    marginTop: 16,
  } as ViewStyle,

  sectionDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 16,
  } as ViewStyle,

  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,

  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,

  // Items List Styles
  itemsList: {
    gap: 12,
  } as ViewStyle,

  expandedListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  } as ViewStyle,

  listItemAssigned: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  } as ViewStyle,

  archivedListItem: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
  } as ViewStyle,

  // Item Content Styles
  itemContent: {
    flex: 1,
  } as ViewStyle,

  expandedItemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  } as TextStyle,

  itemNameCompleted: {
    textDecorationLine: 'line-through',
  } as TextStyle,

  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  } as ViewStyle,

  assignedText: {
    fontSize: 12,
    marginRight: 8,
  } as TextStyle,

  assignedAvatar: {
    marginLeft: 4,
  } as ViewStyle,

  // Checkbox Styles
  checkboxContainer: {
    marginRight: 16,
  } as ViewStyle,

  unifiedCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  } as ViewStyle,

  unifiedCheckboxCompleted: {
    backgroundColor: '#10B981', // Green for completed
    borderColor: '#10B981',
  } as ViewStyle,

  unifiedCheckmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,

  // Archived Badge Styles
  archivedBadge: {
    position: 'absolute',
    top: 50, // Moved down to avoid overlapping with buttons
    right: 16,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Ensure it stays above other elements
  } as ViewStyle,

  archivedText: {
    fontWeight: '500',
    fontSize: 11,
    color: '#92400E', // Dark brown/amber color for better visibility on light background
  } as TextStyle,

  // Pagination Styles
  paginationContainer: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  } as ViewStyle,

  paginationInfo: {
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  paginationText: {
    fontSize: 12,
    color: '#6B7280',
  } as TextStyle,

  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  } as ViewStyle,

  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  paginationButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F3F4F6',
    opacity: 0.5,
  } as ViewStyle,

  paginationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  } as TextStyle,

  paginationButtonTextDisabled: {
    color: '#9CA3AF',
  } as TextStyle,

  paginationLoading: {
    alignItems: 'center',
    marginTop: 8,
  } as ViewStyle,

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  } as ViewStyle,

  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  } as TextStyle,

  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  } as TextStyle,

  loadingText: {
    fontSize: 18,
    textAlign: 'center',
  } as TextStyle,
});
