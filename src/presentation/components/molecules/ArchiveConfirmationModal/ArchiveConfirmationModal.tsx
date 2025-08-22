/**
 * Archive Confirmation Modal Component
 * A polite confirmation modal for archiving shopping lists
 */

import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { Theme } from '@/shared/theme';
import { formatCurrency, DEFAULT_CURRENCY, type CurrencyCode } from '@/shared/utils/currencyUtils';

export interface ArchiveConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  listName: string;
  totalSpent: number;
  currency?: CurrencyCode;
  isLoading?: boolean;
}

export const ArchiveConfirmationModal: React.FC<ArchiveConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  listName,
  totalSpent,
  currency = DEFAULT_CURRENCY,
  isLoading = false,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <TouchableOpacity
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header with Icon */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Typography variant="h1" style={styles.icon}>
                  📦
                </Typography>
              </View>
              <Typography variant="h2" color={Theme.colors.text.primary} style={styles.title}>
                Complete Shopping
              </Typography>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Typography variant="body" color={Theme.colors.text.secondary} style={styles.message}>
                Great job shopping for "{listName}"! 
              </Typography>
              
              <Typography variant="body" color={Theme.colors.text.secondary} style={styles.description}>
                Would you like to mark this list as complete? Your list will be safely archived and you can view it anytime in your archived lists.
              </Typography>

              {totalSpent > 0 && (
                <View style={styles.spentContainer}>
                  <Typography variant="caption" color={Theme.colors.text.tertiary} style={styles.spentLabel}>
                    Total spent on this trip:
                  </Typography>
                  <Typography variant="h3" color="#16a34a" style={styles.spentAmount}>
                    {formatCurrency(totalSpent, currency)}
                  </Typography>
                </View>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Keep Shopping"
                variant="outline"
                onPress={onClose}
                disabled={isLoading}
                style={styles.cancelButton}
              />
              <Button
                title="Complete & Archive"
                variant="primary"
                onPress={onConfirm}
                disabled={isLoading}
                style={styles.confirmButton}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
  },
  modalContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    ...Theme.shadows.large,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
  },
  message: {
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Theme.spacing.lg,
  },
  spentContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: Theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  spentLabel: {
    marginBottom: Theme.spacing.xs,
    fontWeight: '500',
  },
  spentAmount: {
    fontWeight: '700',
    fontSize: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    borderColor: Theme.colors.border.light,
  },
  confirmButton: {
    flex: 1,
  },
});
