// ========================================
// Smart Receipt Sharing Hook - Enhanced PDF/Image Support
// ========================================

import { useState } from 'react';
import { Alert } from 'react-native';
import type { ShoppingList } from '../../../../shared/types/lists';
import {
  SmartReceiptSharingService,
  type SmartSharingOptions,
} from '../services/smartReceiptSharingService';
import { ReceiptUtils } from '../utils/receiptUtils';

export interface UseSmartReceiptSharingReturn {
  isGenerating: boolean;
  isSharing: boolean;
  shareReceipt: (options?: SmartSharingOptions) => Promise<void>;
  canShare: boolean;
  sharingAnalysis: ReturnType<typeof SmartReceiptSharingService.analyzeSharing> | null;
  sharingStats: ReturnType<typeof SmartReceiptSharingService.getSharingStats> | null;
}

export const useSmartReceiptSharing = (
  list: ShoppingList | null,
  totalSpent: number,
  spendingSummary: Record<string, { amount: number; items: number }>,
  getCollaboratorName: (userId: string) => string
): UseSmartReceiptSharingReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Calculate sharing info
  const canShare = !!(list && ReceiptUtils.hasReceiptData(list));
  const sharingAnalysis = list ? SmartReceiptSharingService.analyzeSharing(list) : null;
  const sharingStats = list ? SmartReceiptSharingService.getSharingStats(list) : null;

  /**
   * Smart sharing with automatic method selection
   */
  const shareReceipt = async (options: SmartSharingOptions = {}): Promise<void> => {
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
      console.log('🤖 Starting smart receipt sharing...');

      await SmartReceiptSharingService.shareReceipt(
        list,
        totalSpent,
        spendingSummary,
        getCollaboratorName,
        options
      );

      console.log('✅ Smart receipt sharing completed');
    } catch (error: any) {
      console.error('❌ Smart receipt sharing failed:', error);

      Alert.alert('Sharing Failed', 'Unable to share the receipt. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      setIsGenerating(false);
      setIsSharing(false);
    }
  };

  return {
    isGenerating,
    isSharing,
    shareReceipt,
    canShare,
    sharingAnalysis,
    sharingStats,
  };
};
