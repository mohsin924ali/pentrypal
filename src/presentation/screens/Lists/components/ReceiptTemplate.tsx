// ========================================
// Professional Receipt Template Component
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const receiptTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const currency = list.budget?.currency || 'USD';
  const receiptId = `PP-${list.id?.slice(0, 8)?.toUpperCase() || 'UNKNOWN'}`;
  const completedItems = list.items?.filter(item => item.completed) || [];
  const totalItems = list.items?.length || 0;

  // Professional color scheme
  const colors = {
    primary: '#2563EB', // Professional blue
    primaryLight: '#3B82F6', // Light blue
    secondary: '#059669', // Professional green
    accent: '#DC2626', // Professional red
    dark: '#1E293B', // Dark slate
    medium: '#475569', // Medium slate
    light: '#64748B', // Light slate
    lighter: '#94A3B8', // Lighter slate
    background: '#F8FAFC', // Very light background
    white: '#FFFFFF',
    border: '#E2E8F0', // Professional border
  };

  return (
    <View
      style={{
        backgroundColor: colors.white,
        width: 400,
        minHeight: 900,
        padding: 0,
        shadowColor: colors.dark,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}>
      {/* Professional Header with Gradient Background */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingTop: 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}>
        <View style={{ alignItems: 'center' }}>
          <Typography
            variant='h1'
            style={{
              color: colors.white,
              fontWeight: 'bold',
              fontSize: 28,
              marginBottom: 4,
            }}>
            🛒 PentryPal
          </Typography>
          <Typography
            variant='body1'
            style={{
              color: colors.white,
              opacity: 0.9,
              marginBottom: 12,
              fontWeight: '500',
            }}>
            Smart Shopping Receipt
          </Typography>
          <View
            style={{
              backgroundColor: colors.white,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}>
            <Typography
              variant='caption'
              style={{
                color: colors.primary,
                fontWeight: '600',
                fontSize: 11,
              }}>
              Receipt ID: {receiptId}
            </Typography>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={{ padding: 16 }}>
        {/* Professional Receipt Info Card - COMPACT GRID */}
        <View
          style={{
            backgroundColor: colors.background,
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
          <Typography
            variant='caption'
            style={{
              color: colors.dark,
              fontWeight: '700',
              marginBottom: 6,
              textAlign: 'center',
              fontSize: 13,
            }}>
            📋 RECEIPT DETAILS
          </Typography>

          {/* 2x2 Compact Grid */}
          <View style={{ flexDirection: 'row', marginBottom: 4 }}>
            <View style={{ flex: 1, marginRight: 3 }}>
              <Typography variant='caption' style={{ color: colors.medium, fontSize: 9 }}>
                📅 Date
              </Typography>
              <Typography
                variant='caption'
                style={{ color: colors.dark, fontWeight: '600', fontSize: 10 }}
                numberOfLines={1}>
                {now.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: '2-digit',
                })}
              </Typography>
            </View>
            <View style={{ flex: 1, marginLeft: 3 }}>
              <Typography variant='caption' style={{ color: colors.medium, fontSize: 9 }}>
                🕒 Time
              </Typography>
              <Typography
                variant='caption'
                style={{ color: colors.dark, fontWeight: '600', fontSize: 10 }}>
                {receiptTime}
              </Typography>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1.2, marginRight: 3 }}>
              <Typography variant='caption' style={{ color: colors.medium, fontSize: 9 }}>
                🛍️ List
              </Typography>
              <Typography
                variant='caption'
                style={{ color: colors.primary, fontWeight: '600', fontSize: 10 }}
                numberOfLines={1}>
                {list.name}
              </Typography>
            </View>
            <View style={{ flex: 0.8, marginLeft: 3, alignItems: 'flex-end' }}>
              <Typography variant='caption' style={{ color: colors.medium, fontSize: 9 }}>
                📱 Status
              </Typography>
              <View
                style={{
                  backgroundColor: list.status === 'archived' ? colors.secondary : colors.accent,
                  paddingHorizontal: 4,
                  paddingVertical: 1,
                  borderRadius: 3,
                }}>
                <Typography
                  variant='caption'
                  style={{
                    color: colors.white,
                    fontWeight: '600',
                    fontSize: 8,
                  }}>
                  {list.status?.toUpperCase() || 'ACTIVE'}
                </Typography>
              </View>
            </View>
          </View>
        </View>

        {/* Professional Shopping Summary - COMPACT GRID */}
        <View
          style={{
            backgroundColor: colors.white,
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
          <Typography
            variant='caption'
            style={{
              color: colors.dark,
              fontWeight: '700',
              marginBottom: 6,
              textAlign: 'center',
              fontSize: 13,
            }}>
            📊 SHOPPING SUMMARY
          </Typography>

          {/* 2x2 Grid Layout */}
          <View style={{ flexDirection: 'row', marginBottom: 3 }}>
            <View
              style={{
                flex: 1,
                marginRight: 3,
                alignItems: 'center',
                backgroundColor: colors.background,
                borderRadius: 4,
                padding: 4,
              }}>
              <Typography variant='caption' style={{ color: colors.medium, fontSize: 8 }}>
                📦 Total Items
              </Typography>
              <Typography
                variant='caption'
                style={{ color: colors.dark, fontWeight: '700', fontSize: 14 }}>
                {totalItems}
              </Typography>
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 3,
                alignItems: 'center',
                backgroundColor: colors.background,
                borderRadius: 4,
                padding: 4,
              }}>
              <Typography variant='caption' style={{ color: colors.medium, fontSize: 8 }}>
                ✅ Purchased
              </Typography>
              <Typography
                variant='caption'
                style={{ color: colors.secondary, fontWeight: '700', fontSize: 14 }}>
                {completedItems.length}
              </Typography>
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View
              style={{
                flex: 1,
                marginRight: 3,
                alignItems: 'center',
                backgroundColor: colors.background,
                borderRadius: 4,
                padding: 4,
              }}>
              <Typography variant='caption' style={{ color: colors.medium, fontSize: 8 }}>
                📈 Completion
              </Typography>
              <Typography
                variant='caption'
                style={{ color: colors.primary, fontWeight: '700', fontSize: 14 }}>
                {totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 0}%
              </Typography>
            </View>
            <View
              style={{
                flex: 1,
                marginLeft: 3,
                alignItems: 'center',
                backgroundColor: colors.background,
                borderRadius: 4,
                padding: 4,
              }}>
              <Typography variant='caption' style={{ color: colors.medium, fontSize: 8 }}>
                👥 Team Size
              </Typography>
              <Typography
                variant='caption'
                style={{ color: colors.dark, fontWeight: '700', fontSize: 14 }}>
                {list.collaborators?.length || 1}
              </Typography>
            </View>
          </View>

          {list.budget?.amount && (
            <View
              style={{
                marginTop: 4,
                alignItems: 'center',
                backgroundColor: colors.accent,
                borderRadius: 4,
                padding: 3,
              }}>
              <Typography variant='caption' style={{ color: colors.white, fontSize: 8 }}>
                💰 BUDGET
              </Typography>
              <Typography
                variant='caption'
                style={{ color: colors.white, fontWeight: '700', fontSize: 10 }}>
                {formatCurrency(list.budget.amount, currency as any)}
              </Typography>
            </View>
          )}
        </View>

        {/* Professional Items List - COMPACT GRID */}
        <View
          style={{
            backgroundColor: colors.white,
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
          <Typography
            variant='caption'
            style={{
              color: colors.dark,
              fontWeight: '700',
              marginBottom: 6,
              textAlign: 'center',
              fontSize: 13,
            }}>
            🛒 Items ({list.items?.length || 0})
          </Typography>

          {list.items && list.items.length > 0 ? (
            list.items.map((item, index) => (
              <View
                key={item.id || index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                  backgroundColor: index % 2 === 0 ? colors.background : colors.white,
                  borderRadius: 4,
                  marginBottom: 2,
                  borderWidth: 1,
                  borderColor: item.completed ? colors.secondary : colors.border,
                }}>
                {/* Compact Checkbox */}
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    borderWidth: 1,
                    borderColor: item.completed ? colors.secondary : colors.border,
                    backgroundColor: item.completed ? colors.secondary : 'transparent',
                    marginRight: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {item.completed && (
                    <Typography
                      variant='caption'
                      style={{
                        color: colors.white,
                        fontSize: 8,
                        fontWeight: 'bold',
                      }}>
                      ✓
                    </Typography>
                  )}
                </View>

                {/* Compact Item Info */}
                <View style={{ flex: 1 }}>
                  <Typography
                    variant='caption'
                    style={{
                      color: colors.dark,
                      fontWeight: '600',
                      fontSize: 11,
                      textDecorationLine: item.completed ? 'line-through' : 'none',
                      opacity: item.completed ? 0.8 : 1,
                    }}
                    numberOfLines={1}>
                    {item.name} (Qty: {item.quantity || 1})
                  </Typography>
                  {item.assignedTo && (
                    <Typography
                      variant='caption'
                      style={{ color: colors.medium, fontSize: 8 }}
                      numberOfLines={1}>
                      👤 {getCollaboratorName(item.assignedTo)}
                    </Typography>
                  )}
                </View>

                {/* Compact Purchase Info */}
                <View style={{ alignItems: 'flex-end', minWidth: 50 }}>
                  {item.completed ? (
                    <Typography
                      variant='caption'
                      style={{
                        color: colors.secondary,
                        fontWeight: '700',
                        fontSize: 9,
                      }}>
                      {item.purchasedAmount
                        ? formatCurrency(item.purchasedAmount, currency as any)
                        : 'No price'}
                    </Typography>
                  ) : (
                    <Typography
                      variant='caption'
                      style={{
                        color: colors.lighter,
                        fontSize: 8,
                      }}>
                      Pending
                    </Typography>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Typography
              variant='caption'
              style={{
                color: colors.lighter,
                fontStyle: 'italic',
                textAlign: 'center',
                fontSize: 11,
              }}>
              No items in this list.
            </Typography>
          )}
        </View>

        {/* Professional Spending Summary - COMPACT GRID */}
        {Object.keys(spendingSummary).length > 0 && (
          <View
            style={{
              backgroundColor: colors.white,
              padding: 8,
              borderRadius: 6,
              marginBottom: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}>
            <Typography
              variant='caption'
              style={{
                color: colors.dark,
                fontWeight: '700',
                marginBottom: 6,
                textAlign: 'center',
                fontSize: 13,
              }}>
              💰 SPENDING BREAKDOWN
            </Typography>

            {/* Compact Grid Layout for People */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 }}>
              {Object.entries(spendingSummary).map(([userId, summary], index) => (
                <View
                  key={userId}
                  style={{
                    width: '50%',
                    paddingHorizontal: 2,
                    marginBottom: 3,
                  }}>
                  <View
                    style={{
                      backgroundColor: colors.background,
                      padding: 4,
                      borderRadius: 4,
                      alignItems: 'center',
                    }}>
                    <Typography
                      variant='caption'
                      style={{ color: colors.dark, fontWeight: '600', fontSize: 9 }}
                      numberOfLines={1}>
                      👤 {getCollaboratorName(userId) || 'User'}
                    </Typography>
                    <Typography
                      variant='caption'
                      style={{ color: colors.secondary, fontWeight: '700', fontSize: 10 }}>
                      {formatCurrency(summary.amount, currency as any)}
                    </Typography>
                    <Typography variant='caption' style={{ color: colors.medium, fontSize: 8 }}>
                      {summary.items} item{summary.items !== 1 ? 's' : ''}
                    </Typography>
                  </View>
                </View>
              ))}
            </View>

            {/* Total Row */}
            <View
              style={{
                backgroundColor: colors.primary,
                padding: 6,
                borderRadius: 4,
                alignItems: 'center',
                marginTop: 2,
              }}>
              <Typography
                variant='caption'
                style={{ color: colors.white, fontSize: 10, fontWeight: '700' }}>
                💸 TOTAL SPENT
              </Typography>
              <Typography
                variant='caption'
                style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>
                {formatCurrency(totalSpent, currency as any)}
              </Typography>
              <Typography
                variant='caption'
                style={{ color: colors.white, fontSize: 8, opacity: 0.9 }}>
                {Object.values(spendingSummary).reduce((sum, user) => sum + user.items, 0)} total
                purchased items
              </Typography>
            </View>
          </View>
        )}

        {/* Professional Total Section - COMPACT */}
        <View
          style={{
            backgroundColor: colors.primary,
            padding: 8,
            borderRadius: 6,
            marginBottom: 8,
            shadowColor: colors.dark,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
          }}>
          <View style={{ alignItems: 'center' }}>
            <Typography
              variant='caption'
              style={{
                color: colors.white,
                fontWeight: '700',
                fontSize: 11,
                marginBottom: 2,
              }}>
              💰 TOTAL SPENT
            </Typography>
            <Typography
              variant='body1'
              style={{
                color: colors.white,
                fontWeight: 'bold',
                fontSize: 18,
              }}>
              {formatCurrency(totalSpent, currency as any)}
            </Typography>
          </View>

          {list.budget?.amount && (
            <View style={{ marginTop: 4, alignItems: 'center' }}>
              <Typography
                variant='caption'
                style={{
                  color: totalSpent <= list.budget.amount ? colors.white : '#FEF3C7',
                  fontWeight: '600',
                  fontSize: 9,
                  textAlign: 'center',
                }}>
                {totalSpent <= list.budget.amount
                  ? `✅ Under Budget (${formatCurrency(list.budget.amount - totalSpent, currency as any)} left)`
                  : `⚠️ Over Budget (${formatCurrency(totalSpent - list.budget.amount, currency as any)} over)`}
              </Typography>
            </View>
          )}
        </View>

        {/* Professional Footer - COMPACT */}
        <View style={{ alignItems: 'center', marginTop: 6 }}>
          <Typography
            variant='caption'
            style={{
              color: colors.light,
              textAlign: 'center',
              fontStyle: 'italic',
              fontSize: 8,
              marginBottom: 4,
            }}>
            ⚡ Generated by PentryPal - Smart Shopping Assistant
          </Typography>
          <Typography
            variant='caption'
            style={{
              color: colors.lighter,
              textAlign: 'center',
              fontSize: 11,
            }}>
            📱 Making grocery shopping smarter, together
          </Typography>
          <Typography
            variant='caption'
            style={{
              color: colors.lighter,
              textAlign: 'center',
              marginTop: 6,
              fontSize: 11,
            }}>
            Generated on {now.toISOString()}
          </Typography>
        </View>
      </View>
    </View>
  );
};
