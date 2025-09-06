// ========================================
// Improved Image Generation Service
// Simplified approach focusing on actual image capture
// ========================================

import React from 'react';
import ViewShot from 'react-native-view-shot';

export class ImprovedImageService {
  /**
   * Capture component as image with retry logic
   */
  static async captureWithRetry(
    viewShotRef: React.RefObject<ViewShot>,
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📸 Image capture attempt ${attempt}/${maxRetries}`);

        if (!viewShotRef.current) {
          throw new Error('ViewShot reference is not available');
        }

        // Wait for component to render
        await new Promise(resolve => setTimeout(resolve, attempt * 200));

        // Try to capture
        const uri = await (viewShotRef.current as any).capture();
        console.log(`✅ Image captured successfully on attempt ${attempt}:`, uri);

        return uri;
      } catch (error) {
        console.warn(`⚠️ Image capture attempt ${attempt} failed:`, error);
        lastError = error;

        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    console.error('❌ All image capture attempts failed');
    throw new Error(`Failed to capture image after ${maxRetries} attempts: ${lastError?.message}`);
  }

  /**
   * Test if ViewShot is working properly
   */
  static async testViewShot(viewShotRef: React.RefObject<ViewShot>): Promise<boolean> {
    try {
      if (!viewShotRef.current) {
        console.log('🔍 ViewShot ref is null');
        return false;
      }

      console.log('🔍 ViewShot ref exists:', !!viewShotRef.current);
      console.log('🔍 ViewShot capture method:', typeof viewShotRef.current.capture);

      return true;
    } catch (error) {
      console.error('🔍 ViewShot test failed:', error);
      return false;
    }
  }
}
