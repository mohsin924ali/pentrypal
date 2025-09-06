// ========================================
// Smart Receipt Sharing Service - Intelligent PDF/Image Selection
// ========================================

import { Alert } from 'react-native';
import type { ShoppingList } from '../../../../shared/types/lists';
import { PdfGenerationService } from './pdfGenerationService';

export interface SharingMethod {
  type: 'pdf';
  reason: string;
  estimated_pages?: number;
}

export interface SmartSharingOptions {
  pdfOptions?: {
    itemsPerPage?: number;
    includeNotes?: boolean;
  };
}

export class SmartReceiptSharingService {
  /**
   * Analyze list and provide PDF sharing info
   */
  static analyzeSharing(list: ShoppingList): SharingMethod {
    const itemCount = list.items?.length || 0;
    const collaboratorCount = (list.collaborators?.length || 0) + 1;
    const hasNotes = list.items?.some(item => item.notes && item.notes.length > 20) || false;
    const hasLongNames = list.items?.some(item => item.name.length > 30) || false;
    const hasSpendingData = list.items?.some(item => item.purchasedAmount) || false;

    // Calculate estimated PDF pages
    const itemsPerPage = 15;
    const estimatedPages = Math.ceil(Math.max(1, itemCount) / itemsPerPage);

    // Always use PDF - provide contextual reasons
    let reason = 'Professional PDF format for all receipts';

    if (itemCount > 15) {
      reason = `Large list with ${itemCount} items - PDF handles multiple pages perfectly`;
    } else if (collaboratorCount > 3) {
      reason = `Team shopping (${collaboratorCount} members) - PDF provides professional format`;
    } else if (hasNotes || hasLongNames) {
      reason = 'Detailed item information - PDF provides excellent readability';
    } else if (hasSpendingData) {
      reason = 'Spending breakdown included - PDF ideal for record keeping';
    } else if (itemCount > 0) {
      reason = `${itemCount} item${itemCount !== 1 ? 's' : ''} - PDF ensures consistent, professional sharing`;
    }

    return {
      type: 'pdf',
      reason,
      estimated_pages: estimatedPages,
    };
  }

  /**
   * PDF-only sharing
   */
  static async shareReceipt(
    list: ShoppingList,
    totalSpent: number,
    spendingSummary: Record<string, { amount: number; items: number }>,
    getCollaboratorName: (userId: string) => string,
    options: SmartSharingOptions = {}
  ): Promise<void> {
    try {
      console.log('📄 PDF Receipt Sharing - Generating professional PDF...');

      // Analyze for context
      const analysis = SmartReceiptSharingService.analyzeSharing(list);
      console.log('📊 Analysis result:', analysis);

      // Always use PDF sharing
      console.log('📄 Using PDF sharing method:', analysis.reason);
      await SmartReceiptSharingService.sharePdfReceipt(
        list,
        totalSpent,
        spendingSummary,
        getCollaboratorName,
        options.pdfOptions
      );
    } catch (error) {
      console.error('❌ PDF sharing failed:', error);

      Alert.alert('Sharing Failed', 'Unable to share the PDF receipt. Please try again.', [
        { text: 'OK' },
      ]);

      throw error;
    }
  }

  /**
   * Share receipt as PDF
   */
  private static async sharePdfReceipt(
    list: ShoppingList,
    totalSpent: number,
    spendingSummary: Record<string, { amount: number; items: number }>,
    getCollaboratorName: (userId: string) => string,
    pdfOptions?: SmartSharingOptions['pdfOptions']
  ): Promise<void> {
    try {
      console.log('📄 Generating PDF receipt...');

      const pdfUri = await PdfGenerationService.generateReceipt(
        list,
        totalSpent,
        spendingSummary,
        getCollaboratorName,
        {
          itemsPerPage: pdfOptions?.itemsPerPage || 15,
          includeFooter: true,
          includeHeader: true,
        }
      );

      console.log('📄 Sharing PDF receipt...');
      await PdfGenerationService.shareReceipt(pdfUri, list.name);

      // Cleanup after delay
      setTimeout(() => {
        PdfGenerationService.cleanupPdf(pdfUri);
      }, 15000);

      console.log('✅ PDF receipt shared successfully');
    } catch (error) {
      console.error('❌ PDF sharing failed:', error);
      throw error;
    }
  }

  /**
   * Get PDF sharing benefits for a list
   */
  static getRecommendations(list: ShoppingList): {
    recommendedMethod: 'pdf';
    analysis: SharingMethod;
    benefits: string[];
    limitations: string[];
  } {
    const analysis = SmartReceiptSharingService.analyzeSharing(list);

    const benefits = [
      'Handles unlimited items with automatic pagination',
      'Professional format suitable for business use',
      'Better readability for detailed information',
      'Consistent formatting across all devices',
      'Can include notes and detailed breakdowns',
      'Searchable text content',
      'Perfect for record keeping and accounting',
      'High-quality, scalable output',
    ];

    const limitations = [
      'Slightly larger file size than images',
      'Takes a moment longer to generate',
      'Requires PDF viewer (available on all modern devices)',
    ];

    return {
      recommendedMethod: 'pdf',
      analysis,
      benefits,
      limitations,
    };
  }

  /**
   * Get PDF sharing statistics for analytics
   */
  static getSharingStats(list: ShoppingList): {
    itemCount: number;
    collaboratorCount: number;
    estimatedPdfPages: number;
    hasDetailedInfo: boolean;
    recommendedMethod: 'pdf';
    pdfFileSize: string;
  } {
    const analysis = SmartReceiptSharingService.analyzeSharing(list);
    const itemCount = list.items?.length || 0;
    const collaboratorCount = (list.collaborators?.length || 0) + 1;

    // Estimate PDF file size (very rough)
    const estimatedKB = Math.max(50, itemCount * 2 + collaboratorCount * 5);
    const pdfFileSize =
      estimatedKB > 1000 ? `${(estimatedKB / 1000).toFixed(1)} MB` : `${estimatedKB} KB`;

    return {
      itemCount,
      collaboratorCount,
      estimatedPdfPages: analysis.estimated_pages || 1,
      hasDetailedInfo:
        list.items?.some(item => (item.notes && item.notes.length > 20) || item.name.length > 30) ||
        false,
      recommendedMethod: 'pdf',
      pdfFileSize,
    };
  }
}
