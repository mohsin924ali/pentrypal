// ========================================
// Profile Screen Styles
// ========================================

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '../../../shared/types/ui';

/**
 * Base styles that don't depend on theme
 */
export const baseStyles = StyleSheet.create({
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
    overflow: 'hidden',
  } as ViewStyle,
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  } as ViewStyle,
  container: {
    flex: 1,
  } as ViewStyle,
  content: {
    flex: 1,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 24,
  } as ViewStyle,
  offlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  } as ViewStyle,
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  } as ViewStyle,
  section: {
    marginBottom: 32,
  } as ViewStyle,
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  } as ViewStyle,
  settingIcon: {
    marginRight: 12,
  } as ViewStyle,
  settingInfo: {
    flex: 1,
  } as ViewStyle,
  userInfo: {
    flex: 1,
  } as ViewStyle,
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
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

  // User card with theme colors and shadows
  userCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
    backgroundColor: theme.colors.surface.card,
    borderColor: theme.colors.border.primary,
    shadowColor: theme.colors.neutral[900] || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,

  // Avatar with theme background
  avatarWithTheme: {
    backgroundColor: theme.colors.primary[100],
  } as ViewStyle,

  // Camera overlay with themed colors
  cameraOverlay: {
    position: 'absolute' as const,
    bottom: -2,
    right: -2,
    backgroundColor: theme.colors.surface.background || '#ffffff',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    elevation: 2,
    shadowColor: theme.colors.neutral[900] || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  } as ViewStyle,

  cameraIcon: {
    fontSize: 10,
  } as TextStyle,

  // Setting item with theme colors and shadows
  settingItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    backgroundColor: theme.colors.surface.card,
    borderColor: theme.colors.border.primary,
    shadowColor: theme.colors.neutral[900] || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  } as ViewStyle,
});

/**
 * Create dynamic inline styles for specific use cases
 */
export const createDynamicStyles = (theme: any) => ({
  // Offline badge with warning colors
  offlineBadgeWithTheme: {
    backgroundColor: theme.colors.semantic.warning[100],
  } as ViewStyle,

  // Section header with bottom margin
  sectionHeaderSpacing: {
    marginBottom: theme.spacing?.md || 16,
  } as ViewStyle,

  // Bottom spacing for scrollview
  bottomSpacing: {
    height: theme.spacing?.xl || 24,
  } as ViewStyle,

  // Dynamic setting item with theme colors
  createThemedSettingItem: (isToggle: boolean = false) =>
    ({
      backgroundColor: isToggle ? theme.colors.primary[50] : theme.colors.surface.card,
    }) as ViewStyle,
});
