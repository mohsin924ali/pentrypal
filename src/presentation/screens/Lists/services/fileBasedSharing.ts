// ========================================
// File-Based Sharing Service
// PROPER file attachment sharing for images
// ========================================

import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export class FileBasedSharing {
  /**
   * Simple and reliable image sharing without gallery complications
   * Focus on direct file sharing that actually works
   */
  static async shareImageDirectly(imageUri: string): Promise<void> {
    console.log('📱 DEBUG: FileBasedSharing.shareImageDirectly called!');
    console.log('📱 DIRECT IMAGE SHARING - COPYING TO ACCESSIBLE LOCATION');
    console.log('📱 Original URI:', imageUri);
    console.log('📱 Platform:', Platform.OS);

    try {
      // Verify the file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }
      console.log('✅ File verified:', fileInfo.size, 'bytes');

      // CRITICAL FIX: Copy file to accessible location for other apps
      const fileName = `receipt_${Date.now()}.png`;
      const accessibleUri = `${FileSystem.documentDirectory}${fileName}`;

      console.log('📋 COPYING FILE TO ACCESSIBLE LOCATION FOR OTHER APPS');
      console.log('📋 From:', imageUri);
      console.log('📋 To:', accessibleUri);

      await FileSystem.copyAsync({
        from: imageUri,
        to: accessibleUri,
      });

      // Verify copied file
      const copiedFileInfo = await FileSystem.getInfoAsync(accessibleUri);
      if (!copiedFileInfo.exists) {
        throw new Error('Failed to copy image to accessible location');
      }
      console.log('✅ File copied successfully:', copiedFileInfo.size, 'bytes');

      // Use Expo Sharing API - designed for proper file sharing
      console.log('📱 Using Expo Sharing API for reliable file sharing...');

      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(accessibleUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Shopping Receipt',
        UTI: 'public.png',
      });

      console.log('✅ Expo sharing completed - image should be attached!');

      // Show success message
      Alert.alert('Receipt Shared!', 'Your receipt image has been shared successfully!', [
        { text: 'OK' },
      ]);

      // Clean up copied file after sharing
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(accessibleUri);
          console.log('🧹 Cleaned up copied file');
        } catch (e) {
          console.log('⚠️ Cleanup failed:', e);
        }
      }, 5000);
    } catch (error) {
      console.error('❌ Direct image sharing failed:', error);

      Alert.alert(
        'Sharing Failed',
        'Unable to share the receipt image. Please try again or check your device settings.',
        [{ text: 'OK' }]
      );

      throw error;
    }
  }

  /**
   * Direct file sharing - simplified fallback using Expo Sharing
   */
  static async shareDirectFile(imageUri: string): Promise<void> {
    console.log('📁 FALLBACK: Direct file sharing with Expo Sharing');
    console.log('📁 Image URI:', imageUri);

    try {
      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }

      // Use Expo Sharing directly with original file
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(imageUri, {
        mimeType: 'image/png',
        dialogTitle: 'Share Shopping Receipt',
        UTI: 'public.png',
      });

      console.log('✅ Fallback sharing completed');
    } catch (error) {
      console.error('❌ Fallback sharing failed:', error);
      throw error;
    }
  }

  /**
   * Main sharing method - uses the most reliable approach
   */
  static async shareWithMultipleFallbacks(imageUri: string): Promise<void> {
    console.log('🔄 DEBUG: FileBasedSharing.shareWithMultipleFallbacks called!');
    console.log('🔄 USING RELIABLE DIRECT SHARING APPROACH...');

    try {
      // Use the new simplified direct sharing method
      await this.shareImageDirectly(imageUri);
      console.log('✅ Image sharing completed successfully!');
    } catch (error) {
      console.error('❌ Primary sharing method failed, trying fallback...');

      // If the direct method fails, try the fallback
      try {
        await this.shareDirectFile(imageUri);
        console.log('✅ Fallback sharing succeeded!');
      } catch (fallbackError) {
        console.error('❌ All sharing methods failed:', fallbackError);
        throw new Error('All sharing methods failed');
      }
    }
  }
}
