// ========================================
// Profile Screen - User Settings & Profile
// ========================================

import React, { useState } from 'react';
import { Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';
import { ProfilePhotoModal } from '../../components/molecules/ProfilePhotoModal';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';
import { useNetwork } from '../../providers/NetworkProvider';

// Store
import type { AppDispatch, RootState } from '../../../application/store';
import {
  logoutUser,
  selectSecuritySettings,
  selectUser,
} from '../../../application/store/slices/authSlice';

// Types
export type ProfileScreenProps = Record<string, never>;

interface SettingItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  type: 'navigation' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
}

/**
 * Profile Screen Component
 *
 * User profile and settings with:
 * - User information display
 * - Account settings
 * - Privacy controls
 * - Notification preferences
 * - Security settings
 * - App preferences
 * - Help and support
 */
export const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const { theme, toggleTheme, themeMode } = useTheme();
  const { isConnected } = useNetwork();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => selectUser(state));
  const securitySettings = useSelector((state: RootState) => selectSecuritySettings(state));

  // Modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Handle logout
  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          dispatch(logoutUser());
        },
      },
    ]);
  };

  // Settings data
  const accountSettings: SettingItem[] = [
    {
      id: 'edit_profile',
      title: 'Edit Profile',
      description: 'Name, email, and personal information',
      icon: '👤',
      type: 'navigation',
      onPress: () => console.log('Edit profile'),
    },
    {
      id: 'change_password',
      title: 'Change Password',
      description: 'Update your account password',
      icon: '🔒',
      type: 'navigation',
      onPress: () => console.log('Change password'),
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      description: 'Control who can see your information',
      icon: '🛡️',
      type: 'navigation',
      onPress: () => console.log('Privacy settings'),
    },
  ];

  const appSettings: SettingItem[] = [
    {
      id: 'theme',
      title: 'Theme',
      description: `Currently: ${themeMode}`,
      icon: '🎨',
      type: 'action',
      onPress: toggleTheme,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage notification preferences',
      icon: '🔔',
      type: 'navigation',
      onPress: () => console.log('Notification settings'),
    },
    {
      id: 'language',
      title: 'Language',
      description: 'English (US)',
      icon: '🌐',
      type: 'navigation',
      onPress: () => console.log('Language settings'),
    },
  ];

  const securityItems: SettingItem[] = [
    {
      id: 'biometric',
      title: 'Biometric Authentication',
      description: securitySettings.isBiometricEnabled ? 'Enabled' : 'Disabled',
      icon: '👆',
      type: 'toggle',
      value: securitySettings.isBiometricEnabled,
      onPress: () => console.log('Toggle biometric'),
    },
    {
      id: 'two_factor',
      title: 'Two-Factor Authentication',
      description: securitySettings.isTwoFactorEnabled ? 'Enabled' : 'Disabled',
      icon: '🔐',
      type: 'toggle',
      value: securitySettings.isTwoFactorEnabled,
      onPress: () => console.log('Toggle 2FA'),
    },
    {
      id: 'sessions',
      title: 'Active Sessions',
      description: 'Manage your active sessions',
      icon: '📱',
      type: 'navigation',
      onPress: () => console.log('Manage sessions'),
    },
  ];

  const supportItems: SettingItem[] = [
    {
      id: 'help',
      title: 'Help Center',
      description: 'Get help and find answers',
      icon: '❓',
      type: 'navigation',
      onPress: () => console.log('Help center'),
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      description: 'Help us improve the app',
      icon: '💬',
      type: 'navigation',
      onPress: () => console.log('Send feedback'),
    },
    {
      id: 'about',
      title: 'About',
      description: 'App version and information',
      icon: 'ℹ️',
      type: 'navigation',
      onPress: () => console.log('About app'),
    },
  ];

  // Render setting item
  const renderSettingItem = (item: SettingItem) => (
    <View
      key={item.id}
      style={[
        styles.settingItem,
        {
          backgroundColor: theme.colors.surface.card,
          borderColor: theme.colors.border.primary,
        },
      ]}>
      <View style={styles.settingContent}>
        <View style={styles.settingIcon}>
          <Typography variant='h6' style={{ fontSize: 20 }}>
            {item.icon}
          </Typography>
        </View>

        <View style={styles.settingInfo}>
          <Typography variant='h6' color={theme.colors.text.primary}>
            {item.title}
          </Typography>

          {item.description && (
            <Typography variant='body2' color={theme.colors.text.secondary}>
              {item.description}
            </Typography>
          )}
        </View>

        {item.type === 'navigation' && (
          <Typography variant='h6' color={theme.colors.text.tertiary}>
            →
          </Typography>
        )}

        {item.type === 'toggle' && (
          <Button
            title={item.value ? '✅' : '☐'}
            variant='ghost'
            size='sm'
            onPress={item.onPress || (() => {})}
          />
        )}

        {item.type === 'action' && (
          <Button title='⚙️' variant='ghost' size='sm' onPress={item.onPress || (() => {})} />
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant='h3' color={theme.colors.text.primary}>
            Profile
          </Typography>

          {!isConnected && (
            <View
              style={[
                styles.offlineBadge,
                { backgroundColor: theme.colors.semantic.warning[100] },
              ]}>
              <Typography variant='caption' color={theme.colors.semantic.warning[700]}>
                Offline
              </Typography>
            </View>
          )}
        </View>

        {/* User Info */}
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: theme.colors.surface.card,
              borderColor: theme.colors.border.primary,
            },
          ]}>
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: theme.colors.primary[100] }]}
            onPress={() => setShowPhotoModal(true)}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatarImage as any}
                resizeMode='cover'
              />
            ) : (
              <Typography variant='h3' color={theme.colors.primary[600]}>
                {user?.name?.charAt(0) || 'U'}
              </Typography>
            )}

            {/* Camera overlay */}
            <View style={styles.cameraOverlay}>
              <Typography variant='caption' style={styles.cameraIcon}>
                📷
              </Typography>
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Typography variant='h4' color={theme.colors.text.primary}>
              {user?.name || 'User'}
            </Typography>

            <Typography variant='body1' color={theme.colors.text.secondary}>
              {user?.email || 'user@example.com'}
            </Typography>

            <Typography variant='caption' color={theme.colors.text.tertiary}>
              Member since {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString()}
            </Typography>
          </View>

          <Button
            title='✏️'
            variant='ghost'
            size='sm'
            onPress={() => console.log('Edit profile')}
          />
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Typography
            variant='h5'
            color={theme.colors.text.primary}
            style={{ marginBottom: theme.spacing.md }}>
            Account
          </Typography>

          {accountSettings.map(renderSettingItem)}
        </View>

        {/* Security Settings */}
        <View style={styles.section}>
          <Typography
            variant='h5'
            color={theme.colors.text.primary}
            style={{ marginBottom: theme.spacing.md }}>
            Security
          </Typography>

          {securityItems.map(renderSettingItem)}
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Typography
            variant='h5'
            color={theme.colors.text.primary}
            style={{ marginBottom: theme.spacing.md }}>
            Preferences
          </Typography>

          {appSettings.map(renderSettingItem)}
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Typography
            variant='h5'
            color={theme.colors.text.primary}
            style={{ marginBottom: theme.spacing.md }}>
            Support
          </Typography>

          {supportItems.map(renderSettingItem)}
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Button
            title='Sign Out'
            variant='destructive'
            size='lg'
            fullWidth
            onPress={handleLogout}
            leftIcon={{
              type: 'image',
              source: require('../../../assets/images/logout.png'),
              size: 18,
            }}
          />
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Typography variant='caption' color={theme.colors.text.tertiary} align='center'>
            PentryPal v1.0.0
          </Typography>
          <Typography variant='caption' color={theme.colors.text.tertiary} align='center'>
            Built with ❤️ for better grocery management
          </Typography>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>

      {/* Profile Photo Modal */}
      <ProfilePhotoModal visible={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
    </SafeAreaView>
  );
};

// ========================================
// Styles
// ========================================

const styles = {
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    marginBottom: 24,
  },
  offlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 16,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  cameraOverlay: {
    position: 'absolute' as const,
    bottom: -2,
    right: -2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cameraIcon: {
    fontSize: 10,
  },
  userInfo: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  settingItem: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  versionContainer: {
    alignItems: 'center' as const,
    marginTop: 24,
  },
};
