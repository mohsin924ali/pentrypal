// ========================================
// Consult Contributors Modal Component
// ========================================

import React, { type FC, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { Typography } from '../../atoms/Typography/Typography';
import { Button } from '../../atoms/Button/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import { getAvatarProps, getFallbackAvatar } from '../../../../shared/utils/avatarUtils';
import type { ButtonImageIcon } from '../../../../shared/types/ui';

// ========================================
// Component Props Interface
// ========================================

export interface Contributor {
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly phone?: string;
  readonly avatar?: string;
  readonly role: 'owner' | 'editor' | 'viewer';
}

export interface ConsultContributorsModalProps {
  readonly visible: boolean;
  readonly contributors: Contributor[];
  readonly listName: string;
  readonly onDismiss: () => void;
  readonly testID?: string;
}

// ========================================
// Consult Contributors Modal Component
// ========================================

export const ConsultContributorsModal: FC<ConsultContributorsModalProps> = ({
  visible,
  contributors,
  listName,
  onDismiss,
  testID = 'consult-contributors-modal',
}) => {
  const { theme } = useTheme();

  // Animation states
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));

  // Safe theme with comprehensive fallbacks
  const safeTheme = {
    colors: {
      primary: theme?.colors?.primary || { '500': '#22c55e' },
      text: theme?.colors?.text || {
        primary: '#000000',
        secondary: '#666666',
        tertiary: '#999999',
      },
      background: (theme?.colors as any)?.background || { primary: '#ffffff' },
      surface: theme?.colors?.surface || { background: '#ffffff', card: '#ffffff' },
      border: theme?.colors?.border || { primary: '#e5e5e5' },
      semantic: theme?.colors?.semantic || {
        error: { '500': '#ef4444' },
        success: { '500': '#22c55e' },
        info: { '600': '#3b82f6' },
      },
    },
    spacing: theme?.spacing || { sm: 8, md: 16, lg: 24 },
  };

  // Handle modal animations
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  // ========================================
  // Handlers
  // ========================================

  const handleCallContributor = async (contributor: Contributor) => {
    if (!contributor.phone) {
      Alert.alert(
        'No Phone Number',
        `${contributor.name} doesn't have a phone number registered.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      const phoneUrl = `tel:${contributor.phone}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);

      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Cannot Make Call', 'Your device does not support phone calls.', [
          { text: 'OK', style: 'default' },
        ]);
      }
    } catch (error) {
      console.error('Error opening phone dialer:', error);
      Alert.alert('Error', 'Unable to open phone dialer. Please try again.', [
        { text: 'OK', style: 'default' },
      ]);
    }
  };

  const handleBackdropPress = () => {
    onDismiss();
  };

  // ========================================
  // Render Methods
  // ========================================

  const renderContributor = (contributor: Contributor) => {
    const roleColor = {
      owner: safeTheme.colors.semantic.success['500'],
      editor: safeTheme.colors.primary['500'],
      viewer: safeTheme.colors.semantic.info['600'],
    }[contributor.role];

    const roleLabel = {
      owner: 'Owner',
      editor: 'Editor',
      viewer: 'Viewer',
    }[contributor.role];

    return (
      <View
        key={contributor.id}
        style={[
          styles.contributorItem,
          {
            backgroundColor: safeTheme.colors.surface.card,
            borderColor: safeTheme.colors.border.primary,
          },
        ]}>
        <View style={styles.contributorInfo}>
          {/* Avatar */}
          <View style={[styles.contributorAvatar, { backgroundColor: roleColor }]}>
            {contributor.avatar ? (
              <Image
                source={{ uri: contributor.avatar }}
                style={styles.contributorAvatarImage as any}
                resizeMode='cover'
              />
            ) : (
              <Typography variant='h6' style={{ color: '#ffffff' }}>
                {contributor.name?.charAt(0)?.toUpperCase() || '?'}
              </Typography>
            )}
          </View>

          {/* Contributor Details */}
          <View style={styles.contributorDetails}>
            <Typography
              variant='h6'
              color={safeTheme.colors.text.primary}
              style={styles.contributorName}>
              {contributor.name}
            </Typography>
            <Typography variant='body2' color={roleColor} style={styles.contributorRole}>
              {roleLabel}
            </Typography>
            {contributor.phone && (
              <Typography
                variant='caption'
                color={safeTheme.colors.text.secondary}
                style={styles.contributorContact}>
                {contributor.phone}
              </Typography>
            )}
          </View>
        </View>

        {/* Call Button */}
        <TouchableOpacity
          onPress={() => handleCallContributor(contributor)}
          disabled={!contributor.phone}
          style={[
            styles.callButton,
            { backgroundColor: safeTheme.colors.primary['500'] },
            !contributor.phone && styles.disabledButton,
          ]}>
          <Typography variant='caption' style={styles.callButtonText}>
            {contributor.phone ? 'Call' : 'No Phone'}
          </Typography>
        </TouchableOpacity>
      </View>
    );
  };

  // ========================================
  // Render
  // ========================================

  const renderContent = () => {
    if (!contributors || contributors.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Typography variant='h5' color={safeTheme.colors.text.secondary} style={styles.emptyIcon}>
            📞
          </Typography>
          <Typography
            variant='h6'
            color={safeTheme.colors.text.secondary}
            style={styles.emptyTitle}>
            No Contributors
          </Typography>
          <Typography
            variant='body2'
            color={safeTheme.colors.text.tertiary}
            style={styles.emptySubtitle}>
            This list doesn't have any contributors to contact
          </Typography>
        </View>
      );
    }

    return (
      <ScrollView style={styles.contributorsList} showsVerticalScrollIndicator={false}>
        {contributors.map(renderContributor)}
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType='none'
      transparent
      statusBarTranslucent
      onRequestClose={onDismiss}
      testID={testID}>
      {/* Overlay */}
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onDismiss} />
      </Animated.View>

      {/* Modal Container */}
      <Animated.View
        style={
          [
            styles.modalContainer,
            {
              backgroundColor: safeTheme.colors.background.primary,
              transform: [{ translateY: slideAnim }],
            },
          ] as any
        }>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: safeTheme.colors.border.primary }]}>
          <View style={styles.headerContent}>
            <Typography
              variant='h4'
              color={safeTheme.colors.text.primary}
              style={styles.headerTitle}>
              Consult Contributors
            </Typography>
            <Typography
              variant='body2'
              color={safeTheme.colors.text.secondary}
              style={styles.headerSubtitle}>
              {listName}
            </Typography>
          </View>

          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Typography variant='h5' color={safeTheme.colors.text.secondary}>
              ✕
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>{renderContent()}</View>
      </Animated.View>
    </Modal>
  );
};

// ========================================
// Styles
// ========================================

const styles = {
  overlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontStyle: 'italic' as const,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: '600' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  emptySubtitle: {
    textAlign: 'center' as const,
    paddingHorizontal: 32,
  },
  contributorsList: {
    flex: 1,
    paddingTop: 16,
  },
  contributorItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contributorInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  contributorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 16,
    overflow: 'hidden' as const,
  },
  contributorAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  contributorDetails: {
    flex: 1,
  },
  contributorName: {
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  contributorRole: {
    marginBottom: 4,
    fontWeight: '600' as const,
  },
  contributorContact: {
    fontSize: 12,
  },
  callButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  disabledButton: {
    opacity: 0.6,
  },
  callButtonText: {
    fontWeight: '600' as const,
    fontSize: 12,
    color: '#ffffff',
  },
};
