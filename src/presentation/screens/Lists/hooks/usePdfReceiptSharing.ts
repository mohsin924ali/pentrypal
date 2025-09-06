// ========================================
// PDF Receipt Sharing Hook - PDF Only, No Images
// ========================================

import { useState } from 'react';
import { Alert } from 'react-native';
import type { ShoppingList } from '../../../../shared/types/lists';
import { PdfGenerationService } from '../services/pdfGenerationService';
import { ReceiptUtils } from '../utils/receiptUtils';

export interface UsePdfReceiptSharingReturn {
  isGenerating: boolean;
  isSharing: boolean;
  shareReceipt: () => Promise<void>;
  canShare: boolean;
}

export const usePdfReceiptSharing = (
  list: ShoppingList | null,
  totalSpent: number,
  spendingSummary: Record<string, { amount: number; items: number }>,
  getCollaboratorName: (userId: string) => string
): UsePdfReceiptSharingReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

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
      console.log('📄 Starting PDF receipt generation and sharing...');

      // Generate PDF receipt
      const pdfUri = await PdfGenerationService.generateReceipt(
        list,
        totalSpent,
        spendingSummary,
        getCollaboratorName,
        {
          itemsPerPage: 15,
          includeHeader: true,
          includeFooter: true,
        }
      );

      setIsGenerating(false);
      setIsSharing(true);

      // Share PDF receipt
      await PdfGenerationService.shareReceipt(pdfUri, list.name);

      // Cleanup after delay
      setTimeout(() => {
        PdfGenerationService.cleanupPdf(pdfUri);
      }, 15000);

      console.log('✅ PDF receipt shared successfully');
    } catch (error: any) {
      console.error('❌ PDF receipt sharing failed:', error);

      Alert.alert(
        'Sharing Failed',
        'Unable to generate or share the PDF receipt. Please try again.',
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
    shareReceipt,
    canShare,
  };
};
