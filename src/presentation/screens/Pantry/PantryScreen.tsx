// ========================================
// Pantry Screen - Inventory Management
// ========================================

import React, { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';

// Styles
import { baseStyles, createDynamicStyles, createThemedStyles } from './PantryScreen.styles';

// Types
export type PantryScreenProps = Record<string, never>;

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

  // Create themed styles
  const themedStyles = createThemedStyles(theme);
  const dynamicStyles = createDynamicStyles(theme);

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
      <View style={themedStyles.itemCard}>
        {/* Header */}
        <View style={baseStyles.itemHeader}>
          <View style={baseStyles.itemInfo}>
            <Typography variant='h6' color={theme.colors.text.primary}>
              {item.name}
            </Typography>

            <Typography variant='caption' color={theme.colors.text.tertiary}>
              {item.category} • {item.location}
            </Typography>
          </View>

          <View style={[baseStyles.statusBadge, dynamicStyles.createStatusBadgeStyle(statusColor)]}>
            <Typography variant='caption' color={statusColor}>
              {statusText}
            </Typography>
          </View>
        </View>

        {/* Quantity */}
        <View style={baseStyles.quantityContainer}>
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
          <View style={baseStyles.expirationContainer}>
            <Typography variant='body2' color={theme.colors.text.secondary}>
              Expires: {formatDate(item.expirationDate)}
            </Typography>
          </View>
        )}

        {/* Actions */}
        <View style={baseStyles.itemActions}>
          <Button
            title='Edit'
            variant='outline'
            size='sm'
            onPress={() => console.log('Edit item', item.id)}
            style={baseStyles.actionButton}
          />

          <Button
            title='Use'
            variant='primary'
            size='sm'
            onPress={() => console.log('Use item', item.id)}
            style={baseStyles.actionButton}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[baseStyles.container, themedStyles.themedContainer]}>
      {/* Header */}
      <View style={baseStyles.header}>
        <Typography variant='h3' color={theme.colors.text.primary}>
          Pantry
        </Typography>

        <View style={baseStyles.headerActions}>
          <Button
            title='📷'
            variant='outline'
            size='sm'
            onPress={() => console.log('Scan barcode')}
            style={dynamicStyles.headerButtonWithMargin}
          />

          <Button title='➕' variant='primary' size='sm' onPress={() => console.log('Add item')} />
        </View>
      </View>

      {/* Stats */}
      <View style={baseStyles.statsContainer}>
        <View style={themedStyles.statCard}>
          <Typography variant='h5' color={theme.colors.primary[500]}>
            {totalItems}
          </Typography>
          <Typography variant='caption' color={theme.colors.text.secondary}>
            Total Items
          </Typography>
        </View>

        <View style={themedStyles.statCard}>
          <Typography variant='h5' color={theme.colors.semantic.warning[500]}>
            {expiringSoon}
          </Typography>
          <Typography variant='caption' color={theme.colors.text.secondary}>
            Expiring Soon
          </Typography>
        </View>

        <View style={themedStyles.statCard}>
          <Typography variant='h5' color={theme.colors.secondary[500]}>
            {lowStockItems}
          </Typography>
          <Typography variant='caption' color={theme.colors.text.secondary}>
            Low Stock
          </Typography>
        </View>

        <View style={themedStyles.statCard}>
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
        style={baseStyles.categoryFilter}
        contentContainerStyle={baseStyles.categoryContent}>
        {categories.map(category => (
          <Button
            key={category}
            title={category}
            variant={selectedCategory === category ? 'primary' : 'outline'}
            size='sm'
            onPress={() => setSelectedCategory(category)}
            style={baseStyles.categoryButton}
          />
        ))}
      </ScrollView>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        renderItem={renderPantryItem}
        keyExtractor={item => item.id}
        style={baseStyles.itemsList}
        contentContainerStyle={baseStyles.itemsContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
        ListEmptyComponent={
          <View style={baseStyles.emptyContainer}>
            <Typography variant='h5' color={theme.colors.text.secondary} align='center'>
              🥫
            </Typography>
            <Typography
              variant='h6'
              color={theme.colors.text.secondary}
              align='center'
              style={dynamicStyles.emptyStateTextWithTopMargin}>
              No items in pantry
            </Typography>
            <Typography
              variant='body2'
              color={theme.colors.text.tertiary}
              align='center'
              style={dynamicStyles.emptyStateSmallTextWithMargin}>
              Add items to track your inventory
            </Typography>
            <Button
              title='Add First Item'
              variant='primary'
              size='md'
              onPress={() => console.log('Add first item')}
              style={dynamicStyles.emptyStateButtonWithMargin}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
};
