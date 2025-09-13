// ========================================
// Create List Screen Styles
// ========================================

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '../../../shared/types/ui';

/**
 * Base styles that don't depend on theme - extracted from original styles object
 */
export const baseStyles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
  } as ViewStyle,

  // Header Section
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
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
  } as TextStyle,

  // Scroll View
  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    padding: 24,
    paddingBottom: 100, // Space for fixed button
  } as ViewStyle,

  // Input Section
  inputSection: {
    marginBottom: 16,
  } as ViewStyle,

  inputLabel: {
    fontWeight: '700',
    marginBottom: 8,
  } as TextStyle,

  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  } as ViewStyle,

  // Search Dropdown
  searchDropdown: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    marginTop: 4,
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  } as ViewStyle,

  searchDropdownScroll: {
    maxHeight: 200,
  } as ViewStyle,

  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  } as ViewStyle,

  searchItemIcon: {
    marginRight: 12,
    fontSize: 18,
  } as TextStyle,

  searchItemName: {
    flex: 1,
    fontSize: 16,
  } as TextStyle,

  // Categories Section
  categoriesSection: {
    marginTop: 16,
  } as ViewStyle,

  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  } as TextStyle,

  categoryContainer: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  } as ViewStyle,

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  } as ViewStyle,

  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  } as TextStyle,

  categoryInfo: {
    flex: 1,
  } as ViewStyle,

  categoryName: {
    fontWeight: '600',
    marginBottom: 2,
  } as TextStyle,

  chevron: {
    fontSize: 12,
    marginLeft: 8,
  } as TextStyle,

  // Items Container
  itemsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
  } as ViewStyle,

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  } as ViewStyle,

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  itemIcon: {
    fontSize: 20,
    marginRight: 12,
  } as TextStyle,

  itemInfo: {
    flex: 1,
  } as ViewStyle,

  itemName: {
    fontWeight: '500',
  } as TextStyle,

  // Quantity Controls
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  } as ViewStyle,

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  } as ViewStyle,

  quantityButton: {
    backgroundColor: '#F3F4F6',
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  } as ViewStyle,

  quantityButtonLast: {
    borderRightWidth: 0,
  } as ViewStyle,

  quantityButtonText: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  } as TextStyle,

  quantityDisplay: {
    paddingHorizontal: 12,
    minWidth: 60,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
    textAlign: 'center',
  } as TextStyle,

  unitText: {
    fontSize: 11,
    fontWeight: '600',
  } as TextStyle,

  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } as ViewStyle,

  removeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  } as TextStyle,

  // States
  initialState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  } as ViewStyle,

  initialStateTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  } as TextStyle,

  initialStateDescription: {
    textAlign: 'center',
    lineHeight: 24,
  } as TextStyle,

  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  } as ViewStyle,

  emptyStateText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  } as TextStyle,

  // Bottom Section
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
  } as ViewStyle,

  createButton: {
    minWidth: 200,
    maxWidth: 300,
    height: 44,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  } as ViewStyle,

  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  loadingText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as TextStyle,

  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  } as ViewStyle,

  modalContent: {
    borderRadius: 20,
    padding: 24,
    margin: 24,
    width: '85%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  } as ViewStyle,

  modalTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  } as TextStyle,

  modalLabel: {
    fontWeight: '600',
    marginBottom: 8,
  } as TextStyle,

  quantitySection: {
    marginBottom: 24,
  } as ViewStyle,

  quantityInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'center',
  } as ViewStyle,

  unitSection: {
    marginBottom: 24,
  } as ViewStyle,

  unitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as ViewStyle,

  unitButton: {
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  } as ViewStyle,

  unitButtonSelected: {
    borderColor: '#4ADE80',
  } as ViewStyle,

  unitButtonText: {
    fontSize: 12,
    fontWeight: '500',
  } as TextStyle,

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  } as ViewStyle,

  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  } as ViewStyle,

  modalButtonPrimary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } as ViewStyle,

  // Duplicate Modal Styles
  duplicateMessage: {
    marginBottom: 24,
    alignItems: 'center',
  } as ViewStyle,

  duplicateText: {
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  } as TextStyle,

  // Units Scroll View - for horizontal scrolling
  unitsScrollView: {
    flexDirection: 'row',
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
  // Text input with dynamic theme colors
  textInputDynamic: (backgroundColor: string, borderColor: string, color: string) => ({
    backgroundColor,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor,
    color,
  }),

  // Search dropdown with dynamic background
  searchDropdownDynamic: (backgroundColor: string) => ({
    backgroundColor,
  }),

  // Category container with dynamic background
  categoryContainerDynamic: (backgroundColor: string) => ({
    backgroundColor,
  }),

  // Modal content with dynamic background
  modalContentDynamic: (backgroundColor: string) => ({
    backgroundColor,
  }),

  // Bottom section with dynamic background
  bottomSectionDynamic: (backgroundColor: string) => ({
    backgroundColor,
  }),

  // Quantity input with dynamic colors
  quantityInputDynamic: (backgroundColor: string, borderColor: string, color: string) => ({
    backgroundColor,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor,
    textAlign: 'center' as const,
    color,
  }),

  // Quantity button with no right border
  quantityButtonNoBorder: () => ({
    borderRightWidth: 0,
  }),
});
