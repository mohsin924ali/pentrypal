/**
 * Profile Screen
 * User profile management with avatar selection and settings
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  Image,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';
import { BottomNavigation } from '@/presentation/components/organisms';
import type { NavigationTab } from '@/presentation/components/organisms';
import AuthService from '@/infrastructure/services/authService';
import { getAvatarAsset, getAllAvatarAssets, isValidAvatarIdentifier, isCustomImageUri } from '@/shared/utils/avatarUtils';
import { SUPPORTED_CURRENCIES, type CurrencyCode, getCurrencyByCode } from '@/shared/utils/currencyUtils';

export interface ProfileScreenProps {
  onBackPress: () => void;
  onNavigationTabPress: (tab: NavigationTab) => void;
  currentUser?: any;
  onUserUpdated?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBackPress,
  onNavigationTabPress,
  currentUser,
  onUserUpdated,
}) => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  // Get all available avatar options
  const avatarOptions = getAllAvatarAssets();

  useEffect(() => {
    loadUserProfile();
  }, [currentUser]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      if (currentUser) {
        const profile = await AuthService.getUserProfile(currentUser.id);
        setUserProfile(profile);
      } else {
        // Fallback to session-based loading
        const session = await AuthService.getCurrentSession();
        if (session?.user) {
          const profile = await AuthService.getUserProfile(session.user.id);
          setUserProfile(profile);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setShowAvatarModal(true);
  };

  const handleAvatarSelect = async (avatarIndex: number) => {
    try {
      if (userProfile) {
        // Convert the index to a string identifier for storage
        const avatarIdentifier = `avatar_${avatarIndex + 1}`;
        
        console.log('handleAvatarSelect DEBUG - avatarIndex:', avatarIndex, 'avatarIdentifier:', avatarIdentifier);
        
        const updatedProfile = await AuthService.updateUserProfile(userProfile.id, {
          avatar: avatarIdentifier
        });
        
        if (updatedProfile) {
          setUserProfile(updatedProfile);
          setShowAvatarModal(false);
          
          // Update current user session
          const session = await AuthService.getCurrentSession();
          if (session?.user) {
            session.user.avatar = avatarIdentifier;
          }
          
          // Notify parent component to refresh current user data
          if (onUserUpdated) {
            onUserUpdated();
          }
          
          Alert.alert('Success', 'Avatar updated successfully!');
        }
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert('Error', 'Failed to update avatar. Please try again.');
    }
  };

  const handleGalleryPicker = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photo library to select an avatar.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        if (userProfile) {
          // Store the custom image URI with a special prefix
          const customAvatarId = `custom_${Date.now()}`;
          
          const updatedProfile = await AuthService.updateUserProfile(userProfile.id, {
            avatar: imageUri // Store the URI directly for custom images
          });
          
          if (updatedProfile) {
            setUserProfile(updatedProfile);
            setShowAvatarModal(false);
            
            // Update current user session
            const session = await AuthService.getCurrentSession();
            if (session?.user) {
              session.user.avatar = imageUri;
            }
            
            // Notify parent component to refresh current user data
            if (onUserUpdated) {
              onUserUpdated();
            }
            
            Alert.alert('Success', 'Custom avatar updated successfully!');
          }
        }
      }
    } catch (error) {
      console.error('Error selecting image from gallery:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleCurrencySelect = async (currency: CurrencyCode) => {
    try {
      if (userProfile) {
        const updatedProfile = await AuthService.updateUserProfile(userProfile.id, {
          preferences: {
            ...userProfile.preferences,
            currency: currency
          }
        });
        
        if (updatedProfile) {
          setUserProfile(updatedProfile);
          setShowCurrencyModal(false);
          Alert.alert('Success', `Currency updated to ${getCurrencyByCode(currency).name}!`);
        }
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      Alert.alert('Error', 'Failed to update currency. Please try again.');
    }
  };

  const handleSettings = () => {
    console.log('Settings functionality coming soon!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: onBackPress 
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Typography variant="body" color={Theme.colors.text.secondary}>
            Loading profile...
          </Typography>
        </View>
        <BottomNavigation activeTab="profile" onTabPress={onNavigationTabPress} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h1" color={Theme.colors.text.primary} style={styles.headerTitle}>
          Profile
        </Typography>
        <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
          <Typography variant="h2" style={styles.settingsIcon}>⚙️</Typography>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity style={styles.avatar} onPress={() => setShowAvatarModal(true)}>
              {(() => {
                const avatar = userProfile?.avatar;
                
                // Check if it's a custom image (URI)
                if (isCustomImageUri(avatar)) {
                  return (
                    <Image 
                      source={{ uri: avatar }} 
                      style={styles.avatarImage}
                    />
                  );
                }
                
                // Check if it's a predefined avatar
                if (isValidAvatarIdentifier(avatar)) {
                  return (
                    <Image 
                      source={getAvatarAsset(avatar)} 
                      style={styles.avatarImage}
                    />
                  );
                }
                
                // Fallback to emoji or default
                return (
                  <Typography variant="h1" style={styles.avatarText}>
                    {avatar || '👤'}
                  </Typography>
                );
              })()}
              <View style={styles.editAvatarOverlay}>
                <Typography variant="caption" color={Theme.colors.background.primary} style={styles.editIcon}>
                  ✏️
                </Typography>
              </View>
            </TouchableOpacity>
          </View>
          
          <Typography variant="h2" color={Theme.colors.text.primary} style={styles.userName}>
            {userProfile?.name || 'User Name'}
          </Typography>
          <Typography variant="body" color={Theme.colors.text.secondary} style={styles.userEmail}>
            {userProfile?.email || 'user@example.com'}
          </Typography>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Typography variant="body" color={Theme.colors.primary[500]} style={styles.editButtonText}>
              Change Avatar
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Bio Section */}
        {userProfile?.bio && (
          <View style={styles.bioCard}>
            <Typography variant="h3" color={Theme.colors.text.primary} style={styles.bioTitle}>
              About
            </Typography>
            <Typography variant="body" color={Theme.colors.text.secondary} style={styles.bioText}>
              {userProfile.bio}
            </Typography>
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Typography variant="h2" color={Theme.colors.text.primary} style={styles.statNumber}>
              {userProfile?.stats?.listsCreated || '0'}
            </Typography>
            <Typography variant="caption" color={Theme.colors.text.secondary} style={styles.statLabel}>
              Lists Created
            </Typography>
          </View>
          <View style={styles.statCard}>
            <Typography variant="h2" color={Theme.colors.text.primary} style={styles.statNumber}>
              {userProfile?.stats?.collaborations || '0'}
            </Typography>
            <Typography variant="caption" color={Theme.colors.text.secondary} style={styles.statLabel}>
              Collaborations
            </Typography>
          </View>
          <View style={styles.statCard}>
            <Typography variant="h2" color={Theme.colors.text.primary} style={styles.statNumber}>
              {userProfile?.stats?.totalFriends || '0'}
            </Typography>
            <Typography variant="caption" color={Theme.colors.text.secondary} style={styles.statLabel}>
              Friends
            </Typography>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Typography variant="h3" style={styles.menuIcon}>📊</Typography>
            <Typography variant="body" color={Theme.colors.text.primary} style={styles.menuText}>
              Activity
            </Typography>
            <Typography variant="body" color={Theme.colors.text.secondary} style={styles.menuArrow}>
              ›
            </Typography>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Typography variant="h3" style={styles.menuIcon}>🔔</Typography>
            <Typography variant="body" color={Theme.colors.text.primary} style={styles.menuText}>
              Notifications
            </Typography>
            <Typography variant="body" color={Theme.colors.text.secondary} style={styles.menuArrow}>
              ›
            </Typography>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Typography variant="h3" style={styles.menuIcon}>🔒</Typography>
            <Typography variant="body" color={Theme.colors.text.primary} style={styles.menuText}>
              Privacy
            </Typography>
            <Typography variant="body" color={Theme.colors.text.secondary} style={styles.menuArrow}>
              ›
            </Typography>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowCurrencyModal(true)}>
            <Typography variant="h3" style={styles.menuIcon}>💱</Typography>
            <Typography variant="body" color={Theme.colors.text.primary} style={styles.menuText}>
              Currency
            </Typography>
            <View style={styles.menuRightContent}>
              <Typography variant="body" color={Theme.colors.text.secondary} style={styles.currencyDisplay}>
                {userProfile?.preferences?.currency ? getCurrencyByCode(userProfile.preferences.currency).symbol : '$'}
              </Typography>
              <Typography variant="body" color={Theme.colors.text.secondary} style={styles.menuArrow}>
                ›
              </Typography>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Typography variant="h3" style={styles.menuIcon}>❓</Typography>
            <Typography variant="body" color={Theme.colors.text.primary} style={styles.menuText}>
              Help & Support
            </Typography>
            <Typography variant="body" color={Theme.colors.text.secondary} style={styles.menuArrow}>
              ›
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Typography variant="body" color="#EF4444" style={styles.logoutText}>
            Log Out
          </Typography>
        </TouchableOpacity>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <BottomNavigation activeTab="profile" onTabPress={onNavigationTabPress} />
      
      {/* Avatar Selection Modal */}
      <Modal
        visible={showAvatarModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAvatarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h2" color={Theme.colors.text.primary} style={styles.modalTitle}>
                Choose Avatar
              </Typography>
              <TouchableOpacity onPress={() => setShowAvatarModal(false)} style={styles.closeButton}>
                <Typography variant="h3" color={Theme.colors.text.secondary} style={styles.modalClose}>
                  ✕
                </Typography>
              </TouchableOpacity>
            </View>
            
            {/* Gallery Option */}
            <TouchableOpacity style={styles.galleryButton} onPress={handleGalleryPicker}>
              <Typography variant="h3" style={styles.galleryIcon}>📷</Typography>
              <Typography variant="body" color={Theme.colors.text.primary} style={styles.galleryText}>
                Choose from Gallery
              </Typography>
            </TouchableOpacity>
            
            {/* Divider */}
            <View style={styles.divider}>
              <Typography variant="caption" color={Theme.colors.text.secondary} style={styles.dividerText}>
                Or choose from preset avatars
              </Typography>
            </View>
            
            <FlatList
              data={avatarOptions}
              numColumns={3}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={styles.avatarOption}
                  onPress={() => handleAvatarSelect(index)}
                >
                  <Image 
                    source={item} 
                    style={styles.avatarOptionImage}
                  />
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.avatarGrid}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
      
      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="h2" color={Theme.colors.text.primary} style={styles.modalTitle}>
                Select Currency
              </Typography>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)} style={styles.closeButton}>
                <Typography variant="h3" color={Theme.colors.text.secondary} style={styles.modalClose}>
                  ✕
                </Typography>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.currencyList} showsVerticalScrollIndicator={false}>
              {SUPPORTED_CURRENCIES.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={[
                    styles.currencyOption,
                    userProfile?.preferences?.currency === currency.code && styles.selectedCurrencyOption
                  ]}
                  onPress={() => handleCurrencySelect(currency.code)}
                >
                  <View style={styles.currencyInfo}>
                    <Typography variant="h3" style={styles.currencyFlag}>
                      {currency.flag}
                    </Typography>
                    <View style={styles.currencyDetails}>
                      <Typography variant="body" color={Theme.colors.text.primary} style={styles.currencyName}>
                        {currency.name}
                      </Typography>
                      <Typography variant="caption" color={Theme.colors.text.secondary} style={styles.currencyCode}>
                        {currency.code}
                      </Typography>
                    </View>
                  </View>
                  <Typography variant="h3" color={Theme.colors.text.primary} style={styles.currencySymbol}>
                    {currency.symbol}
                  </Typography>
                  {userProfile?.preferences?.currency === currency.code && (
                    <Typography variant="body" color={Theme.colors.primary[500]} style={styles.checkMark}>
                      ✓
                    </Typography>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.primary,
  },
  
  headerTitle: {
    fontWeight: '700',
  },
  
  settingsButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background.secondary,
  },
  
  settingsIcon: {
    fontSize: 20,
  },
  
  scrollView: {
    flex: 1,
  },
  
  profileCard: {
    backgroundColor: Theme.colors.background.primary,
    margin: Theme.spacing.lg,
    borderRadius: Theme.borderRadius['2xl'],
    padding: Theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  avatarContainer: {
    marginBottom: Theme.spacing.md,
    position: 'relative',
  },
  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  
  avatarText: {
    fontSize: 40,
  },
  
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Theme.colors.background.primary,
  },
  
  editIcon: {
    fontSize: 12,
  },
  
  userName: {
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
    textAlign: 'center',
  },
  
  userEmail: {
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  },
  
  editButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: `${Theme.colors.primary[500]}15`,
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
  },
  
  editButtonText: {
    fontWeight: '600',
  },
  
  bioCard: {
    backgroundColor: Theme.colors.background.primary,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
  },
  
  bioTitle: {
    fontWeight: '600',
    marginBottom: Theme.spacing.sm,
  },
  
  bioText: {
    lineHeight: 20,
  },
  
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.sm,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.xl,
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  
  statNumber: {
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  },
  
  statLabel: {
    textAlign: 'center',
    fontSize: 11,
  },
  
  menuContainer: {
    backgroundColor: Theme.colors.background.primary,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.primary,
  },
  
  menuIcon: {
    marginRight: Theme.spacing.md,
    fontSize: 18,
  },
  
  menuText: {
    flex: 1,
    fontWeight: '500',
  },
  
  menuArrow: {
    fontSize: 18,
    fontWeight: '300',
  },
  
  logoutButton: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.xl,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  
  logoutText: {
    fontWeight: '600',
  },
  
  bottomPadding: {
    height: Theme.spacing.xl,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius['2xl'],
    padding: Theme.spacing.xl,
    width: '90%',
    maxHeight: '70%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  
  modalTitle: {
    fontWeight: '700',
  },
  
  closeButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.background.secondary,
  },
  
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  avatarGrid: {
    paddingVertical: Theme.spacing.sm,
  },
  
  avatarOption: {
    flex: 1,
    margin: Theme.spacing.sm,
    aspectRatio: 1,
    borderRadius: Theme.borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  avatarOptionImage: {
    width: '100%',
    height: '100%',
  },
  
  // Gallery selection styles
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: Theme.colors.primary[50],
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.primary[200],
    marginBottom: Theme.spacing.lg,
  },
  
  galleryIcon: {
    fontSize: 20,
    marginRight: Theme.spacing.sm,
  },
  
  galleryText: {
    fontWeight: '600',
    color: Theme.colors.primary[600],
  },
  
  divider: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  
  dividerText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  
  // Currency selection styles
  menuRightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  currencyDisplay: {
    marginRight: Theme.spacing.sm,
    fontWeight: '600',
  },
  
  currencyList: {
    maxHeight: 400,
  },
  
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.primary,
  },
  
  selectedCurrencyOption: {
    backgroundColor: Theme.colors.primary[50],
    borderBottomColor: Theme.colors.primary[200],
  },
  
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  currencyFlag: {
    fontSize: 24,
    marginRight: Theme.spacing.md,
  },
  
  currencyDetails: {
    flex: 1,
  },
  
  currencyName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  
  currencyCode: {
    fontSize: 12,
    opacity: 0.7,
  },
  
  currencySymbol: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: Theme.spacing.sm,
    color: Theme.colors.text.secondary,
  },
  
  checkMark: {
    fontSize: 18,
    fontWeight: '700',
  },
});
