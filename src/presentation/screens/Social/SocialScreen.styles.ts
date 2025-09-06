// ========================================
// Social Screen Styles
// ========================================

import { StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '../../../shared/types/ui';

/**
 * Base styles that don't depend on theme
 */
export const baseStyles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  } as ViewStyle,
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  } as ViewStyle,
  badge: {
    position: 'absolute',
    top: -8,
    right: 8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  } as ViewStyle,
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 16,
  } as TextStyle,
  container: {
    flex: 1,
  } as ViewStyle,
  content: {
    flex: 1,
  } as ViewStyle,
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  } as ViewStyle,
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  } as ViewStyle,
  friendActions: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  friendCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  friendDetails: {
    flex: 1,
  } as ViewStyle,
  friendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,
  friendRequestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  } as ViewStyle,
  friendRequestButton: {
    minWidth: 80,
  } as ViewStyle,
  friendRequestCard: {
    flexDirection: 'column',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  friendRequestDetails: {
    flex: 1,
  } as ViewStyle,
  friendRequestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  } as ViewStyle,
  notificationActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  } as ViewStyle,
  notificationButton: {
    flex: 1,
  } as ViewStyle,
  notificationCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  notificationContent: {
    flex: 1,
  } as ViewStyle,
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  notificationInfo: {
    flex: 1,
    marginLeft: 12,
  } as ViewStyle,
  statCard: {
    flex: 0.3,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  } as ViewStyle,
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  } as ViewStyle,
  tabButton: {
    flex: 1,
  } as ViewStyle,
  tabButtonContainer: {
    position: 'relative',
    flex: 1,
  } as ViewStyle,
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  } as ViewStyle,
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  } as ViewStyle,
});

/**
 * Create themed styles using the provided theme
 */
export const createThemedStyles = (theme: Theme) =>
  StyleSheet.create({
    // Theme-dependent styles will go here if needed
    // For now, most styles are theme-independent
  });

/**
 * Create dynamic styles that depend on runtime values
 */
export const createDynamicStyles = (params: {
  theme: Theme;
  // Add any dynamic parameters here
}) =>
  StyleSheet.create({
    // Dynamic styles will go here if needed
  });
