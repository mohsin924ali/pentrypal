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
      console.log('🔍 DEBUG encrypt: STARTED - input data length:', data.length);
      console.log('🔍 DEBUG encrypt: ENCRYPTION_KEY exists:', !!ENCRYPTION_KEY);
      console.log('🔍 DEBUG encrypt: CryptoJS available:', !!CryptoJS);
      console.log('🔍 DEBUG encrypt: CryptoJS.AES available:', !!CryptoJS?.AES);
      console.log('🔍 DEBUG encrypt: CryptoJS.AES.encrypt available:', !!CryptoJS?.AES?.encrypt);

      console.log('🔍 DEBUG encrypt: About to call CryptoJS.AES.encrypt');
      const encryptResult = CryptoJS.AES.encrypt(data, ENCRYPTION_KEY);
      console.log('🔍 DEBUG encrypt: encryptResult exists:', !!encryptResult);
      console.log('🔍 DEBUG encrypt: encryptResult type:', typeof encryptResult);

      console.log('🔍 DEBUG encrypt: About to call toString() on encryptResult');
      const encrypted = encryptResult.toString();
      console.log('🔍 DEBUG encrypt: toString() SUCCESS - length:', encrypted.length);
      console.log('🔍 DEBUG encrypt: COMPLETED SUCCESSFULLY');
      return encrypted;
    } catch (error) {
      console.error('❌ ENCRYPT ERROR:', error);
      console.error('❌ ENCRYPT Error type:', typeof error);
      console.error(
        '❌ ENCRYPT Error message:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      console.error('❌ ENCRYPT Error stack:', error instanceof Error ? error.stack : 'No stack');
      throw new Error(`Failed to encrypt data: ${error instanceof Error ? error.message : error}`);
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

        // STEP-BY-STEP DEBUGGING - Test each operation individually
        let encryptedData: string;
        try {
          console.log('🔍 DEBUG SecureTokenStorage: About to call encrypt()');
          encryptedData = this.encrypt(jsonString);
          console.log(
            '🔍 DEBUG SecureTokenStorage: encrypt() SUCCESS - length:',
            encryptedData.length
          );
        } catch (encryptError) {
          console.error('❌ ENCRYPTION FAILED:', encryptError);
          throw new Error(`Encryption failed: ${encryptError.message || encryptError}`);
        }

        try {
          console.log('🔍 DEBUG SecureTokenStorage: About to call AsyncStorage.setItem()');
          await AsyncStorage.setItem(key, encryptedData);
          console.log('🔍 DEBUG SecureTokenStorage: AsyncStorage.setItem() SUCCESS');
        } catch (asyncStorageError) {
          console.error('❌ ASYNCSTORAGE FAILED:', asyncStorageError);
          throw new Error(`AsyncStorage failed: ${asyncStorageError.message || asyncStorageError}`);
        }

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
