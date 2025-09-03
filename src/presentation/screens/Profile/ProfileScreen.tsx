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

// Styles
import { baseStyles, createDynamicStyles, createThemedStyles } from './ProfileScreen.styles';

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

  // Create themed styles
  const themedStyles = createThemedStyles(theme);
  const dynamicStyles = createDynamicStyles(theme);

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
    <View key={item.id} style={themedStyles.settingItem}>
      <View style={baseStyles.settingContent}>
        <View style={baseStyles.settingIcon}>
          <Typography variant='h6' style={{ fontSize: 20 }}>
            {item.icon}
          </Typography>
        </View>

        <View style={baseStyles.settingInfo}>
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
    <SafeAreaView style={[baseStyles.container, themedStyles.themedContainer]}>
      <ScrollView
        style={baseStyles.content}
        contentContainerStyle={baseStyles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={baseStyles.header}>
          <Typography variant='h3' color={theme.colors.text.primary}>
            Profile
          </Typography>

          {!isConnected && (
            <View style={[baseStyles.offlineBadge, dynamicStyles.offlineBadgeWithTheme]}>
              <Typography variant='caption' color={theme.colors.semantic.warning[700]}>
                Offline
              </Typography>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={themedStyles.userCard}>
          <TouchableOpacity
            style={[baseStyles.avatar, themedStyles.avatarWithTheme]}
            onPress={() => setShowPhotoModal(true)}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={baseStyles.avatarImage as any}
                resizeMode='cover'
              />
            ) : (
              <Typography variant='h3' color={theme.colors.primary[600]}>
                {user?.name?.charAt(0) || 'U'}
              </Typography>
            )}

            {/* Camera overlay */}
            <View style={themedStyles.cameraOverlay}>
              <Typography variant='caption' style={themedStyles.cameraIcon}>
                📷
              </Typography>
            </View>
          </TouchableOpacity>

          <View style={baseStyles.userInfo}>
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
        <View style={baseStyles.section}>
          <Typography
            variant='h5'
            color={theme.colors.text.primary}
            style={dynamicStyles.sectionHeaderSpacing}>
            Account
          </Typography>

          {accountSettings.map(renderSettingItem)}
        </View>

        {/* Security Settings */}
        <View style={baseStyles.section}>
          <Typography
            variant='h5'
            color={theme.colors.text.primary}
            style={dynamicStyles.sectionHeaderSpacing}>
            Security
          </Typography>

          {securityItems.map(renderSettingItem)}
        </View>

        {/* App Settings */}
        <View style={baseStyles.section}>
          <Typography
            variant='h5'
            color={theme.colors.text.primary}
            style={dynamicStyles.sectionHeaderSpacing}>
            Preferences
          </Typography>

          {appSettings.map(renderSettingItem)}
        </View>

        {/* Support */}
        <View style={baseStyles.section}>
          <Typography
            variant='h5'
            color={theme.colors.text.primary}
            style={dynamicStyles.sectionHeaderSpacing}>
            Support
          </Typography>

          {supportItems.map(renderSettingItem)}
        </View>

        {/* Logout */}
        <View style={baseStyles.section}>
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
        <View style={baseStyles.versionContainer}>
          <Typography variant='caption' color={theme.colors.text.tertiary} align='center'>
            PentryPal v1.0.0
          </Typography>
          <Typography variant='caption' color={theme.colors.text.tertiary} align='center'>
            Built with ❤️ for better grocery management
          </Typography>
        </View>

        {/* Bottom spacing */}
        <View style={dynamicStyles.bottomSpacing} />
      </ScrollView>

      {/* Profile Photo Modal */}
      <ProfilePhotoModal visible={showPhotoModal} onClose={() => setShowPhotoModal(false)} />
    </SafeAreaView>
  );
};
