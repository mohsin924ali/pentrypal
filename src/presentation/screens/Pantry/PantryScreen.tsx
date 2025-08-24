// ========================================
// Pantry Screen - Inventory Management
// ========================================

import React, { useState } from 'react';
import { View, ScrollView, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';

// Types
export interface PantryScreenProps {}

interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate?: string;
  location: string;
  lowStockThreshold: number;
  barcode?: string;
  image?: string;
}

/**
 * Pantry Screen Component
 *
 * Inventory management with:
 * - Pantry item overview
 * - Expiration tracking
 * - Low stock alerts
 * - Category organization
 * - Search and filter
 * - Barcode scanning
 */
export const PantryScreen: React.FC<PantryScreenProps> = () => {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Mock data for demo
  const mockItems: PantryItem[] = [
    {
      id: '1',
      name: 'Whole Milk',
      category: 'Dairy',
      quantity: 2,
      unit: 'bottles',
      expirationDate: '2024-01-15',
      location: 'Refrigerator',
      lowStockThreshold: 1,
    },
    {
      id: '2',
      name: 'Bread',
      category: 'Bakery',
      quantity: 0.5,
      unit: 'loaf',
      expirationDate: '2024-01-12',
      location: 'Pantry',
      lowStockThreshold: 1,
    },
    {
      id: '3',
      name: 'Canned Tomatoes',
      category: 'Canned Goods',
      quantity: 6,
      unit: 'cans',
      expirationDate: '2025-06-01',
      location: 'Pantry',
      lowStockThreshold: 2,
    },
    {
      id: '4',
      name: 'Chicken Breast',
      category: 'Meat',
      quantity: 1.2,
      unit: 'kg',
      expirationDate: '2024-01-10',
      location: 'Freezer',
      lowStockThreshold: 0.5,
    },
  ];

  const categories = [
    'All',
    'Dairy',
    'Meat',
    'Vegetables',
    'Fruits',
    'Bakery',
    'Canned Goods',
    'Frozen',
  ];

  // Handle pull to refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Check if item is expiring soon (within 3 days)
  const isExpiringSoon = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const today = new Date();
    const expDate = new Date(expirationDate);
    const timeDiff = expDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 3 && daysDiff >= 0;
  };

  // Check if item is expired
  const isExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const today = new Date();
    const expDate = new Date(expirationDate);
    return expDate < today;
  };

  // Check if item is low stock
  const isLowStock = (item: PantryItem) => {
    return item.quantity <= item.lowStockThreshold;
  };

  // Get status color
  const getStatusColor = (item: PantryItem) => {
    if (isExpired(item.expirationDate)) return theme.colors.semantic.error[500];
    if (isExpiringSoon(item.expirationDate)) return theme.colors.semantic.warning[500];
    if (isLowStock(item)) return theme.colors.secondary[500];
    return theme.colors.semantic.success[500];
  };

  // Get status text
  const getStatusText = (item: PantryItem) => {
    if (isExpired(item.expirationDate)) return 'Expired';
    if (isExpiringSoon(item.expirationDate)) return 'Expiring Soon';
    if (isLowStock(item)) return 'Low Stock';
    return 'Good';
  };

  // Format expiration date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No expiration';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Filter items by category
  const filteredItems =
    selectedCategory === 'All'
      ? mockItems
      : mockItems.filter(item => item.category === selectedCategory);

  // Calculate stats
  const totalItems = mockItems.length;
  const expiringSoon = mockItems.filter(item => isExpiringSoon(item.expirationDate)).length;
  const lowStockItems = mockItems.filter(isLowStock).length;
  const expiredItems = mockItems.filter(item => isExpired(item.expirationDate)).length;

  // Render pantry item
  const renderPantryItem = ({ item }: { item: PantryItem }) => {
    const statusColor = getStatusColor(item);
    const statusText = getStatusText(item);

    return (
      <View
        style={[
          styles.itemCard,
          {
            backgroundColor: theme.colors.surface.card,
            borderColor: theme.colors.border.primary,
          },
        ]}>
        {/* Header */}
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Typography variant='h6' color={theme.colors.text.primary}>
              {item.name}
            </Typography>

            <Typography variant='caption' color={theme.colors.text.tertiary}>
              {item.category} • {item.location}
            </Typography>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Typography variant='caption' color={statusColor}>
              {statusText}
            </Typography>
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.quantityContainer}>
          <Typography variant='h5' color={theme.colors.text.primary}>
            {item.quantity} {item.unit}
          </Typography>

          {isLowStock(item) && (
            <Typography variant='caption' color={theme.colors.semantic.warning[600]}>
              Below threshold ({item.lowStockThreshold} {item.unit})
            </Typography>
          )}
        </View>

        {/* Expiration */}
        {item.expirationDate && (
          <View style={styles.expirationContainer}>
            <Typography variant='body2' color={theme.colors.text.secondary}>
              Expires: {formatDate(item.expirationDate)}
            </Typography>
          </View>
        )}

        {/* Actions */}
        <View style={styles.itemActions}>
          <Button
            title='Edit'
            variant='outline'
            size='sm'
            onPress={() => console.log('Edit item', item.id)}
            style={styles.actionButton}
          />

          <Button
            title='Use'
            variant='primary'
            size='sm'
            onPress={() => console.log('Use item', item.id)}
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant='h3' color={theme.colors.text.primary}>
          Pantry
        </Typography>

        <View style={styles.headerActions}>
          <Button
            title='📷'
            variant='outline'
            size='sm'
            onPress={() => console.log('Scan barcode')}
            style={{ marginRight: 8 }}
          />

          <Button title='➕' variant='primary' size='sm' onPress={() => console.log('Add item')} />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface.card }]}>
          <Typography variant='h5' color={theme.colors.primary[500]}>
            {totalItems}
          </Typography>
          <Typography variant='caption' color={theme.colors.text.secondary}>
            Total Items
          </Typography>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.surface.card }]}>
          <Typography variant='h5' color={theme.colors.semantic.warning[500]}>
            {expiringSoon}
          </Typography>
          <Typography variant='caption' color={theme.colors.text.secondary}>
            Expiring Soon
          </Typography>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.surface.card }]}>
          <Typography variant='h5' color={theme.colors.secondary[500]}>
            {lowStockItems}
          </Typography>
          <Typography variant='caption' color={theme.colors.text.secondary}>
            Low Stock
          </Typography>
        </View>

        <View style={[styles.statCard, { backgroundColor: theme.colors.surface.card }]}>
          <Typography variant='h5' color={theme.colors.semantic.error[500]}>
            {expiredItems}
          </Typography>
          <Typography variant='caption' color={theme.colors.text.secondary}>
            Expired
          </Typography>
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryContent}>
        {categories.map(category => (
          <Button
            key={category}
            title={category}
            variant={selectedCategory === category ? 'primary' : 'outline'}
            size='sm'
            onPress={() => setSelectedCategory(category)}
            style={styles.categoryButton}
          />
        ))}
      </ScrollView>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderPantryItem}
        keyExtractor={item => item.id}
        style={styles.itemsList}
        contentContainerStyle={styles.itemsContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Typography variant='h5' color={theme.colors.text.secondary} align='center'>
              🥫
            </Typography>
            <Typography
              variant='h6'
              color={theme.colors.text.secondary}
              align='center'
              style={{ marginTop: theme.spacing.md }}>
              No items in pantry
            </Typography>
            <Typography
              variant='body2'
              color={theme.colors.text.tertiary}
              align='center'
              style={{ marginTop: theme.spacing.sm }}>
              Add items to track your inventory
            </Typography>
            <Button
              title='Add First Item'
              variant='primary'
              size='md'
              onPress={() => console.log('Add first item')}
              style={{ marginTop: theme.spacing.lg }}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
};

// ========================================
// Styles
// ========================================

const styles = {
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerActions: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  statCard: {
    flex: 0.23,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryFilter: {
    marginBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryButton: {
    marginRight: 8,
  },
  itemsList: {
    flex: 1,
  },
  itemsContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  itemCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  quantityContainer: {
    marginBottom: 8,
  },
  expirationContainer: {
    marginBottom: 12,
  },
  itemActions: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  actionButton: {
    flex: 0.48,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 64,
  },
};
