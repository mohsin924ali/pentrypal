// ========================================
// Archived List Modal Component
// ========================================

import React from 'react';
import { Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Typography } from '../../../components/atoms/Typography/Typography';
import { useTheme } from '../../../providers/ThemeProvider';
import { baseStyles } from '../EnhancedListsScreen.styles';
import { DEFAULT_CURRENCY, formatCurrency } from '../../../../shared/utils/currencyUtils';
import type { ShoppingList } from '../../../../shared/types/lists';

interface ArchivedListModalProps {
  visible: boolean;
  list: ShoppingList | null;
  onClose: () => void;
}

export const ArchivedListModal: React.FC<ArchivedListModalProps> = ({ visible, list, onClose }) => {
  const { theme } = useTheme();

  if (!list) return null;

  // Calculate spending summary
  const spendingSummary =
    list.items
      ?.filter(item => item.completed && item.purchasedAmount && item.assignedTo)
      .reduce(
        (acc: Record<string, { amount: number; items: number }>, item) => {
          const userId = item.assignedTo!;
          const userSpending = acc[userId] || { amount: 0, items: 0 };
          acc[userId] = {
            amount: userSpending.amount + (item.purchasedAmount || 0),
            items: userSpending.items + 1,
          };
          return acc;
        },
        {} as Record<string, { amount: number; items: number }>
      ) || {};

  const totalSpent = Object.values(spendingSummary).reduce((sum, user) => sum + user.amount, 0);

  // Get collaborator names (would need to be passed as prop in real implementation)
  const getCollaboratorName = (userId: string) => {
    // In real implementation, this would look up user names from collaborators list
    return `User ${userId.substring(0, 8)}`;
  };

  return (
    <Modal visible={visible} transparent={true} animationType='fade' onRequestClose={onClose}>
      <View style={baseStyles.modalOverlay}>
        <View style={baseStyles.archivedModalContainer}>
          {/* Header */}
          <View style={baseStyles.archivedModalHeader}>
            <Typography variant='h3' style={baseStyles.archivedModalTitle}>
              📋 {list.name}
            </Typography>
          </View>

          <ScrollView style={baseStyles.archivedModalBody} showsVerticalScrollIndicator={false}>
            <Typography variant='body1' style={baseStyles.archivedModalSubtitle}>
              This list was completed and archived.
            </Typography>

            <View style={baseStyles.archivedInfoSection}>
              <View style={baseStyles.archivedInfoRow}>
                <Typography variant='body1' style={baseStyles.archivedInfoLabel}>
                  Total Items:
                </Typography>
                <Typography variant='body1' style={baseStyles.archivedInfoValue}>
                  {list.items?.length || 0}
                </Typography>
              </View>

              <View style={baseStyles.archivedInfoRow}>
                <Typography variant='body1' style={baseStyles.archivedInfoLabel}>
                  Completed:
                </Typography>
                <Typography variant='body1' style={baseStyles.archivedInfoValue}>
                  {list.items?.filter(item => item.completed).length || 0}
                </Typography>
              </View>

              <View style={baseStyles.archivedInfoRow}>
                <Typography variant='body1' style={baseStyles.archivedInfoLabel}>
                  Total Spent:
                </Typography>
                <Typography variant='body1' style={baseStyles.archivedInfoValue}>
                  {formatCurrency(totalSpent, DEFAULT_CURRENCY)}
                </Typography>
              </View>

              <View style={baseStyles.archivedInfoRow}>
                <Typography variant='body1' style={baseStyles.archivedInfoLabel}>
                  Collaborators:
                </Typography>
                <Typography variant='body1' style={baseStyles.archivedInfoValue}>
                  {list.collaborators?.length || 1}
                </Typography>
              </View>
            </View>

            {/* Collaborators Section */}
            {list.collaborators && list.collaborators.length > 0 && (
              <View>
                <Typography variant='h4' style={baseStyles.sectionTitle}>
                  👥 Collaborators
                </Typography>
                <Typography variant='body2' style={baseStyles.archivedCollaboratorsList}>
                  {list.collaborators.map(collab => getCollaboratorName(collab.userId)).join(', ')}
                </Typography>
              </View>
            )}

            {/* Items Section */}
            <View style={baseStyles.itemsSection}>
              <Typography variant='h4' style={baseStyles.sectionTitle}>
                🛒 Items ({list.items?.length || 0})
              </Typography>

              {list.items && list.items.length > 0 ? (
                list.items.map((item, index) => (
                  <View
                    key={item.id || index}
                    style={[baseStyles.itemRow, item.completed && baseStyles.completedItemRow]}>
                    {/* Checkbox */}
                    <View
                      style={[
                        baseStyles.itemCheckbox,
                        item.completed && baseStyles.itemCheckboxCompleted,
                      ]}>
                      {item.completed && (
                        <Typography variant='caption' style={baseStyles.checkmark}>
                          ✓
                        </Typography>
                      )}
                    </View>

                    {/* Item Info */}
                    <View style={{ flex: 1 }}>
                      <Typography
                        variant='body1'
                        style={[
                          baseStyles.itemName,
                          item.completed && baseStyles.completedItemName,
                        ]}>
                        {item.name}
                      </Typography>

                      <View style={baseStyles.itemMeta}>
                        <Typography variant='caption' style={baseStyles.itemQuantity}>
                          Qty: {item.quantity || 1}
                        </Typography>
                        {item.assignedTo && (
                          <Typography variant='caption' style={baseStyles.itemAssigned}>
                            Assigned to: {getCollaboratorName(item.assignedTo)}
                          </Typography>
                        )}
                      </View>
                    </View>

                    {/* Purchase Info */}
                    <View style={baseStyles.itemRight}>
                      {item.completed && item.purchasedAmount ? (
                        <View style={baseStyles.purchaseInfo}>
                          <Typography variant='body1' style={baseStyles.purchaseAmount}>
                            {formatCurrency(item.purchasedAmount, DEFAULT_CURRENCY)}
                          </Typography>
                          {item.assignedTo && (
                            <Typography variant='caption' style={baseStyles.purchasedBy}>
                              by {getCollaboratorName(item.assignedTo)}
                            </Typography>
                          )}
                        </View>
                      ) : (
                        <Typography variant='caption' style={baseStyles.notPurchased}>
                          Not purchased
                        </Typography>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Typography variant='body2' style={baseStyles.noItemsText}>
                  No items in this list.
                </Typography>
              )}
            </View>

            {/* Spending Summary */}
            {Object.keys(spendingSummary).length > 0 && (
              <View style={baseStyles.spendingSummarySection}>
                <Typography variant='h4' style={baseStyles.sectionTitle}>
                  💰 Spending Summary
                </Typography>

                {Object.entries(spendingSummary).map(([userId, summary]) => (
                  <View key={userId} style={baseStyles.spendingRow}>
                    <Typography variant='body1' style={baseStyles.spendingUser}>
                      {getCollaboratorName(userId)}
                    </Typography>
                    <View style={baseStyles.spendingDetails}>
                      <Typography variant='body1' style={baseStyles.spendingAmount}>
                        {formatCurrency(summary.amount, DEFAULT_CURRENCY)}
                      </Typography>
                      <Typography variant='caption' style={baseStyles.spendingItems}>
                        {summary.items} items
                      </Typography>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={baseStyles.archivedModalFooter}>
            <TouchableOpacity
              style={baseStyles.archivedCloseButton}
              onPress={onClose}
              activeOpacity={0.8}>
              <Typography variant='body1' style={baseStyles.archivedCloseButtonText}>
                Close
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
