// ========================================
// Avatar Utilities - Avatar Management System
// ========================================

import type { AvatarType } from '../types/lists';

// Avatar identifiers for predefined avatars
export type AvatarIdentifier =
  | 'avt-1'
  | 'avt-2'
  | 'avt-3'
  | 'avt-4'
  | 'avt-5'
  | 'avt-6'
  | 'avt-7'
  | 'avt-8'
  | 'avt-9';

// Asset type for predefined avatars
type AvatarAsset = string;

// Predefined avatar assets (these would be actual require() calls in a real app)
const AVATAR_ASSETS: Record<AvatarIdentifier, AvatarAsset> = {
  'avt-1': '👤', // In real app: require('@/assets/avatars/avt-1.png')
  'avt-2': '👩', // In real app: require('@/assets/avatars/avt-2.png')
  'avt-3': '👨', // In real app: require('@/assets/avatars/avt-3.png')
  'avt-4': '🧑', // In real app: require('@/assets/avatars/avt-4.png')
  'avt-5': '👩‍💼', // In real app: require('@/assets/avatars/avt-5.png')
  'avt-6': '👨‍💼', // In real app: require('@/assets/avatars/avt-6.png')
  'avt-7': '👩‍🎓', // In real app: require('@/assets/avatars/avt-7.png')
  'avt-8': '👨‍🎓', // In real app: require('@/assets/avatars/avt-8.png')
  'avt-9': '🧑‍💻', // In real app: require('@/assets/avatars/avt-9.png')
};

/**
 * Check if a string is a valid avatar identifier
 */
export const isValidAvatarIdentifier = (identifier: string): identifier is AvatarIdentifier => {
  return Object.keys(AVATAR_ASSETS).includes(identifier);
};

/**
 * Get avatar asset by identifier
 */
export const getAvatarAsset = (identifier: AvatarIdentifier): AvatarAsset => {
  return AVATAR_ASSETS[identifier];
};

/**
 * Check if a string is a custom image URI
 */
export const isCustomImageUri = (uri: string): boolean => {
  if (typeof uri !== 'string') return false;

  // Check for common image URI patterns
  const imageUriPatterns = [
    /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
    /^file:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
    /^data:image\/.+;base64,/i,
    /^content:\/\/.+/i, // Android content URIs
  ];

  return imageUriPatterns.some(pattern => pattern.test(uri));
};

/**
 * Get avatar display component props
 */
export const getAvatarProps = (
  avatar: AvatarType
): {
  type: 'emoji' | 'asset' | 'uri' | 'fallback';
  source?: AvatarAsset | { uri: string } | number | object;
  emoji?: string;
} => {
  // Handle emoji/text avatars
  if (typeof avatar === 'string') {
    if (isValidAvatarIdentifier(avatar)) {
      return {
        type: 'asset',
        source: getAvatarAsset(avatar),
      };
    }

    if (isCustomImageUri(avatar)) {
      return {
        type: 'uri',
        source: {
          uri: avatar.replace(
            'http://localhost:8000',
            'https://pantrypalbe-production.up.railway.app'
          ),
        },
      };
    }

    // Treat as emoji
    return {
      type: 'emoji',
      emoji: avatar,
    };
  }

  // Handle require() results (numbers)
  if (typeof avatar === 'number') {
    return {
      type: 'asset',
      source: avatar,
    };
  }

  // Handle objects (asset objects or URI objects)
  if (typeof avatar === 'object' && avatar !== null) {
    return {
      type: 'asset',
      source: avatar,
    };
  }

  // Fallback
  return {
    type: 'fallback',
    emoji: '👤',
  };
};

/**
 * Generate initials from a name
 */
export const generateInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return '??';

  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0]?.substring(0, 2).toUpperCase() || '??';
  }

  return words
    .slice(0, 2)
    .map(word => word?.charAt(0).toUpperCase() || '?')
    .join('');
};

/**
 * Get fallback avatar based on name
 */
export const getFallbackAvatar = (name?: string): string => {
  if (!name) return '👤';

  // Generate a consistent emoji based on name hash
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const avatars = ['👤', '👩', '👨', '🧑', '👩‍💼', '👨‍💼', '👩‍🎓', '👨‍🎓', '🧑‍💻'];
  return avatars[hash % avatars.length] || '👤';
};

/**
 * Get all available avatar identifiers
 */
export const getAvailableAvatars = (): AvatarIdentifier[] => {
  return Object.keys(AVATAR_ASSETS) as AvatarIdentifier[];
};

/**
 * Validate avatar data
 */
export const validateAvatar = (avatar: unknown): boolean => {
  if (!avatar) return false;

  if (typeof avatar === 'string') {
    return isValidAvatarIdentifier(avatar) || isCustomImageUri(avatar) || avatar.length > 0;
  }

  if (typeof avatar === 'number') {
    return avatar > 0;
  }

  if (typeof avatar === 'object') {
    return avatar !== null;
  }

  return false;
};

/**
 * Sanitize avatar data for storage
 */
export const sanitizeAvatar = (avatar: unknown): string => {
  if (typeof avatar === 'string') {
    return avatar;
  }

  if (typeof avatar === 'number') {
    return `asset_${avatar}`;
  }

  if (
    typeof avatar === 'object' &&
    avatar !== null &&
    'uri' in avatar &&
    typeof (avatar as { uri?: unknown }).uri === 'string'
  ) {
    const uri = (avatar as { uri: string }).uri;
    return uri.replace('http://localhost:8000', 'https://pantrypalbe-production.up.railway.app');
  }

  return '👤'; // Default fallback
};
