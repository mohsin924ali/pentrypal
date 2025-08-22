/**
 * Unfinished List Modal Component
 * A polite reminder modal for lists with remaining items
 */

import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Typography } from '../../atoms/Typography';
import { Button } from '../../atoms/Button';
import { Theme } from '@/shared/theme';

export interface UnfinishedListModalProps {
  visible: boolean;
  onClose: () => void;
  onContinueShopping: () => void;
  onFinishAnyway: () => void;
  listName: string;
  remainingItems: number;
  totalItems: number;
  isLoading?: boolean;
}

export const UnfinishedListModal: React.FC<UnfinishedListModalProps> = ({
  visible,
  onClose,
  onContinueShopping,
  onFinishAnyway,
  listName,
  remainingItems,
  totalItems,
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
                  🛒
                </Typography>
              </View>
              <Typography variant="h2" color={Theme.colors.text.primary} style={styles.title}>
                Still Shopping?
              </Typography>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Typography variant="body" color={Theme.colors.text.secondary} style={styles.message}>
                You have {remainingItems} item{remainingItems > 1 ? 's' : ''} left to shop for in "{listName}".
              </Typography>
              
              <Typography variant="body" color={Theme.colors.text.secondary} style={styles.description}>
                Would you like to continue shopping, or are you ready to finish for now?
              </Typography>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressInfo}>
                  <Typography variant="caption" color={Theme.colors.text.tertiary} style={styles.progressLabel}>
                    Shopping Progress
                  </Typography>
                  <Typography variant="caption" color={Theme.colors.text.secondary} style={styles.progressText}>
                    {totalItems - remainingItems} of {totalItems} items completed
                  </Typography>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${((totalItems - remainingItems) / totalItems) * 100}%` }
                    ]} 
                  />
                </View>
              </View>

              {/* Remaining Items Hint */}
              <View style={styles.hintContainer}>
                <Typography variant="caption" color="#f59e0b" style={styles.hintText}>
                  💡 You can always come back to finish shopping later!
                </Typography>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                title="Keep Shopping"
                variant="primary"
                onPress={onContinueShopping}
                disabled={isLoading}
                style={styles.continueButton}
              />
              <Button
                title="Finish Anyway"
                variant="outline"
                onPress={onFinishAnyway}
                disabled={isLoading}
                style={styles.finishButton}
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
    backgroundColor: '#FEF3C7',
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
  progressContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  progressLabel: {
    fontWeight: '500',
  },
  progressText: {
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  hintContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  hintText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'column',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
    gap: Theme.spacing.md,
  },
  continueButton: {
    // Primary button for recommended action
  },
  finishButton: {
    borderColor: Theme.colors.border.light,
  },
});
