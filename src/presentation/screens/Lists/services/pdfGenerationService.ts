// ========================================
// PDF Generation Service - Professional Receipt PDFs
// ========================================

import { Alert, Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import type { ShoppingItem, ShoppingList } from '../../../../shared/types/lists';
import { formatCurrency } from '../../../../shared/utils/currencyUtils';

export interface PdfGenerationOptions {
  pageSize?: 'A4' | 'Letter' | 'A5';
  margin?: number;
  orientation?: 'portrait' | 'landscape';
  itemsPerPage?: number;
  includeHeader?: boolean;
  includeFooter?: boolean;
  companyInfo?: {
    name: string;
    logo?: string;
    address?: string;
  };
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  itemsOnPage: number;
  totalItems: number;
}

export class PdfGenerationService {
  private static readonly DEFAULT_ITEMS_PER_PAGE = 15;
  private static readonly DEFAULT_OPTIONS: Required<Omit<PdfGenerationOptions, 'companyInfo'>> = {
    pageSize: 'A4',
    margin: 40,
    orientation: 'portrait',
    itemsPerPage: PdfGenerationService.DEFAULT_ITEMS_PER_PAGE,
    includeHeader: true,
    includeFooter: true,
  };

  /**
   * Determine if a list should use PDF instead of image
   */
  static shouldUsePdf(list: ShoppingList): boolean {
    const itemCount = list.items?.length || 0;
    const collaboratorCount = (list.collaborators?.length || 0) + 1; // +1 for owner

    // Use PDF if:
    // - More than 10 items
    // - More than 3 collaborators
    // - Has spending breakdown data
    // - Items have long descriptions or notes
    return (
      itemCount > 10 ||
      collaboratorCount > 3 ||
      list.items?.some(item => item.notes && item.notes.length > 50) ||
      false
    );
  }

  /**
   * Calculate pagination info for a list
   */
  static calculatePagination(
    totalItems: number,
    itemsPerPage: number = PdfGenerationService.DEFAULT_ITEMS_PER_PAGE
  ): { totalPages: number; itemsPerPage: number } {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return { totalPages, itemsPerPage };
  }

  /**
   * Generate professional PDF receipt
   */
  static async generateReceipt(
    list: ShoppingList,
    totalSpent: number,
    spendingSummary: Record<string, { amount: number; items: number }>,
    getCollaboratorName: (userId: string) => string,
    options: Partial<PdfGenerationOptions> = {}
  ): Promise<string> {
    try {
      console.log('📄 Starting PDF receipt generation...');

      const finalOptions = { ...PdfGenerationService.DEFAULT_OPTIONS, ...options };
      const html = PdfGenerationService.generateReceiptHtml(
        list,
        totalSpent,
        spendingSummary,
        getCollaboratorName,
        finalOptions
      );

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
        width: finalOptions.pageSize === 'A4' ? 612 : 612, // 8.5" in points
        height: finalOptions.pageSize === 'A4' ? 792 : 792, // 11" in points
        margins: {
          left: finalOptions.margin,
          top: finalOptions.margin,
          right: finalOptions.margin,
          bottom: finalOptions.margin,
        },
      });

      console.log('✅ PDF receipt generated successfully:', uri);
      return uri;
    } catch (error) {
      console.error('❌ Failed to generate PDF receipt:', error);
      throw new Error(`Failed to generate PDF receipt: ${error}`);
    }
  }

  /**
   * Share PDF receipt using native sharing
   */
  static async shareReceipt(pdfUri: string, listName: string): Promise<void> {
    try {
      console.log('📱 Starting PDF sharing...');

      // Verify PDF exists
      const fileInfo = await FileSystem.getInfoAsync(pdfUri);
      if (!fileInfo.exists) {
        throw new Error('PDF file does not exist');
      }

      // Copy to accessible location with better filename
      const timestamp = new Date().toISOString().slice(0, 10);
      const safeListName = listName.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `PantryPal_Receipt_${safeListName}_${timestamp}.pdf`;
      const shareableUri = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.copyAsync({
        from: pdfUri,
        to: shareableUri,
      });

      // Check if sharing is available
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      // Share the PDF
      await Sharing.shareAsync(shareableUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Shopping Receipt',
        UTI: 'com.adobe.pdf',
      });

      console.log('✅ PDF shared successfully');

      // Cleanup copied file after delay
      setTimeout(async () => {
        try {
          await FileSystem.deleteAsync(shareableUri);
          console.log('🧹 Cleaned up shared PDF file');
        } catch (e) {
          console.warn('⚠️ Failed to cleanup shared PDF:', e);
        }
      }, 10000);
    } catch (error) {
      console.error('❌ PDF sharing failed:', error);

      Alert.alert('Sharing Failed', 'Unable to share the PDF receipt. Please try again.', [
        { text: 'OK' },
      ]);

      throw error;
    }
  }

  /**
   * Generate complete HTML content for PDF receipt
   */
  private static generateReceiptHtml(
    list: ShoppingList,
    totalSpent: number,
    spendingSummary: Record<string, { amount: number; items: number }>,
    getCollaboratorName: (userId: string) => string,
    options: Required<Omit<PdfGenerationOptions, 'companyInfo'>>
  ): string {
    const items = list.items || [];
    const completedItems = items.filter(item => item.completed);
    const totalItems = items.length;
    const completionPercentage =
      totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 0;
    const teamSize = (list.collaborators?.length || 0) + 1;
    const currency = list.budget?.currency || 'USD';

    const now = new Date();
    const receiptId = `PP-${list.id?.slice(0, 8)?.toUpperCase() || Math.random().toString(36).substr(2, 8).toUpperCase()}`;

    // Calculate pagination
    const { totalPages, itemsPerPage } = PdfGenerationService.calculatePagination(
      totalItems,
      options.itemsPerPage
    );

    let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PantryPal Receipt - ${list.name}</title>
          ${PdfGenerationService.getStyleSheet()}
      </head>
      <body>
    `;

    // Generate pages
    for (let page = 1; page <= totalPages; page++) {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
      const pageItems = items.slice(startIndex, endIndex);

      html += PdfGenerationService.generatePageHtml({
        list,
        pageItems,
        totalSpent,
        spendingSummary,
        getCollaboratorName,
        receiptId,
        currency,
        completedItems,
        totalItems,
        completionPercentage,
        teamSize,
        now,
        pagination: {
          currentPage: page,
          totalPages,
          itemsOnPage: pageItems.length,
          totalItems,
        },
        isFirstPage: page === 1,
        isLastPage: page === totalPages,
      });
    }

    html += `
      </body>
      </html>
    `;

    return html;
  }

  /**
   * Generate HTML for a single page
   */
  private static generatePageHtml(params: {
    list: ShoppingList;
    pageItems: ShoppingItem[];
    totalSpent: number;
    spendingSummary: Record<string, { amount: number; items: number }>;
    getCollaboratorName: (userId: string) => string;
    receiptId: string;
    currency: string;
    completedItems: ShoppingItem[];
    totalItems: number;
    completionPercentage: number;
    teamSize: number;
    now: Date;
    pagination: PaginationInfo;
    isFirstPage: boolean;
    isLastPage: boolean;
  }): string {
    const {
      list,
      pageItems,
      totalSpent,
      spendingSummary,
      getCollaboratorName,
      receiptId,
      currency,
      completedItems,
      totalItems,
      completionPercentage,
      teamSize,
      now,
      pagination,
      isFirstPage,
      isLastPage,
    } = params;

    return `
      <div class="page">
        ${isFirstPage ? PdfGenerationService.generateHeaderHtml(list, receiptId, now) : ''}
        
        ${isFirstPage ? PdfGenerationService.generateSummaryHtml(totalItems, completedItems.length, completionPercentage, teamSize) : ''}
        
        ${PdfGenerationService.generateItemsHtml(pageItems, getCollaboratorName, currency, pagination)}
        
        ${isLastPage ? PdfGenerationService.generateSpendingBreakdownHtml(spendingSummary, getCollaboratorName, currency) : ''}
        
        ${isLastPage ? PdfGenerationService.generateTotalHtml(totalSpent, currency, completedItems.length) : ''}
        
        ${PdfGenerationService.generatePageFooterHtml(pagination, now)}
      </div>
    `;
  }

  /**
   * Generate header HTML
   */
  private static generateHeaderHtml(list: ShoppingList, receiptId: string, now: Date): string {
    return `
      <header class="header">
        <div class="brand">
          <div class="brand-badge">
            <span class="icon">📄</span>
            <h1>PantryPal</h1>
          </div>
          <p class="tagline">Your Smart Shopping Receipt</p>
        </div>
        
        <div class="receipt-info">
          <div class="receipt-id">Receipt ID: ${receiptId}</div>
          
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Date</span>
              <span class="value">${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div class="info-item">
              <span class="label">Time</span>
              <span class="value">${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div class="info-item">
              <span class="label">List</span>
              <span class="value">${list.name}</span>
            </div>
          </div>
        </div>
      </header>
    `;
  }

  /**
   * Generate summary HTML
   */
  private static generateSummaryHtml(
    totalItems: number,
    completedCount: number,
    completionPercentage: number,
    teamSize: number
  ): string {
    return `
      <section class="summary">
        <h2>📊 Shopping Summary</h2>
        <div class="summary-grid">
          <div class="summary-card">
            <div class="icon-badge primary">🛍️</div>
            <span class="label">Total Items</span>
            <span class="value">${totalItems}</span>
          </div>
          <div class="summary-card">
            <div class="icon-badge success">✅</div>
            <span class="label">Purchased</span>
            <span class="value">${completedCount}</span>
          </div>
          <div class="summary-card">
            <div class="icon-badge purple">📈</div>
            <span class="label">Completion</span>
            <span class="value">${completionPercentage}%</span>
          </div>
          <div class="summary-card">
            <div class="icon-badge accent">👥</div>
            <span class="label">Team Size</span>
            <span class="value">${teamSize}</span>
          </div>
        </div>
      </section>
    `;
  }

  /**
   * Generate items HTML
   */
  private static generateItemsHtml(
    items: ShoppingItem[],
    getCollaboratorName: (userId: string) => string,
    currency: string,
    pagination: PaginationInfo
  ): string {
    const itemsHtml = items
      .map(
        item => `
      <div class="item">
        <div class="item-left">
          <span class="status-icon ${item.completed ? 'completed' : 'pending'}">
            ${item.completed ? '✅' : '⭕'}
          </span>
          <div class="item-details">
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">(Qty: ${item.quantity || 1})</span>
            ${item.assignedTo ? `<div class="assignee">${getCollaboratorName(item.assignedTo)}</div>` : ''}
            ${item.notes ? `<div class="notes">${item.notes}</div>` : ''}
          </div>
        </div>
        <div class="item-right">
          <span class="price ${item.completed && item.purchasedAmount ? 'completed' : 'pending'}">
            ${
              item.completed && item.purchasedAmount
                ? formatCurrency(item.purchasedAmount, currency as any)
                : 'No price'
            }
          </span>
        </div>
      </div>
    `
      )
      .join('');

    return `
      <section class="items">
        <h2>🛒 Items (Page ${pagination.currentPage} of ${pagination.totalPages})</h2>
        <div class="items-list">
          ${itemsHtml}
        </div>
      </section>
    `;
  }

  /**
   * Generate spending breakdown HTML
   */
  private static generateSpendingBreakdownHtml(
    spendingSummary: Record<string, { amount: number; items: number }>,
    getCollaboratorName: (userId: string) => string,
    currency: string
  ): string {
    if (Object.keys(spendingSummary).length === 0) return '';

    const breakdownHtml = Object.entries(spendingSummary)
      .map(
        ([userId, summary]) => `
      <div class="breakdown-item">
        <div class="breakdown-left">
          <span class="person-name">${getCollaboratorName(userId) || 'User'}</span>
          <span class="item-count">${summary.items} item${summary.items !== 1 ? 's' : ''}</span>
        </div>
        <span class="amount">${formatCurrency(summary.amount, currency as any)}</span>
      </div>
    `
      )
      .join('');

    return `
      <section class="spending-breakdown">
        <h2>📊 Spending Breakdown</h2>
        <div class="breakdown-list">
          ${breakdownHtml}
        </div>
      </section>
    `;
  }

  /**
   * Generate total HTML
   */
  private static generateTotalHtml(
    totalSpent: number,
    currency: string,
    completedCount: number
  ): string {
    return `
      <section class="total">
        <div class="total-content">
          <div class="total-left">
            <span class="total-label">TOTAL SPENT</span>
            <span class="total-items">${completedCount} purchased item${completedCount !== 1 ? 's' : ''}</span>
          </div>
          <span class="total-amount">${formatCurrency(totalSpent, currency as any)}</span>
        </div>
      </section>
    `;
  }

  /**
   * Generate page footer HTML
   */
  private static generatePageFooterHtml(pagination: PaginationInfo, now: Date): string {
    return `
      <footer class="page-footer">
        <div class="footer-content">
          <span class="footer-text">✨ Generated by PantryPal - Making grocery shopping smarter, together</span>
          <span class="page-info">Page ${pagination.currentPage} of ${pagination.totalPages}</span>
        </div>
        <div class="generation-time">Generated on ${now.toLocaleString()}</div>
      </footer>
    `;
  }

  /**
   * Get CSS stylesheet for PDF
   */
  private static getStyleSheet(): string {
    return `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Helvetica', 'Arial', sans-serif;
          line-height: 1.4;
          color: #1f2937;
          background: #f8fafc;
        }

        .page {
          max-width: 100%;
          margin: 0 auto;
          background: white;
          min-height: 100vh;
          page-break-after: always;
          padding: 20px;
        }

        .page:last-child {
          page-break-after: avoid;
        }

        /* Header Styles */
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px dashed #e5e7eb;
        }

        .brand {
          margin-bottom: 20px;
        }

        .brand-badge {
          display: inline-flex;
          align-items: center;
          background: #eff6ff;
          padding: 8px 16px;
          border-radius: 50px;
          margin-bottom: 8px;
        }

        .brand-badge .icon {
          margin-right: 8px;
          font-size: 16px;
        }

        .brand-badge h1 {
          color: #2563eb;
          font-size: 18px;
          font-weight: bold;
        }

        .tagline {
          color: #6b7280;
          font-size: 12px;
        }

        .receipt-id {
          background: #f3f4f6;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          color: #4b5563;
          margin-bottom: 15px;
          display: inline-block;
        }

        .info-grid {
          display: flex;
          justify-content: space-around;
          gap: 20px;
        }

        .info-item {
          text-align: center;
        }

        .info-item .label {
          display: block;
          color: #6b7280;
          font-size: 11px;
          margin-bottom: 2px;
        }

        .info-item .value {
          display: block;
          color: #1f2937;
          font-weight: 600;
          font-size: 12px;
        }

        /* Summary Styles */
        .summary {
          margin-bottom: 25px;
        }

        .summary h2 {
          font-size: 16px;
          margin-bottom: 15px;
          color: #1f2937;
        }

        .summary-grid {
          display: flex;
          gap: 12px;
          justify-content: space-between;
        }

        .summary-card {
          flex: 1;
          text-align: center;
          background: #f9fafb;
          padding: 12px 8px;
          border-radius: 8px;
        }

        .icon-badge {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
          font-size: 16px;
        }

        .icon-badge.primary { background: #eff6ff; }
        .icon-badge.success { background: #ecfdf5; }
        .icon-badge.purple { background: #faf5ff; }
        .icon-badge.accent { background: #fef3c7; }

        .summary-card .label {
          display: block;
          font-size: 10px;
          color: #6b7280;
          margin-bottom: 2px;
        }

        .summary-card .value {
          display: block;
          font-size: 14px;
          font-weight: bold;
          color: #1f2937;
        }

        /* Items Styles */
        .items {
          margin-bottom: 25px;
        }

        .items h2 {
          font-size: 16px;
          margin-bottom: 15px;
          color: #1f2937;
        }

        .items-list {
          gap: 8px;
        }

        .item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          margin-bottom: 8px;
        }

        .item-left {
          display: flex;
          align-items: flex-start;
          flex: 1;
        }

        .status-icon {
          margin-right: 12px;
          font-size: 16px;
          margin-top: 2px;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-weight: 500;
          font-size: 14px;
          color: #1f2937;
        }

        .item-quantity {
          color: #9ca3af;
          font-size: 14px;
        }

        .assignee {
          font-size: 12px;
          color: #6b7280;
          margin-top: 2px;
        }

        .notes {
          font-size: 11px;
          color: #6b7280;
          margin-top: 4px;
          font-style: italic;
        }

        .item-right .price {
          font-weight: 600;
          font-size: 14px;
        }

        .price.completed {
          color: #1f2937;
        }

        .price.pending {
          color: #9ca3af;
        }

        /* Spending Breakdown Styles */
        .spending-breakdown {
          margin-bottom: 25px;
        }

        .spending-breakdown h2 {
          font-size: 16px;
          margin-bottom: 15px;
          color: #1f2937;
        }

        .breakdown-list {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .breakdown-item:not(:last-child) {
          border-bottom: 1px solid #e5e7eb;
        }

        .breakdown-left .person-name {
          display: block;
          font-weight: 500;
          font-size: 14px;
          color: #1f2937;
        }

        .breakdown-left .item-count {
          font-size: 12px;
          color: #6b7280;
        }

        .breakdown-item .amount {
          font-weight: bold;
          font-size: 14px;
          color: #1f2937;
        }

        /* Total Styles */
        .total {
          background: #2563eb;
          color: white;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .total-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-left .total-label {
          display: block;
          font-size: 12px;
          opacity: 0.8;
        }

        .total-left .total-items {
          display: block;
          font-size: 12px;
          opacity: 0.8;
        }

        .total-amount {
          font-size: 24px;
          font-weight: bold;
        }

        /* Footer Styles */
        .page-footer {
          margin-top: auto;
          padding-top: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .footer-text {
          font-size: 11px;
          color: #9ca3af;
        }

        .page-info {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 500;
        }

        .generation-time {
          font-size: 10px;
          color: #9ca3af;
        }

        /* Print Styles */
        @media print {
          .page {
            margin: 0;
            padding: 15px;
          }
          
          .page-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
          }
        }
      </style>
    `;
  }

  /**
   * Cleanup temporary PDF file
   */
  static async cleanupPdf(pdfUri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(pdfUri);
      console.log('🧹 Cleaned up temporary PDF:', pdfUri);
    } catch (error) {
      console.warn('⚠️ Failed to cleanup temporary PDF:', error);
    }
  }
}
