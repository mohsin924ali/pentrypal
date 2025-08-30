// ========================================
// Assignment Modal - Item Assignment Interface
// ========================================

import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, TouchableOpacity, View, ViewStyle } from 'react-native';

// Components
import { Typography } from '../../atoms/Typography/Typography';
import { Button } from '../../atoms/Button/Button';

// Hooks and Utils
import { useTheme } from '../../../providers/ThemeProvider';
import { getAvatarProps, isCustomImageUri } from '../../../../shared/utils/avatarUtils';

// Types
import type { AssignmentModalProps, AvatarType } from '../../../../shared/types/lists';

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
  const { theme } = useTheme();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Ensure theme colors are available with robust fallback
  const safeTheme = theme?.colors
    ? theme
    : {
        colors: {
          primary: { '100': '#dcfce7', '500': '#22c55e' },
          text: { primary: '#000000', secondary: '#666666' },
          background: { primary: '#ffffff' },
          surface: { background: '#ffffff', secondary: '#f5f5f5' },
          border: { primary: '#e5e5e5' },
        },
      };

  if (!item) {
    console.log('AssignmentModal: No item provided');
    return null;
  }

  const isOwner = currentUserId === listOwnerId;
  const canAssign = isOwner || item.assignedTo === currentUserId || !item.assignedTo;

  if (!canAssign) {
    return null;
  }

  // Avatar display function
  const renderAvatar = (userId: string, size: number = 40) => {
    const avatar = getUserAvatar?.(userId);
    const avatarProps = getAvatarProps(avatar || 'default');

    const containerStyle = {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: safeTheme?.colors?.primary?.['500'] || '#22c55e',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      overflow: 'hidden' as const,
    };

    const imageStyle = {
      width: size,
      height: size,
      borderRadius: size / 2,
    };

    const textStyle = {
      fontSize: size * 0.4,
      fontWeight: '600' as const,
      color: (safeTheme?.colors as any)?.background?.primary || '#ffffff',
    };

    switch (avatarProps.type) {
      case 'asset':
      case 'uri':
        return (
          <View style={containerStyle}>
            <Image source={avatarProps.source as any} style={imageStyle as any} />
          </View>
        );

      case 'emoji':
        return (
          <View style={containerStyle}>
            <Typography style={textStyle}>{avatarProps.emoji}</Typography>
          </View>
        );

      default:
        return (
          <View style={containerStyle}>
            <Typography style={textStyle}>👤</Typography>
          </View>
        );
    }
  };

  const handleAssign = () => {
    if (selectedUserId) {
      onAssign(item.id, selectedUserId);
      setSelectedUserId(null);
    }
  };

  const handleUnassign = () => {
    Alert.alert('Unassign Item', `Are you sure you want to unassign "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unassign',
        style: 'destructive',
        onPress: () => onUnassign(item.id),
      },
    ]);
  };

  const availableCollaborators = collaborators.filter(c => {
    // Show all collaborators except the one already assigned (if any)
    return c.userId !== item.assignedTo;
  });

  return (
    <Modal visible={visible} transparent={true} animationType='slide' statusBarTranslucent={true}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: safeTheme?.colors?.surface?.background || '#ffffff' },
          ]}>
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: safeTheme?.colors?.border?.primary || '#e5e5e5' },
            ]}>
            <Typography
              variant='h3'
              color={safeTheme?.colors?.text?.primary || '#000000'}
              style={styles.modalTitle}>
              Assign Item
            </Typography>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Typography variant='h3' color={safeTheme?.colors?.text?.secondary || '#666666'}>
                ✕
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Item Info */}
          <View style={styles.itemInfoSection}>
            <View style={styles.itemHeader}>
              <Typography variant='h4' color={safeTheme?.colors?.text?.primary || '#000000'}>
                {item.icon} {item.name}
              </Typography>
              <Typography variant='caption' color={safeTheme?.colors?.text?.secondary || '#666666'}>
                {item.quantity} {item.unit} • {item.category.name}
              </Typography>
            </View>

            {/* Current Assignment */}
            {item.assignedTo && (
              <View style={styles.currentAssignmentSection}>
                <Typography
                  variant='body1'
                  color={safeTheme?.colors?.text?.secondary || '#666666'}
                  style={styles.sectionLabel}>
                  Currently assigned to:
                </Typography>
                <View style={styles.assignedUserCard}>
                  {renderAvatar(item.assignedTo, 32)}
                  <Typography
                    variant='body1'
                    color={safeTheme?.colors?.text?.primary || '#000000'}
                    style={styles.assignedUserName}>
                    {getUserName(item.assignedTo)}
                  </Typography>
                  <Button
                    title='Unassign'
                    variant='outline'
                    size='sm'
                    onPress={handleUnassign}
                    style={styles.unassignButton}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Collaborators List */}
          <ScrollView style={styles.modalContent}>
            <Typography
              variant='body1'
              color={safeTheme?.colors?.text?.secondary || '#666666'}
              style={styles.sectionLabel}>
              {item.assignedTo ? 'Reassign to:' : 'Assign to:'}
            </Typography>

            {availableCollaborators.length > 0 ? (
              availableCollaborators.map(collaborator => {
                const isSelected = selectedUserId === collaborator.userId;
                const isCurrentUser = collaborator.userId === currentUserId;

                return (
                  <TouchableOpacity
                    key={collaborator.userId}
                    style={[
                      styles.collaboratorItem,
                      {
                        backgroundColor:
                          (safeTheme?.colors?.surface as any)?.secondary || '#f5f5f5',
                      },
                      isSelected && {
                        backgroundColor: safeTheme?.colors?.primary?.['100'] || '#dcfce7',
                        borderColor: safeTheme?.colors?.primary?.['500'] || '#22c55e',
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => setSelectedUserId(collaborator.userId)}>
                    <View style={styles.collaboratorInfo}>
                      {renderAvatar(collaborator.userId)}
                      <View style={styles.collaboratorDetails}>
                        <Typography
                          variant='body1'
                          color={safeTheme?.colors?.text?.primary || '#000000'}
                          style={styles.collaboratorName}>
                          {collaborator.name} {isCurrentUser && '(You)'}
                        </Typography>
                        <Typography
                          variant='caption'
                          color={safeTheme?.colors?.text?.secondary || '#666666'}>
                          {collaborator.email} • {collaborator.role}
                        </Typography>
                      </View>
                    </View>

                    {isSelected && (
                      <View
                        style={[
                          styles.selectedIndicator,
                          { backgroundColor: safeTheme?.colors?.primary?.['500'] || '#22c55e' },
                        ]}>
                        <Typography
                          variant='caption'
                          color={(safeTheme?.colors as any)?.background?.primary || '#ffffff'}>
                          ✓
                        </Typography>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Typography
                  variant='body1'
                  color={safeTheme?.colors?.text?.secondary || '#666666'}
                  style={styles.emptyText}>
                  No other collaborators available for assignment.
                </Typography>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalActions}>
            <Button
              title='Cancel'
              variant='outline'
              size='md'
              onPress={onClose}
              style={styles.cancelButton}
            />
            <Button
              title={item.assignedTo ? 'Reassign' : 'Assign'}
              variant='primary'
              size='md'
              onPress={handleAssign}
              disabled={!selectedUserId}
              style={styles.assignButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ========================================
// Styles
// ========================================

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  } as ViewStyle,

  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '60%',
  } as ViewStyle,

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  } as ViewStyle,

  modalTitle: {
    fontWeight: '700',
  } as ViewStyle,

  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  itemInfoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  } as ViewStyle,

  itemHeader: {
    marginBottom: 16,
  } as ViewStyle,

  currentAssignmentSection: {
    marginTop: 16,
  } as ViewStyle,

  sectionLabel: {
    marginBottom: 12,
    fontWeight: '600',
  } as ViewStyle,

  assignedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    gap: 12,
  } as ViewStyle,

  assignedUserName: {
    flex: 1,
    fontWeight: '500',
  } as ViewStyle,

  unassignButton: {
    minWidth: 80,
  } as ViewStyle,

  modalContent: {
    flex: 1,
    padding: 20,
  } as ViewStyle,

  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  } as ViewStyle,

  collaboratorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  } as ViewStyle,

  collaboratorDetails: {
    flex: 1,
  } as ViewStyle,

  collaboratorName: {
    fontWeight: '600',
    marginBottom: 2,
  } as ViewStyle,

  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as ViewStyle,

  modalActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
  } as ViewStyle,

  cancelButton: {
    flex: 1,
  } as ViewStyle,

  assignButton: {
    flex: 1,
  } as ViewStyle,
};
