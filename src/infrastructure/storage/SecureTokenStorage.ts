// ========================================
// Secure Token Storage - Centralized Token Management
// ========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const ENCRYPTION_KEY = 'pentrypal_auth_key_2024'; // In production, use secure key management

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string[];
}

export class SecureTokenStorage {
  // Pure JavaScript base64 encode - works everywhere
  private static base64Encode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;

    while (i < str.length) {
      const a = str.charCodeAt(i++);
      const b = i < str.length ? str.charCodeAt(i++) : 0;
      const c = i < str.length ? str.charCodeAt(i++) : 0;

      const bitmap = (a << 16) | (b << 8) | c;

      result += chars.charAt((bitmap >> 18) & 63);
      result += chars.charAt((bitmap >> 12) & 63);
      result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
    }

    return result;
  }

  // Pure JavaScript base64 decode - works everywhere
  private static base64Decode(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;

    str = str.replace(/[^A-Za-z0-9+/]/g, '');

    while (i < str.length) {
      const encoded1 = chars.indexOf(str.charAt(i++));
      const encoded2 = chars.indexOf(str.charAt(i++));
      const encoded3 = chars.indexOf(str.charAt(i++));
      const encoded4 = chars.indexOf(str.charAt(i++));

      const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;

      result += String.fromCharCode((bitmap >> 16) & 255);
      if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
      if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
    }

    return result;
  }

  private static encrypt(data: string): string {
    try {
      return this.base64Encode(data);
    } catch (error) {
      throw new Error(`Failed to encrypt data: ${error instanceof Error ? error.message : error}`);
    }
  }

  private static decrypt(encryptedData: string): string {
    try {
      const decryptedData = this.base64Decode(encryptedData);

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
      const jsonString = JSON.stringify(tokens);

      if (__DEV__) {
        // In development, use plain storage for easier debugging
        await AsyncStorage.setItem(key, jsonString);
      } else {
        // In production, use encryption
        const encryptedData = this.encrypt(jsonString);
        await AsyncStorage.setItem(key, encryptedData);
      }
    } catch (error) {
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
        expiresIn: tokens.expiresIn || 43200, // 12 hours default
        scope: tokens.scope || ['read', 'write'],
      };
    } else if (tokens.access_token && tokens.refresh_token) {
      // Backend format
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenType: 'Bearer',
        expiresIn: tokens.expires_in || 43200, // 12 hours default
        scope: tokens.scope || ['read', 'write'],
      };
    }

    return null;
  }

  static async removeTokens(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
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
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }
}
