// ========================================
// Profile Photo Modal - Photo Upload/Management
// ========================================

import React, { useState } from 'react';
import { Alert, Image, Modal, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';

// Components
import { Typography } from '../../atoms/Typography/Typography';
import { Button } from '../../atoms/Button/Button';

// Hooks and Utils
import { useTheme } from '../../../providers/ThemeProvider';

// Redux
import type { AppDispatch } from '../../../../application/store';
import {
  removeAvatar,
  selectIsLoading,
  selectUser,
  uploadAvatar,
} from '../../../../application/store/slices/authSlice';

// ========================================
// Types
// ========================================

export interface ProfilePhotoModalProps {
  visible: boolean;
  onClose: () => void;
}

// ========================================
// Profile Photo Modal Component
// ========================================

export const ProfilePhotoModal: React.FC<ProfilePhotoModalProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme } = useTheme();

  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);

  const [isProcessing, setIsProcessing] = useState(false);

  // Request permissions
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to update your profile photo.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Handle photo selection from library
  const handleSelectFromLibrary = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  // Handle photo capture from camera
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need access to your camera to take a profile photo.', [
        { text: 'OK' },
      ]);
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  // Upload photo to server
  const uploadPhoto = async (uri: string) => {
    setIsProcessing(true);

    try {
      console.log('📸 Preparing to upload photo from URI:', uri);

      // Create React Native file object
      const file = {
        uri,
        type: 'image/jpeg', // Default to JPEG
        name: 'avatar.jpg',
      };

      console.log('📸 File object prepared:', file);

      const result = await dispatch(uploadAvatar(file));

      if (uploadAvatar.fulfilled.match(result)) {
        Alert.alert('Success', 'Profile photo updated successfully!');
        onClose();
      } else {
        throw new Error((result.payload as any)?.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('❌ Error uploading photo:', error);
      Alert.alert('Error', error.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle photo removal
  const handleRemovePhoto = () => {
    Alert.alert('Remove Photo', 'Are you sure you want to remove your profile photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setIsProcessing(true);
          try {
            const result = await dispatch(removeAvatar());
            if (removeAvatar.fulfilled.match(result)) {
              Alert.alert('Success', 'Profile photo removed successfully!');
              onClose();
            } else {
              throw new Error((result.payload as any)?.message || 'Remove failed');
            }
          } catch (error: any) {
            console.error('Error removing photo:', error);
            Alert.alert('Error', error.message || 'Failed to remove photo. Please try again.');
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  // Comprehensive theme fallback
  const safeTheme = {
    colors: {
      background: {
        primary: (theme?.colors as any)?.background?.primary || '#ffffff',
      },
      text: {
        primary: theme?.colors?.text?.primary || '#000000',
        secondary: theme?.colors?.text?.secondary || '#666666',
      },
      border: {
        primary: theme?.colors?.border?.primary || '#e5e5e5',
      },
      primary: {
        '500': theme?.colors?.primary?.['500'] || '#22c55e',
      },
      semantic: {
        error: {
          '500': theme?.colors?.semantic?.error?.['500'] || '#ef4444',
        },
      },
    },
  };

  return (
    <Modal visible={visible} animationType='slide' transparent onRequestClose={onClose}>
      {/* Overlay */}
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />
      </View>

      {/* Modal Content */}
      <View
        style={[styles.modalContainer, { backgroundColor: safeTheme.colors.background.primary }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: safeTheme.colors.border.primary }]}>
          <Typography variant='h4' color={safeTheme.colors.text.primary} style={styles.headerTitle}>
            Profile Photo
          </Typography>

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            disabled={isProcessing || isLoading}>
            <Typography variant='h5' color={safeTheme.colors.text.secondary}>
              ✕
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Current Photo */}
        {user?.avatar && (
          <View style={styles.currentPhotoContainer}>
            <Image source={{ uri: user.avatar }} style={styles.currentPhoto} resizeMode='cover' />
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title='📷 Take Photo'
            variant='outline'
            size='lg'
            onPress={handleTakePhoto}
            disabled={isProcessing || isLoading}
            style={styles.actionButton}
          />

          <Button
            title='🖼️ Choose from Library'
            variant='outline'
            size='lg'
            onPress={handleSelectFromLibrary}
            disabled={isProcessing || isLoading}
            style={styles.actionButton}
          />

          {user?.avatar && (
            <Button
              title='🗑️ Remove Photo'
              variant='outline'
              size='lg'
              onPress={handleRemovePhoto}
              disabled={isProcessing || isLoading}
              style={[styles.actionButton, { borderColor: safeTheme.colors.semantic.error['500'] }]}
            />
          )}
        </View>

        {/* Loading State */}
        {(isProcessing || isLoading) && (
          <View style={styles.loadingContainer}>
            <Typography
              variant='body1'
              color={safeTheme.colors.text.secondary}
              style={styles.loadingText}>
              {isProcessing ? 'Processing...' : 'Loading...'}
            </Typography>
          </View>
        )}
      </View>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
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
  headerTitle: {
    fontWeight: '600' as const,
  },
  closeButton: {
    padding: 8,
    marginRight: -8,
  },
  currentPhotoContainer: {
    alignItems: 'center' as const,
    paddingVertical: 24,
  },
  currentPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center' as const,
    paddingVertical: 16,
  },
  loadingText: {
    textAlign: 'center' as const,
  },
};
