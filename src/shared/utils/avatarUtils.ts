/**
 * Avatar Utility Functions
 * Handles conversion between avatar identifiers and local assets
 */

import { Image } from 'react-native';

/**
 * Check if a string is a valid avatar identifier
 * @param avatarIdentifier - The string to check
 * @returns True if it's a valid avatar identifier
 */
export const isValidAvatarIdentifier = (avatarIdentifier?: string): boolean => {
  if (!avatarIdentifier) return false;
  const match = avatarIdentifier.match(/^avatar_(\d+)$/);
  if (!match) return false;
  const number = parseInt(match[1]);
  return number >= 1 && number <= 9;
};

/**
 * Check if a string is a custom image URI
 * @param avatarString - The string to check
 * @returns True if it's a custom image URI
 */
export const isCustomImageUri = (avatarString?: string): boolean => {
  if (!avatarString) return false;
  return (
    avatarString.startsWith('file://') || 
    avatarString.startsWith('content://') || 
    avatarString.startsWith('ph://') ||
    avatarString.startsWith('assets-library://') ||
    avatarString.includes('ImagePicker')
  );
};

/**
 * Get avatar asset from identifier using dynamic require
 * @param avatarIdentifier - The avatar identifier (e.g., 'avatar_1')
 * @returns The avatar asset or default avatar
 */
export const getAvatarAsset = (avatarIdentifier?: string) => {
  if (isValidAvatarIdentifier(avatarIdentifier)) {
    const avatarNumber = avatarIdentifier!.replace('avatar_', '');
    
    try {
      // Dynamic require based on the avatar number
      switch (avatarNumber) {
        case '1': return require('../../../assets/Avatars/avt-1.png');
        case '2': return require('../../../assets/Avatars/avt-2.png');
        case '3': return require('../../../assets/Avatars/avt-3.png');
        case '4': return require('../../../assets/Avatars/avt-4.png');
        case '5': return require('../../../assets/Avatars/avt-5.png');
        case '6': return require('../../../assets/Avatars/avt-6.png');
        case '7': return require('../../../assets/Avatars/avt-7.png');
        case '8': return require('../../../assets/Avatars/avt-8.png');
        case '9': return require('../../../assets/Avatars/avt-9.png');
        default: return require('../../../assets/Avatars/avt-1.png');
      }
    } catch (error) {
      console.warn('Error loading avatar asset:', error);
      return require('../../../assets/Avatars/avt-1.png');
    }
  }
  
  // Default to first avatar if identifier is invalid or missing
  return require('../../../assets/Avatars/avt-1.png');
};

/**
 * Get all available avatar assets
 * @returns Array of all avatar assets
 */
export const getAllAvatarAssets = () => {
  return [
    require('../../../assets/Avatars/avt-1.png'),
    require('../../../assets/Avatars/avt-2.png'),
    require('../../../assets/Avatars/avt-3.png'),
    require('../../../assets/Avatars/avt-4.png'),
    require('../../../assets/Avatars/avt-5.png'),
    require('../../../assets/Avatars/avt-6.png'),
    require('../../../assets/Avatars/avt-7.png'),
    require('../../../assets/Avatars/avt-8.png'),
    require('../../../assets/Avatars/avt-9.png'),
  ];
};

/**
 * Get all available avatar identifiers
 * @returns Array of all avatar identifiers
 */
export const getAllAvatarIdentifiers = () => {
  return ['avatar_1', 'avatar_2', 'avatar_3', 'avatar_4', 'avatar_5', 'avatar_6', 'avatar_7', 'avatar_8', 'avatar_9'];
};
