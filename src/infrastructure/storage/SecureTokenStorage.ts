// ========================================
// Secure Token Storage - Centralized Token Management
// ========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
const CryptoJS = require('crypto-js');

const ENCRYPTION_KEY = 'pentrypal_auth_key_2024'; // In production, use secure key management

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string[];
}

export class SecureTokenStorage {
  private static encrypt(data: string): string {
    try {
      console.log('🔍 DEBUG SecureTokenStorage encrypt: input data length:', data.length);
      console.log('🔍 DEBUG SecureTokenStorage encrypt: ENCRYPTION_KEY:', ENCRYPTION_KEY);
      console.log('🔍 DEBUG SecureTokenStorage encrypt: CryptoJS available:', !!CryptoJS);
      console.log('🔍 DEBUG SecureTokenStorage encrypt: CryptoJS.AES available:', !!CryptoJS.AES);

      const encrypted = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
      console.log('🔍 DEBUG SecureTokenStorage encrypt: encrypted length:', encrypted.length);
      return encrypted;
    } catch (error) {
      console.error('🔍 DEBUG SecureTokenStorage encrypt: Encryption failed:', error);
      console.error('🔍 DEBUG SecureTokenStorage encrypt: Error type:', typeof error);
      console.error(
        '🔍 DEBUG SecureTokenStorage encrypt: Error message:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw new Error('Failed to encrypt data');
    }
  }

  private static decrypt(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedData) {
        throw new Error('Failed to decrypt data');
      }

      return decryptedData;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static async storeTokens(key: string, tokens: StoredTokens): Promise<void> {
    try {
      console.log('🔍 DEBUG SecureTokenStorage: storeTokens called with key:', key);
      console.log('🔍 DEBUG SecureTokenStorage: tokens:', JSON.stringify(tokens, null, 2));
      console.log('🔍 DEBUG SecureTokenStorage: __DEV__:', __DEV__);

      const jsonString = JSON.stringify(tokens);
      console.log('🔍 DEBUG SecureTokenStorage: jsonString length:', jsonString.length);

      if (__DEV__) {
        // In development, use plain storage for easier debugging
        console.log('🔍 DEBUG SecureTokenStorage: Using plain storage for dev');
        await AsyncStorage.setItem(key, jsonString);
        console.log(`🔐 Stored tokens for key: ${key} (plain format for dev)`);
      } else {
        // In production, use encryption
        console.log('🔍 DEBUG SecureTokenStorage: Using encryption for production');
        const encryptedData = this.encrypt(jsonString);
        console.log('🔍 DEBUG SecureTokenStorage: Encrypted data length:', encryptedData.length);
        await AsyncStorage.setItem(key, encryptedData);
        console.log(`🔐 Stored tokens for key: ${key} (encrypted)`);
      }
    } catch (error) {
      console.error('🔍 DEBUG SecureTokenStorage: Failed to store tokens:', error);
      console.error('🔍 DEBUG SecureTokenStorage: Error type:', typeof error);
      console.error(
        '🔍 DEBUG SecureTokenStorage: Error message:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      console.error(
        '🔍 DEBUG SecureTokenStorage: Error stack:',
        error instanceof Error ? error.stack : 'No stack'
      );
      throw new Error('Failed to store tokens securely');
    }
  }

  static async getTokens(key: string): Promise<StoredTokens | null> {
    try {
      const storedData = await AsyncStorage.getItem(key);
      if (!storedData) return null;

      let jsonString: string;

      if (__DEV__) {
        // In development, try plain JSON first
        try {
          const parsed = JSON.parse(storedData);
          if (parsed.accessToken || parsed.access_token) {
            console.log(`🔓 Retrieved tokens for key: ${key} (plain format)`);
            return this.normalizeTokenFormat(parsed);
          }
        } catch {
          // If plain parsing fails, try decryption
        }
      }

      // Try to decrypt (for encrypted storage or production)
      try {
        jsonString = this.decrypt(storedData);
        const parsed = JSON.parse(jsonString);
        console.log(`🔓 Retrieved tokens for key: ${key} (decrypted)`);
        return this.normalizeTokenFormat(parsed);
      } catch (decryptError) {
        console.warn('Failed to decrypt tokens, clearing...', decryptError);
        await this.removeTokens(key);
        return null;
      }
    } catch (error) {
      console.error('Failed to retrieve tokens:', error);
      return null;
    }
  }

  private static normalizeTokenFormat(tokens: any): StoredTokens | null {
    // Handle both frontend and backend token formats
    if (tokens.accessToken && tokens.refreshToken) {
      // Frontend format
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: tokens.tokenType || 'Bearer',
        expiresIn: tokens.expiresIn || 1800,
        scope: tokens.scope || ['read', 'write'],
      };
    } else if (tokens.access_token && tokens.refresh_token) {
      // Backend format
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenType: 'Bearer',
        expiresIn: tokens.expires_in || 1800,
        scope: tokens.scope || ['read', 'write'],
      };
    }

    return null;
  }

  static async removeTokens(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Removed tokens for key: ${key}`);
    } catch (error) {
      console.error('Failed to remove tokens:', error);
    }
  }

  static async clearAllTokens(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const tokenKeys = keys.filter(
        key => key.includes('auth') || key.includes('token') || key.includes('session')
      );

      await AsyncStorage.multiRemove(tokenKeys);
      console.log('🗑️ Cleared all authentication tokens');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
}
