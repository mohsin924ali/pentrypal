// ========================================
// Modern Professional Receipt Template Component
// ========================================

import React from 'react';
import { View } from 'react-native';
import { Typography } from '../../../components/atoms/Typography/Typography';
import { formatCurrency } from '../../../../shared/utils/currencyUtils';
import type { ShoppingList } from '../../../../shared/types/lists';
import type { Theme } from '../../../../shared/types/ui';

interface ReceiptTemplateProps {
  list: ShoppingList;
  theme: Theme;
  totalSpent: number;
  spendingSummary: Record<string, { amount: number; items: number }>;
  getCollaboratorName: (userId: string) => string;
}

export const ReceiptTemplate: React.FC<ReceiptTemplateProps> = ({
  list,
  theme,
  totalSpent,
  spendingSummary,
  getCollaboratorName,
}) => {
  const now = new Date();
  const receiptDate = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const receiptTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const currency = list.budget?.currency || 'USD';
  const receiptId = `PP-${list.id?.slice(0, 8)?.toUpperCase() || Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  const completedItems = list.items?.filter(item => item.completed) || [];
  const totalItems = list.items?.length || 0;
  const completionPercentage =
    totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 0;
  const teamSize = (list.collaborators?.length || 0) + 1; // +1 for owner

  // Modern color scheme inspired by the HTML template but using brand colors
  const colors = {
    primary: theme.colors.semantic.info[600], // Professional indigo-blue
    primaryLight: theme.colors.semantic.info[500],
    primaryBg: theme.colors.semantic.info[50],
    secondary: theme.colors.semantic.success[600], // Success green
    secondaryBg: theme.colors.semantic.success[50],
    accent: theme.colors.secondary[600], // Brand orange
    accentBg: theme.colors.secondary[50],
    purple: theme.colors.accent[600],
    purpleBg: theme.colors.accent[50],
    dark: theme.colors.neutral[800],
    medium: theme.colors.neutral[600],
    light: theme.colors.neutral[500],
    lighter: theme.colors.neutral[400],
    background: theme.colors.neutral[50],
    white: theme.colors.surface.card,
    border: theme.colors.border.primary,
  };

  return (
    <View
      style={{
        backgroundColor: colors.background,
        maxWidth: 400,
        minHeight: 900,
        padding: theme.spacing.sm,
        borderRadius: theme.borders.radius.xl,
        ...theme.shadows.lg,
      }}>
      {/* Modern Header Section */}
      <View style={{ alignItems: 'center', marginBottom: theme.spacing.sm }}>
        <View
          style={{
            backgroundColor: colors.primaryBg,
            borderRadius: theme.borders.radius.full,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.xs,
            marginBottom: theme.spacing.xs,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Typography
            variant='body1'
            style={{
              color: colors.primary,
              fontWeight: '600',
              fontSize: 16,
              marginRight: theme.spacing.xs,
            }}>
            📄
          </Typography>
          <Typography
            variant='h4'
            style={{
              color: colors.primary,
              fontWeight: 'bold',
              fontSize: 16,
            }}>
            PantryPal
          </Typography>
        </View>
        <Typography
          variant='caption'
          style={{
            color: colors.light,
            fontSize: 12,
          }}>
          Your Smart Shopping Receipt
        </Typography>
      </View>

      {/* Main Receipt Card */}
      <View
        style={{
          backgroundColor: colors.white,
          borderRadius: theme.borders.radius.xl,
          ...theme.shadows.sm,
        }}>
        {/* Receipt ID Section */}
        <View style={{ padding: theme.spacing.sm }}>
          <View style={{ alignItems: 'center', marginBottom: theme.spacing.sm }}>
            <View
              style={{
                backgroundColor: colors.background,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs / 2,
                borderRadius: theme.borders.radius.full,
              }}>
              <Typography
                variant='caption'
                style={{
                  color: colors.medium,
                  fontSize: 10,
                  fontWeight: '500',
                }}>
                Receipt ID: {receiptId}
              </Typography>
            </View>
          </View>

          {/* Receipt Info Grid - Modern 3-Column Layout */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.sm,
              paddingBottom: theme.spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              borderStyle: 'dashed',
            }}>
            <View style={{ alignItems: 'center' }}>
              <Typography variant='caption' style={{ color: colors.light, fontSize: 11 }}>
                Date
              </Typography>
              <Typography
                variant='caption'
                style={{
                  color: colors.dark,
                  fontWeight: '600',
                  fontSize: 12,
                }}>
                {receiptDate}
              </Typography>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Typography variant='caption' style={{ color: colors.light, fontSize: 11 }}>
                Time
              </Typography>
              <Typography
                variant='caption'
                style={{
                  color: colors.dark,
                  fontWeight: '600',
                  fontSize: 12,
                }}>
                {receiptTime}
              </Typography>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Typography variant='caption' style={{ color: colors.light, fontSize: 11 }}>
                List
              </Typography>
              <Typography
                variant='caption'
                style={{
                  color: colors.dark,
                  fontWeight: '600',
                  fontSize: 12,
                }}
                numberOfLines={1}>
                {list.name}
              </Typography>
            </View>
          </View>

          {/* Modern Shopping Summary - 4-Column Grid */}
          <View style={{ marginBottom: theme.spacing.sm }}>
            <Typography
              variant='body1'
              style={{
                color: colors.dark,
                fontWeight: '600',
                fontSize: 14,
                marginBottom: theme.spacing.xs,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              📊 Shopping Summary
            </Typography>

            {/* 4-Column Grid Layout matching HTML template */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: theme.spacing.xs / 2,
              }}>
              {/* Total Items */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  padding: theme.spacing.xs,
                  borderRadius: theme.borders.radius.lg,
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: colors.primaryBg,
                    padding: theme.spacing.xs / 2,
                    borderRadius: theme.borders.radius.full,
                    marginBottom: theme.spacing.xs / 2,
                  }}>
                  <Typography variant='caption' style={{ color: colors.primary, fontSize: 16 }}>
                    🛍️
                  </Typography>
                </View>
                <Typography
                  variant='caption'
                  style={{ color: colors.light, fontSize: 10, marginBottom: 2 }}>
                  Total Items
                </Typography>
                <Typography
                  variant='caption'
                  style={{ color: colors.dark, fontWeight: 'bold', fontSize: 14 }}>
                  {totalItems}
                </Typography>
              </View>

              {/* Purchased */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  padding: theme.spacing.xs,
                  borderRadius: theme.borders.radius.lg,
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: colors.secondaryBg,
                    padding: theme.spacing.xs / 2,
                    borderRadius: theme.borders.radius.full,
                    marginBottom: theme.spacing.xs / 2,
                  }}>
                  <Typography variant='caption' style={{ color: colors.secondary, fontSize: 16 }}>
                    ✅
                  </Typography>
                </View>
                <Typography
                  variant='caption'
                  style={{ color: colors.light, fontSize: 10, marginBottom: 2 }}>
                  Purchased
                </Typography>
                <Typography
                  variant='caption'
                  style={{ color: colors.dark, fontWeight: 'bold', fontSize: 14 }}>
                  {completedItems.length}
                </Typography>
              </View>

              {/* Completion % */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  padding: theme.spacing.xs,
                  borderRadius: theme.borders.radius.lg,
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: colors.purpleBg,
                    padding: theme.spacing.xs / 2,
                    borderRadius: theme.borders.radius.full,
                    marginBottom: theme.spacing.xs / 2,
                  }}>
                  <Typography variant='caption' style={{ color: colors.purple, fontSize: 16 }}>
                    📈
                  </Typography>
                </View>
                <Typography
                  variant='caption'
                  style={{ color: colors.light, fontSize: 10, marginBottom: 2 }}>
                  Completion
                </Typography>
                <Typography
                  variant='caption'
                  style={{ color: colors.dark, fontWeight: 'bold', fontSize: 14 }}>
                  {completionPercentage}%
                </Typography>
              </View>

              {/* Team Size */}
              <View
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
                  padding: theme.spacing.xs,
                  borderRadius: theme.borders.radius.lg,
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    backgroundColor: colors.accentBg,
                    padding: theme.spacing.xs / 2,
                    borderRadius: theme.borders.radius.full,
                    marginBottom: theme.spacing.xs / 2,
                  }}>
                  <Typography variant='caption' style={{ color: colors.accent, fontSize: 16 }}>
                    👥
                  </Typography>
                </View>
                <Typography
                  variant='caption'
                  style={{ color: colors.light, fontSize: 10, marginBottom: 2 }}>
                  Team Size
                </Typography>
                <Typography
                  variant='caption'
                  style={{ color: colors.dark, fontWeight: 'bold', fontSize: 14 }}>
                  {teamSize}
                </Typography>
              </View>
            </View>
          </View>

          {/* Modern Items List */}
          <View style={{ marginBottom: theme.spacing.sm }}>
            <Typography
              variant='body1'
              style={{
                color: colors.dark,
                fontWeight: '600',
                fontSize: 14,
                marginBottom: theme.spacing.xs,
              }}>
              🛒 Items ({totalItems})
            </Typography>

            <View style={{ gap: theme.spacing.xs / 2 }}>
              {list.items && list.items.length > 0 ? (
                list.items.map((item, index) => (
                  <View
                    key={item.id || index}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: theme.spacing.sm,
                      backgroundColor: colors.background,
                      borderRadius: theme.borders.radius.lg,
                    }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      {/* Status Circle */}
                      <Typography
                        variant='caption'
                        style={{
                          color: item.completed ? colors.secondary : colors.light,
                          fontSize: 18,
                          marginRight: theme.spacing.sm,
                        }}>
                        {item.completed ? '✅' : '⭕'}
                      </Typography>

                      {/* Item Details */}
                      <View style={{ flex: 1 }}>
                        <Typography
                          variant='caption'
                          style={{
                            color: colors.dark,
                            fontWeight: '500',
                            fontSize: 14,
                            marginBottom: 2,
                          }}
                          numberOfLines={1}>
                          {item.name}{' '}
                          <Typography
                            variant='caption'
                            style={{
                              color: colors.lighter,
                              fontWeight: '400',
                            }}>
                            (Qty: {item.quantity || 1})
                          </Typography>
                        </Typography>
                        {item.assignedTo && (
                          <Typography
                            variant='caption'
                            style={{ color: colors.light, fontSize: 12 }}
                            numberOfLines={1}>
                            {getCollaboratorName(item.assignedTo)}
                          </Typography>
                        )}
                      </View>
                    </View>

                    {/* Price */}
                    <Typography
                      variant='caption'
                      style={{
                        color:
                          item.completed && item.purchasedAmount ? colors.dark : colors.lighter,
                        fontWeight: '600',
                        fontSize: 14,
                      }}>
                      {item.completed && item.purchasedAmount
                        ? formatCurrency(item.purchasedAmount, currency as any)
                        : 'No price'}
                    </Typography>
                  </View>
                ))
              ) : (
                <Typography
                  variant='caption'
                  style={{
                    color: colors.lighter,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    fontSize: 14,
                    marginVertical: theme.spacing.md,
                  }}>
                  No items in this list.
                </Typography>
              )}
            </View>
          </View>

          {/* Modern Spending Breakdown */}
          {Object.keys(spendingSummary).length > 0 && (
            <View style={{ marginBottom: theme.spacing.sm }}>
              <Typography
                variant='body1'
                style={{
                  color: colors.dark,
                  fontWeight: '600',
                  fontSize: 14,
                  marginBottom: theme.spacing.xs,
                }}>
                📊 Spending Breakdown
              </Typography>

              <View
                style={{
                  backgroundColor: colors.background,
                  padding: theme.spacing.sm,
                  borderRadius: theme.borders.radius.lg,
                  gap: theme.spacing.xs,
                }}>
                {Object.entries(spendingSummary).map(([userId, summary]) => (
                  <View
                    key={userId}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <View>
                      <Typography
                        variant='caption'
                        style={{
                          color: colors.dark,
                          fontWeight: '500',
                          fontSize: 14,
                        }}
                        numberOfLines={1}>
                        {getCollaboratorName(userId) || 'User'}
                      </Typography>
                      <Typography variant='caption' style={{ color: colors.light, fontSize: 12 }}>
                        {summary.items} item{summary.items !== 1 ? 's' : ''}
                      </Typography>
                    </View>
                    <Typography
                      variant='caption'
                      style={{
                        color: colors.dark,
                        fontWeight: 'bold',
                        fontSize: 14,
                      }}>
                      {formatCurrency(summary.amount, currency as any)}
                    </Typography>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Modern Total Section with Gradient-like Effect */}
        <View
          style={{
            backgroundColor: colors.primary,
            borderBottomLeftRadius: theme.borders.radius.xl,
            borderBottomRightRadius: theme.borders.radius.xl,
            padding: theme.spacing.sm,
            ...theme.shadows.md,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View>
              <Typography
                variant='caption'
                style={{
                  color: colors.white,
                  fontSize: 12,
                  opacity: 0.8,
                }}>
                TOTAL SPENT
              </Typography>
              <Typography
                variant='caption'
                style={{
                  color: colors.white,
                  fontSize: 12,
                  opacity: 0.8,
                }}>
                {completedItems.length} purchased item{completedItems.length !== 1 ? 's' : ''}
              </Typography>
            </View>
            <Typography
              variant='h2'
              style={{
                color: colors.white,
                fontWeight: 'bold',
                fontSize: 24,
              }}>
              {formatCurrency(totalSpent, currency as any)}
            </Typography>
          </View>
        </View>
      </View>

      {/* Modern Footer */}
      <View style={{ alignItems: 'center', marginTop: theme.spacing.md }}>
        <Typography
          variant='caption'
          style={{
            color: colors.lighter,
            textAlign: 'center',
            fontSize: 11,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          ✨ Generated by PantryPal
        </Typography>
        <Typography
          variant='caption'
          style={{
            color: colors.lighter,
            textAlign: 'center',
            marginTop: theme.spacing.xs / 2,
            fontSize: 11,
          }}>
          Making grocery shopping smarter, together.
        </Typography>
      </View>
    </View>
  );
};
