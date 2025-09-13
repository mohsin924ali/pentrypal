// ========================================
// Dashboard Screen Styles
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

  // Header Section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  } as ViewStyle,

  headerContent: {
    flex: 1,
  } as ViewStyle,

  headerGreetingSubtitle: {
    marginTop: 4,
  } as TextStyle,

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  } as ViewStyle,

  // Content Section
  content: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  } as ViewStyle,

  // Stats Section
  statsContainer: {
    marginBottom: 32,
  } as ViewStyle,

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  } as ViewStyle,

  statCard: {
    flex: 0.48,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  // Section Styling
  section: {
    marginBottom: 32,
  } as ViewStyle,

  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600',
  } as TextStyle,

  // Spending Header
  spendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,

  budgetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  } as ViewStyle,

  // Alert Cards
  alertCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  } as ViewStyle,

  // Spending Overview
  spendingOverview: {
    gap: 16,
  } as ViewStyle,

  spendingCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  spendingCardHeader: {
    marginBottom: 12,
  } as ViewStyle,

  spendingCardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,

  spendingDetail: {
    alignItems: 'center',
  } as ViewStyle,

  // Budget Card
  budgetCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  budgetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  budgetProgress: {
    marginTop: 8,
  } as ViewStyle,

  budgetProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  } as ViewStyle,

  budgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  } as ViewStyle,

  // User Spending
  userSpendingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  userSpendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  userSpendingInfo: {
    flex: 1,
  } as ViewStyle,

  userSpendingAmount: {
    alignItems: 'flex-end',
  } as ViewStyle,

  userSpendingProgress: {
    marginTop: 8,
  } as ViewStyle,

  userProgressBar: {
    height: 6,
    borderRadius: 3,
  } as ViewStyle,

  userProgressFill: {
    height: '100%',
    borderRadius: 3,
  } as ViewStyle,

  // Category Spending
  categorySpendingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  categorySpendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  categorySpendingInfo: {
    flex: 1,
  } as ViewStyle,

  categorySpendingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  } as ViewStyle,

  categoryIcon: {
    marginRight: 8,
    fontSize: 18,
  } as TextStyle,

  categorySpendingAmount: {
    alignItems: 'flex-end',
  } as ViewStyle,

  categorySpendingProgress: {
    marginTop: 8,
  } as ViewStyle,

  categoryProgressBar: {
    height: 6,
    borderRadius: 3,
  } as ViewStyle,

  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  } as ViewStyle,

  categoryInsightCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  categoryInsightText: {
    lineHeight: 20,
    textAlign: 'center',
  } as TextStyle,

  categoryInsightHighlight: {
    fontWeight: '600',
  } as TextStyle,

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  } as ViewStyle,

  actionButton: {
    flex: 0.48,
  } as ViewStyle,

  // Quick Action Icons
  actionIconImage: {
    width: 18,
    height: 18,
  } as ViewStyle,

  actionIconText: {
    fontSize: 18,
  } as TextStyle,

  // Activity
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,

  activityContent: {
    flex: 1,
  } as ViewStyle,

  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  } as ViewStyle,

  activityIcon: {
    marginLeft: 12,
  } as ViewStyle,

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  } as ViewStyle,

  emptyStateTitle: {
    textAlign: 'center',
    marginBottom: 16,
  } as TextStyle,

  emptyStateDescription: {
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,

  // Bottom Spacing
  bottomSpacing: {
    // Dynamic height will be set by theme.spacing.xl
  } as ViewStyle,

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  } as ViewStyle,

  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,

  modalTitle: {
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,

  modalDescription: {
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  } as TextStyle,

  inputContainer: {
    marginBottom: 24,
  } as ViewStyle,

  inputLabel: {
    marginBottom: 8,
    fontWeight: '500',
  } as TextStyle,

  budgetInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
  } as ViewStyle,

  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  } as ViewStyle,

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  cancelButton: {
    borderWidth: 1,
  } as ViewStyle,

  confirmButton: {
    // backgroundColor set dynamically
  } as ViewStyle,
});

/**
 * Create themed styles using the provided theme
 */
export const createThemedStyles = (theme: Theme) =>
  StyleSheet.create({
    // Dynamic styles that depend on theme colors
  });

/**
 * Create dynamic styles for runtime calculations
 */
export const createDynamicStyles = (theme: Theme) => ({
  // Action icon image with size and tint color
  actionIconImageDynamic: (size: number, color: string) => ({
    width: size,
    height: size,
    tintColor: color,
  }),

  // Action icon text with size and color
  actionIconTextDynamic: (size: number, color: string) => ({
    fontSize: size,
    color,
  }),

  // Bottom spacing with dynamic height
  bottomSpacingDynamic: (height: number) => ({
    height,
  }),

  // Budget progress fill with dynamic width and color
  budgetProgressFillDynamic: (percentage: number, color: string) => ({
    width: `${Math.min(percentage, 100)}%` as const,
    backgroundColor: color,
  }),

  // User progress fill with dynamic width and color
  userProgressFillDynamic: (percentage: number, color: string) => ({
    width: `${percentage}%` as const,
    backgroundColor: color,
  }),

  // Category progress fill with dynamic width and color
  categoryProgressFillDynamic: (percentage: number, color: string) => ({
    width: `${percentage}%` as const,
    backgroundColor: color,
  }),
});
