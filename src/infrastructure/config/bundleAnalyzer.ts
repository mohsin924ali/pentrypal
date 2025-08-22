/**
 * Bundle Analyzer Configuration
 * Provides tools for analyzing bundle size, dependencies, and optimization opportunities
 */

interface BundleAnalysisReport {
  totalSize: number;
  jsSize: number;
  assetsSize: number;
  largestModules: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
  duplicateModules: string[];
  unusedModules: string[];
  recommendations: string[];
}

class BundleAnalyzer {
  private static instance: BundleAnalyzer;

  private constructor() {}

  static getInstance(): BundleAnalyzer {
    if (!BundleAnalyzer.instance) {
      BundleAnalyzer.instance = new BundleAnalyzer();
    }
    return BundleAnalyzer.instance;
  }

  /**
   * Analyze current bundle and provide insights
   */
  async analyzeBundleSize(): Promise<BundleAnalysisReport | null> {
    if (!__DEV__) {
      console.warn('Bundle analysis is only available in development mode');
      return null;
    }

    try {
      // Simulate bundle analysis (in a real implementation, this would use actual bundle data)
      const report: BundleAnalysisReport = {
        totalSize: 0,
        jsSize: 0,
        assetsSize: 0,
        largestModules: [],
        duplicateModules: [],
        unusedModules: [],
        recommendations: [],
      };

      // Get bundle information from Metro
      const bundleInfo = await this.getBundleInformation();

      if (bundleInfo) {
        report.totalSize = bundleInfo.totalSize;
        report.jsSize = bundleInfo.jsSize;
        report.assetsSize = bundleInfo.assetsSize;
        report.largestModules = bundleInfo.modules
          .sort((a, b) => b.size - a.size)
          .slice(0, 10)
          .map(module => ({
            name: module.name,
            size: module.size,
            percentage: (module.size / bundleInfo.totalSize) * 100,
          }));

        report.recommendations = this.generateRecommendations(report);
      }

      return report;
    } catch (error) {
      console.error('Failed to analyze bundle:', error);
      return null;
    }
  }

  /**
   * Get bundle information from Metro bundler
   */
  private async getBundleInformation(): Promise<any> {
    // This would integrate with Metro's bundle analysis APIs
    // For now, return mock data for demonstration
    return {
      totalSize: 2048000, // 2MB
      jsSize: 1536000, // 1.5MB
      assetsSize: 512000, // 512KB
      modules: [
        { name: 'react-native', size: 400000 },
        { name: 'react', size: 200000 },
        { name: '@reduxjs/toolkit', size: 150000 },
        { name: 'react-navigation', size: 100000 },
        { name: 'lodash', size: 80000 },
      ],
    };
  }

  /**
   * Generate optimization recommendations based on bundle analysis
   */
  private generateRecommendations(report: BundleAnalysisReport): string[] {
    const recommendations: string[] = [];

    // Check for large modules
    const largeModules = report.largestModules.filter(
      module => module.percentage > 10,
    );
    if (largeModules.length > 0) {
      recommendations.push(
        `Consider code splitting for large modules: ${largeModules.map(m => m.name).join(', ')}`,
      );
    }

    // Check total bundle size
    if (report.totalSize > 3000000) {
      // 3MB
      recommendations.push(
        'Bundle size is large. Consider lazy loading and code splitting.',
      );
    }

    // Check for duplicate modules
    if (report.duplicateModules.length > 0) {
      recommendations.push(
        `Remove duplicate modules: ${report.duplicateModules.join(', ')}`,
      );
    }

    // Check JS to assets ratio
    const jsPercentage = (report.jsSize / report.totalSize) * 100;
    if (jsPercentage > 80) {
      recommendations.push(
        'High JS bundle size. Consider optimizing images and assets.',
      );
    }

    return recommendations;
  }

  /**
   * Log bundle analysis report to console
   */
  async logBundleReport(): Promise<void> {
    const report = await this.analyzeBundleSize();

    if (!report) {
      console.log('Bundle analysis not available');
      return;
    }

    console.group('📦 Bundle Analysis Report');
    console.log(`Total Size: ${this.formatBytes(report.totalSize)}`);
    console.log(`JS Size: ${this.formatBytes(report.jsSize)}`);
    console.log(`Assets Size: ${this.formatBytes(report.assetsSize)}`);

    console.group('Largest Modules:');
    report.largestModules.forEach(module => {
      console.log(
        `${module.name}: ${this.formatBytes(module.size)} (${module.percentage.toFixed(1)}%)`,
      );
    });
    console.groupEnd();

    if (report.recommendations.length > 0) {
      console.group('Recommendations:');
      report.recommendations.forEach(rec => console.log(`• ${rec}`));
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Track bundle size over time
   */
  trackBundleSize(): void {
    if (__DEV__) {
      this.analyzeBundleSize().then(report => {
        if (report) {
          const timestamp = new Date().toISOString();
          const sizeData = {
            timestamp,
            totalSize: report.totalSize,
            jsSize: report.jsSize,
            assetsSize: report.assetsSize,
          };

          // Store in AsyncStorage for tracking over time
          this.storeBundleSizeHistory(sizeData);
        }
      });
    }
  }

  /**
   * Store bundle size history for trend analysis
   */
  private async storeBundleSizeHistory(sizeData: any): Promise<void> {
    try {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      const historyKey = 'bundle_size_history';

      const existingHistory = await AsyncStorage.getItem(historyKey);
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      history.push(sizeData);

      // Keep only last 30 entries
      if (history.length > 30) {
        history.splice(0, history.length - 30);
      }

      await AsyncStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to store bundle size history:', error);
    }
  }

  /**
   * Get bundle size trends
   */
  async getBundleSizeTrends(): Promise<any[]> {
    try {
      const AsyncStorage =
        require('@react-native-async-storage/async-storage').default;
      const historyKey = 'bundle_size_history';

      const existingHistory = await AsyncStorage.getItem(historyKey);
      return existingHistory ? JSON.parse(existingHistory) : [];
    } catch (error) {
      console.error('Failed to get bundle size trends:', error);
      return [];
    }
  }
}

export const bundleAnalyzer = BundleAnalyzer.getInstance();

// Development menu integration
if (__DEV__) {
  const DevMenu = require('react-native').DevMenu;

  if (DevMenu) {
    DevMenu.addItem('Analyze Bundle Size', () => {
      bundleAnalyzer.logBundleReport();
    });

    DevMenu.addItem('Track Bundle Size', () => {
      bundleAnalyzer.trackBundleSize();
      console.log('Bundle size tracking started');
    });
  }
}
