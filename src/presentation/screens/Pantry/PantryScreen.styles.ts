// ========================================
// Pantry Screen Styles
// ========================================

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '../../../shared/types/ui';

/**
 * Base styles that don't depend on theme
 */
export const baseStyles = StyleSheet.create({
  actionButton: {
    flex: 0.48,
  } as ViewStyle,
  categoryButton: {
    marginRight: 8,
  } as ViewStyle,
  categoryContent: {
    paddingHorizontal: 24,
    gap: 8,
  } as ViewStyle,
  categoryFilter: {
    marginBottom: 16,
  } as ViewStyle,
  container: {
    flex: 1,
  } as ViewStyle,
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  } as ViewStyle,
  expirationContainer: {
    marginBottom: 12,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  } as ViewStyle,
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  } as ViewStyle,
  itemInfo: {
    flex: 1,
  } as ViewStyle,
  itemsContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  } as ViewStyle,
  itemsList: {
    flex: 1,
  } as ViewStyle,
  quantityContainer: {
    marginBottom: 8,
  } as ViewStyle,
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  } as ViewStyle,
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  } as ViewStyle,
});

/**
 * Create themed styles using the provided theme
 */
export const createThemedStyles = (theme: any) => ({
  // Container with theme background
  themedContainer: {
    backgroundColor: theme.colors.surface.background,
  } as ViewStyle,

  // Stat card with shadow and theme background
  statCard: {
    flex: 0.23,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface.card,
    shadowColor: theme.colors.neutral[900] || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  // Item card with theme colors and shadows
  itemCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    backgroundColor: theme.colors.surface.card,
    borderColor: theme.colors.border.primary,
    shadowColor: theme.colors.neutral[900] || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
});

/**
 * Create dynamic inline styles for specific use cases
 */
export const createDynamicStyles = (theme: any) => ({
  // Status badge with dynamic background color
  createStatusBadgeStyle: (statusColor: string) =>
    ({
      backgroundColor: `${statusColor}20`,
    }) as ViewStyle,

  // Button with margin right
  headerButtonWithMargin: {
    marginRight: 8,
  } as ViewStyle,

  // Empty state text styles
  emptyStateTextWithTopMargin: {
    marginTop: theme.spacing?.md || 16,
  } as ViewStyle,

  emptyStateSmallTextWithMargin: {
    marginTop: theme.spacing?.sm || 8,
  } as ViewStyle,

  emptyStateButtonWithMargin: {
    marginTop: theme.spacing?.lg || 24,
  } as ViewStyle,
});
