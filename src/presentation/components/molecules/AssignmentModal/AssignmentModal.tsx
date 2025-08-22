/**
 * Assignment Modal
 * Modal for assigning items to collaborators
 */

import React, { useState } from 'react';
import {
  View,
  Modal,
  ScrollView,
  TouchableOpacity,
  ViewStyle,
  Alert,
  Text,
  Image,
} from 'react-native';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';
import { Button } from '@/presentation/components/atoms/Button';
import type { ShoppingItem, Collaborator } from '@/application/store/slices/shoppingListsSlice';
import { getAvatarAsset, isValidAvatarIdentifier, isCustomImageUri } from '@/shared/utils/avatarUtils';

export interface AssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  item: ShoppingItem | null;
  collaborators: Collaborator[];
  currentUserId: string;
  listOwnerId: string;
  onAssign: (itemId: string, userId: string) => void;
  onUnassign: (itemId: string) => void;
  getUserName: (userId: string) => string;
  getUserAvatar?: (userId: string) => string;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  visible,
  onClose,
  item,
  collaborators,
  currentUserId,
  listOwnerId,
  onAssign,
  onUnassign,
  getUserName,
  getUserAvatar,
}) => {
  // Avatar display function
  const renderAvatar = (userId: string) => {
    const avatar = getUserAvatar?.(userId);
    
    if (typeof avatar === 'object') {
      // It's a local asset
      return (
        <Image
          source={avatar}
          style={styles.avatarImage}
        />
      );
    }
    if (typeof avatar === 'number') {
      // It's a require() result (number) - treat as local asset
      return (
        <Image
          source={avatar}
          style={styles.avatarImage}
        />
      );
    }
    if (typeof avatar === 'string' && isCustomImageUri(avatar)) {
      // It's a custom image URI
      return (
        <Image
          key={`assignment-avatar-${avatar}`}
          source={{ uri: avatar }}
          style={styles.avatarImage}
        />
      );
    }
    return (
      <Typography 
        variant="body" 
        style={styles.avatarText}
      >
        {avatar || '👤'}
      </Typography>
    );
  };

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (!item) {
    console.log('AssignmentModal: No item provided');
    return null;
  }
  


  const isOwner = currentUserId === listOwnerId;
  const canAssign = isOwner || item.assignedTo === currentUserId || !item.assignedTo;

  // Robust: Handle both old and new data formats during transition
  const allUsers = collaborators.map(collab => {
    // Handle both shared types (id) and Redux types (userId)
    const userId = (collab as any).userId || (collab as any).id;
    const userRole = (collab as any).role || 'collaborator';
    

    
    // Use the avatar directly from collaborator data (since collaborators don't have email)
    const avatar = collab.avatar || '👤';
    
    return {
      id: userId,
      name: collab.name,
      avatar: avatar,
      role: userRole
    };
  }).filter(user => user.id); // Filter out users with undefined IDs
  

  
  // If no collaborators found, add current user as fallback
  if (allUsers.length === 0 && currentUserId) {
    allUsers.push({
      id: currentUserId,
      name: getUserName(currentUserId),
      avatar: getUserAvatar?.(currentUserId) || '👤',
      role: 'owner'
    });
  }

  const handleAssign = () => {
    if (!selectedUserId) return;
    
    onAssign(item.id, selectedUserId);
    onClose();
    setSelectedUserId(null);
  };

  const handleUnassign = () => {
    Alert.alert(
      'Unassign Item',
      `Are you sure you want to unassign "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unassign',
          style: 'destructive',
          onPress: () => {
            onUnassign(item.id);
            onClose();
          },
        },
      ]
    );
  };



  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Typography
              variant="h3"
              color={Theme.colors.text.primary}
              style={styles.title}
            >
              Assign Item
            </Typography>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Typography
                variant="body"
                color={Theme.colors.text.secondary}
              >
                ✕
              </Typography>
            </TouchableOpacity>
          </View>

          <View style={styles.itemInfo}>
            <Typography
              variant="body"
              color={Theme.colors.text.primary}
              style={styles.itemName}
            >
              {item.name}
            </Typography>
            <Typography
              variant="caption"
              color={Theme.colors.text.secondary}
            >
              {item.quantity} {item.unit} • {item.category.name}
            </Typography>
          </View>

          {!canAssign && (
            <View style={styles.permissionNotice}>
              <Typography
                variant="caption"
                color={Theme.colors.warning}
                style={styles.permissionText}
              >
                Only the list owner or current assignee can reassign this item
              </Typography>
            </View>
          )}

          <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
            <Typography
              variant="body"
              color={Theme.colors.text.primary}
              style={styles.sectionTitle}
            >
              Select Collaborator
            </Typography>
            <Typography
              variant="caption"
              color={Theme.colors.text.secondary}
              style={styles.sectionSubtitle}
            >
              Choose who to assign this item to
            </Typography>
            
            {allUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Typography variant="body" color={Theme.colors.text.secondary} style={styles.emptyText}>
                  No collaborators available
                </Typography>
              </View>
            ) : (
              <View style={styles.usersGrid}>
                {allUsers.map((user) => {
                  const isSelected = selectedUserId === user.id;
                  const isCurrentlyAssigned = item.assignedTo === user.id;
                  
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={[
                        styles.userCard,
                        isSelected && styles.userCardSelected,
                        isCurrentlyAssigned && styles.userCardCurrentlyAssigned,
                        !canAssign && styles.userCardDisabled,
                      ]}
                      onPress={() => {
                        if (canAssign) {
                          setSelectedUserId(user.id);
                        }
                      }}
                      disabled={!canAssign}
                      activeOpacity={canAssign ? 0.8 : 1}
                    >
                      {/* Avatar */}
                      <View style={[
                        styles.userAvatar,
                        isSelected && styles.userAvatarSelected,
                        isCurrentlyAssigned && styles.userAvatarCurrentlyAssigned,
                      ]}>
                        {renderAvatar(user.id)}
                      </View>

                      {/* User Info */}
                      <View style={styles.userInfo}>
                        <Typography
                          variant="body"
                          color={Theme.colors.text.primary}
                          style={styles.userName}
                          numberOfLines={1}
                        >
                          {user.name}
                        </Typography>
                        
                        {/* Role Badge */}
                        <View style={[
                          styles.roleBadge,
                          user.role === 'owner' ? styles.ownerBadge : styles.collaboratorBadge,
                        ]}>
                          <Typography
                            variant="caption"
                            style={[
                              styles.roleText,
                              user.role === 'owner' ? styles.ownerText : styles.collaboratorText,
                            ]}
                          >
                            {user.role === 'owner' ? 'Owner' : 'Collaborator'}
                          </Typography>
                        </View>

                        {/* Assignment Status */}
                        {isCurrentlyAssigned && (
                          <Typography
                            variant="caption"
                            color={Theme.colors.primary[500]}
                            style={styles.assignmentStatus}
                          >
                            Currently Assigned
                          </Typography>
                        )}
                      </View>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <View style={styles.selectionIndicator}>
                          <Typography
                            variant="body"
                            style={styles.checkmark}
                          >
                            ✓
                          </Typography>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {item.assignedTo && canAssign && (
              <Button
                title="Unassign"
                variant="outline"
                size="medium"
                onPress={handleUnassign}
                style={styles.unassignButton}
              />
            )}
            <Button
              title="Assign"
              variant="primary"
              size="medium"
              onPress={handleAssign}
              disabled={!selectedUserId || !canAssign}
              style={styles.assignButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  } as ViewStyle,

  modal: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%', // Changed from maxHeight to fixed height
    paddingTop: 50, // Increased padding to account for status bar
    flex: 1, // Added flex
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.primary,
  } as ViewStyle,

  title: {
    fontWeight: '600',
  } as ViewStyle,

  closeButton: {
    padding: 4,
  } as ViewStyle,

  itemInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Theme.colors.background.secondary,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  } as ViewStyle,

  itemName: {
    fontWeight: '500',
    marginBottom: 4,
  } as ViewStyle,

  permissionNotice: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
  } as ViewStyle,

  permissionText: {
    textAlign: 'center',
  } as ViewStyle,

  usersList: {
    flex: 1, // Keep flex to take available space
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 100, // Add margin to prevent overlap with actions
    minHeight: 200, // Ensure minimum height for content
  } as ViewStyle,

  sectionTitle: {
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 4,
  } as ViewStyle,

  sectionSubtitle: {
    marginBottom: 20,
  } as ViewStyle,

  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as ViewStyle,

  usersGrid: {
    gap: 12,
  } as ViewStyle,

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: 16,
    borderWidth: 2,
    borderColor: Theme.colors.border.light,
    ...Theme.shadows.sm,
  } as ViewStyle,

  userCardSelected: {
    borderColor: Theme.colors.primary[500],
    backgroundColor: Theme.colors.primary[50],
  } as ViewStyle,

  userCardCurrentlyAssigned: {
    borderColor: Theme.colors.success[500],
    backgroundColor: Theme.colors.success[50],
  } as ViewStyle,

  userCardDisabled: {
    opacity: 0.6,
  } as ViewStyle,

  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Theme.colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  } as ViewStyle,

  userAvatarSelected: {
    backgroundColor: Theme.colors.primary[500],
  } as ViewStyle,

  userAvatarCurrentlyAssigned: {
    backgroundColor: Theme.colors.success[500],
  } as ViewStyle,

  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  } as ViewStyle,

  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  } as ViewStyle,

  avatarTextSelected: {
    color: Theme.colors.text.inverse,
  } as ViewStyle,

  userInfo: {
    flex: 1,
    marginRight: 8,
  } as ViewStyle,

  userName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  } as ViewStyle,

  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.md,
    marginBottom: 2,
  } as ViewStyle,

  ownerBadge: {
    backgroundColor: Theme.colors.secondary[100],
  } as ViewStyle,

  collaboratorBadge: {
    backgroundColor: Theme.colors.neutral[100],
  } as ViewStyle,

  roleText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  } as ViewStyle,

  ownerText: {
    color: Theme.colors.secondary[600],
  } as ViewStyle,

  collaboratorText: {
    color: Theme.colors.neutral[600],
  } as ViewStyle,

  assignmentStatus: {
    fontWeight: '500',
    fontSize: 11,
  } as ViewStyle,

  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  userOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.border.primary,
    backgroundColor: Theme.colors.background.primary,
  } as ViewStyle,

  userOptionSelected: {
    borderColor: Theme.colors.primary,
    backgroundColor: `${Theme.colors.primary}10`,
  } as ViewStyle,

  userOptionCurrentlyAssigned: {
    backgroundColor: Theme.colors.background.secondary,
  } as ViewStyle,

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  } as ViewStyle,

  avatarText: {
    color: Theme.colors.background.primary,
    fontWeight: '600',
  } as ViewStyle,

  userDetails: {
    flex: 1,
  } as ViewStyle,

  userName: {
    fontWeight: '500',
    marginBottom: 2,
  } as ViewStyle,

  checkmark: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text.inverse,
  } as ViewStyle,

  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30, // Extra padding at bottom
    gap: 12,
    backgroundColor: Theme.colors.background.primary, // Ensure solid background
    borderTopWidth: 1, // Add separator
    borderTopColor: Theme.colors.border.primary,
  } as ViewStyle,

  unassignButton: {
    flex: 1,
  } as ViewStyle,

  assignButton: {
    flex: 1,
  } as ViewStyle,
};
