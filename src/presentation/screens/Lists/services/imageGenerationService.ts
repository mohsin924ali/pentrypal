// ========================================
// Image Generation Service
// ========================================

import ViewShot from 'react-native-view-shot';

export interface ImageGenerationOptions {
  format: 'png' | 'jpg';
  quality: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
}

export class ImageGenerationService {
  /**
   * Capture a React component as an image
   */
  static async captureComponent(
    viewShotRef: React.RefObject<ViewShot>,
    options: Partial<ImageGenerationOptions> = {}
  ): Promise<string> {
    const defaultOptions: ImageGenerationOptions = {
      format: 'png',
      quality: 0.9,
      backgroundColor: 'white',
      width: 400,
      height: 600,
      ...options,
    };

    try {
      if (!viewShotRef.current) {
        throw new Error('ViewShot reference is not available');
      }

      console.log('📸 Starting receipt image capture...');

      // Give the component time to fully render
      await new Promise(resolve => setTimeout(resolve, 100));

      const uri = await (viewShotRef.current as any).capture();

      console.log('✅ Receipt image generated successfully:', uri);
      return uri;
    } catch (error) {
      console.error('❌ Failed to generate receipt image:', error);
      console.error('ViewShot ref current:', viewShotRef.current);
      throw new Error(`Failed to generate receipt image: ${error}`);
    }
  }

  /**
   * Get optimal image dimensions for receipt
   */
  static getReceiptDimensions(): { width: number; height: number } {
    return {
      width: 400,
      height: 600, // Will adjust based on content
    };
  }

  /**
   * Cleanup temporary image file
   */
  static async cleanupImage(imageUri: string): Promise<void> {
    try {
      // In a real implementation, you might want to clean up temporary files
      // For now, we'll just log the cleanup action
      console.log('🧹 Cleaning up temporary image:', imageUri);
    } catch (error) {
      console.warn('⚠️ Failed to cleanup temporary image:', error);
    }
  }
}
