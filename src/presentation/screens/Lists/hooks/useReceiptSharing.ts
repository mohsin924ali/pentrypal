// ========================================
// Receipt Sharing Hook
// ========================================

import { useRef, useState } from 'react';
import { Alert } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { ImageGenerationService } from '../services/imageGenerationService';
import { ImprovedImageService } from '../services/improvedImageService';
import { FileBasedSharing } from '../services/fileBasedSharing';
import { ReceiptUtils } from '../utils/receiptUtils';
import type { ShoppingList } from '../../../../shared/types/lists';

export interface UseReceiptSharingReturn {
  isGenerating: boolean;
  isSharing: boolean;
  viewShotRef: React.RefObject<ViewShot>;
  shareReceipt: () => Promise<void>;
  canShare: boolean;
}

export const useReceiptSharing = (
  list: ShoppingList | null,
  totalSpent: number,
  spendingSummary: Record<string, { amount: number; items: number }>
): UseReceiptSharingReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const viewShotRef = useRef<ViewShot>(null);

  const canShare = !!(list && ReceiptUtils.hasReceiptData(list));

  const shareReceipt = async (): Promise<void> => {
    if (!list || !canShare) {
      Alert.alert(
        'Cannot Share Receipt',
        'This list does not have enough data to generate a receipt.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsGenerating(true);

      console.log('📱 Starting receipt generation and sharing...');

      // Test ViewShot first
      const viewShotWorking = await ImprovedImageService.testViewShot(viewShotRef);
      console.log('🔍 ViewShot status:', viewShotWorking);

      // Generate receipt image
      console.log('📸 Generating receipt image...');
      const imageUri = await ImprovedImageService.captureWithRetry(viewShotRef, 3);

      setIsGenerating(false);
      setIsSharing(true);

      // THE ACTUAL FIX: Proper file-based sharing that ACTUALLY ATTACHES THE IMAGE
      console.log('\n🎯 USING PROPER FILE ATTACHMENT SHARING');
      console.log('This will ACTUALLY attach the image file to the message!');
      console.log('🔍 DEBUG: About to call FileBasedSharing.shareWithMultipleFallbacks');
      console.log('🔍 DEBUG: FileBasedSharing object:', FileBasedSharing);

      try {
        // Use file-based sharing that actually works
        await FileBasedSharing.shareWithMultipleFallbacks(imageUri);
      } catch (sharingError) {
        console.log('❌ All file sharing methods failed:', sharingError);
        Alert.alert(
          'Sharing Failed',
          'Unable to attach the receipt image. The image was generated but sharing has technical limitations.',
          [{ text: 'OK' }]
        );
      }

      // Cleanup
      setTimeout(() => {
        ImageGenerationService.cleanupImage(imageUri);
      }, 5000); // Give time for sharing to complete

      console.log('✅ Receipt sharing process completed');
    } catch (error: any) {
      console.error('❌ Receipt sharing failed:', error);

      Alert.alert(
        'Sharing Failed',
        'Unable to generate or share the receipt image. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
      setIsSharing(false);
    }
  };

  return {
    isGenerating,
    isSharing,
    viewShotRef,
    shareReceipt,
    canShare,
  };
};
