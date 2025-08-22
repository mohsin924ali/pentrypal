/**
 * Create New List Screen
 * Create shopping lists with categorized items and search functionality
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  ViewStyle,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';
import { Button } from '@/presentation/components/atoms/Button';
import GroceryItemsService from '@/infrastructure/services/groceryItemsService';
import type { GroceryItem, Category } from '@/shared/types';

export interface CreateListScreenProps {
  onBackPress: () => void;
  onCreateList: (listName: string, selectedItems: SelectedItemData[]) => void;
  onUpdateList?: (listName: string, selectedItems: SelectedItemData[]) => void;
  editMode?: boolean;
  existingListName?: string;
  existingItems?: SelectedItemData[];
}

interface SelectedItemData {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  icon: string;
  category: string;
}

export const CreateListScreen: React.FC<CreateListScreenProps> = ({
  onBackPress,
  onCreateList,
  onUpdateList,
  editMode = false,
  existingListName = '',
  existingItems = [],
}) => {
  const [listName, setListName] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItemData>>(new Map());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<GroceryItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState('custom');
  const [customItemQuantity, setCustomItemQuantity] = useState('1');
  const [customItemUnit, setCustomItemUnit] = useState('pieces');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchResults, setSearchResults] = useState<GroceryItem[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateItemData, setDuplicateItemData] = useState<{
    existingItem: SelectedItemData;
    newQuantity: string;
    newUnit: string;
  } | null>(null);

  // Track original values for edit mode
  const [originalListName, setOriginalListName] = useState('');
  const [originalItems, setOriginalItems] = useState<Map<string, SelectedItemData>>(new Map());

  // Load categories and items from service
  useEffect(() => {
    loadCategories();
  }, []);

  // Initialize edit mode data
  useEffect(() => {
    if (editMode && existingListName && existingItems.length > 0) {
      setListName(existingListName);
      setOriginalListName(existingListName);
      
      const itemsMap = new Map();
      existingItems.forEach(item => {
        itemsMap.set(item.id, item);
      });
      setSelectedItems(itemsMap);
      setOriginalItems(new Map(itemsMap));
      setShowCategories(true);
    }
  }, [editMode, existingListName, existingItems]);

  // Search items when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      searchItems();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await GroceryItemsService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchItems = async () => {
    try {
      const results = await GroceryItemsService.searchItems(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching items:', error);
      setSearchResults([]);
    }
  };

  // Check if any changes were made in edit mode
  const hasChanges = useMemo(() => {
    if (!editMode) return true; // Always allow creation
    
    // Check if list name changed
    if (listName.trim() !== originalListName.trim()) {
      return true;
    }
    
    // Check if items changed (added, removed, or modified)
    if (selectedItems.size !== originalItems.size) {
      return true;
    }
    
    // Check if any existing items were modified
    for (const [itemId, currentItem] of selectedItems) {
      const originalItem = originalItems.get(itemId);
      if (!originalItem) {
        return true; // New item added
      }
      
      // Check if quantity or unit changed
      if (currentItem.quantity !== originalItem.quantity || 
          currentItem.unit !== originalItem.unit) {
        return true;
      }
    }
    
    // Check if any original items were removed
    for (const [itemId, originalItem] of originalItems) {
      if (!selectedItems.has(itemId)) {
        return true; // Item removed
      }
    }
    
    return false; // No changes detected
  }, [editMode, listName, selectedItems, originalListName, originalItems]);

  // Performance-optimized grocery items database loaded from service


  const toggleCategory = (categoryId: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  };

  const toggleItem = async (itemId: string) => {
    // Find item in search results, categories, or fetch from service
    let item: GroceryItem | null = null;
    
    // First check search results
    item = searchResults.find(i => i.id === itemId) || null;
    
    // If not in search results, check categories
    if (!item) {
      for (const category of categories) {
        item = category.items.find(i => i.id === itemId) || null;
        if (item) break;
      }
    }
    
    // If still not found, fetch from service
    if (!item) {
      try {
        item = await GroceryItemsService.getItemById(itemId);
      } catch (error) {
        console.error('Error fetching item:', error);
        return;
      }
    }
    
    if (!item) return;

    if (selectedItems.has(itemId)) {
      // Item already selected, show quantity modal to add more
      setCurrentItem(item);
      setQuantity('1');
      setSelectedUnit(item.defaultUnit || 'pieces');
      setShowQuantityModal(true);
    } else {
      // Show quantity modal for new item
      setCurrentItem(item);
      setQuantity('1');
      setSelectedUnit(item.defaultUnit || 'pieces');
      setShowQuantityModal(true);
    }
    
    // Show categories section after user selects first item
    if (!showCategories && (selectedItems.size > 0 || item)) {
      setShowCategories(true);
    }
  };

  const handleAddItemWithQuantity = () => {
    if (currentItem && quantity.trim()) {
      console.log('Adding item:', currentItem.name, 'ID:', currentItem.id);
      console.log('Current selectedItems:', Array.from(selectedItems.keys()));
      
      const existingItem = selectedItems.get(currentItem.id);
      console.log('Existing item found:', existingItem);
      
      if (existingItem) {
        // Item already exists, show custom confirmation modal
        console.log('Showing duplicate modal for:', currentItem.name);
        setDuplicateItemData({
          existingItem,
          newQuantity: quantity.trim(),
          newUnit: selectedUnit,
        });
        setShowDuplicateModal(true);
        setShowQuantityModal(false);
        setCurrentItem(null);
        setQuantity('1');
        setSelectedUnit('');
      } else {
        // New item, add normally
        console.log('Adding new item:', currentItem.name);
        const itemData: SelectedItemData = {
          id: currentItem.id,
          name: currentItem.name,
          quantity: quantity.trim(),
          unit: selectedUnit,
          icon: currentItem.icon,
          category: currentItem.category,
        };

        const newSelected = new Map(selectedItems);
        newSelected.set(currentItem.id, itemData);
        setSelectedItems(newSelected);
        
        setShowQuantityModal(false);
        setCurrentItem(null);
        setQuantity('1');
        setSelectedUnit('');
      }
    }
  };

  const handleDuplicateConfirm = () => {
    if (duplicateItemData) {
      const { existingItem, newQuantity, newUnit } = duplicateItemData;
      const currentQty = parseInt(existingItem.quantity) || 0;
      const newQty = parseInt(newQuantity) || 0;
      const totalQty = currentQty + newQty;
      
      console.log('User confirmed adding more quantity');
      const updatedItemData: SelectedItemData = {
        ...existingItem,
        quantity: totalQty.toString(),
      };
      
      const newSelected = new Map(selectedItems);
      newSelected.set(existingItem.id, updatedItemData);
      setSelectedItems(newSelected);
      
      setShowDuplicateModal(false);
      setDuplicateItemData(null);
    }
  };

  const handleDuplicateCancel = () => {
    console.log('User cancelled duplicate item');
    setShowDuplicateModal(false);
    setDuplicateItemData(null);
  };

  const handleAddCustomItem = () => {
    if (customItemName.trim()) {
      // Check if a custom item with the same name already exists
      const existingCustomItem = Array.from(selectedItems.values()).find(
        item => item.category === 'custom' && item.name.toLowerCase() === customItemName.trim().toLowerCase()
      );
      
      if (existingCustomItem) {
        // Custom item already exists, show confirmation dialog
        const currentQty = parseInt(existingCustomItem.quantity) || 0;
        const newQty = parseInt(customItemQuantity.trim()) || 0;
        const totalQty = currentQty + newQty;
        
        Alert.alert(
          'Custom Item Already Added',
          `${customItemName.trim()} with ${existingCustomItem.quantity} ${existingCustomItem.unit} is already in your list. Do you really want to add ${customItemQuantity.trim()} ${customItemUnit} more?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Add More',
              onPress: () => {
                const updatedItemData: SelectedItemData = {
                  ...existingCustomItem,
                  quantity: totalQty.toString(),
                };
                
                const newSelected = new Map(selectedItems);
                newSelected.set(existingCustomItem.id, updatedItemData);
                setSelectedItems(newSelected);
                
                setShowCustomItemModal(false);
                setCustomItemName('');
                setCustomItemQuantity('1');
                setCustomItemUnit('pieces');
                
                if (!showCategories) {
                  setShowCategories(true);
                }
              },
            },
          ]
        );
      } else {
        // New custom item, add normally
        const customId = `custom_${Date.now()}`;
        const customItem: SelectedItemData = {
          id: customId,
          name: customItemName.trim(),
          quantity: customItemQuantity.trim(),
          unit: customItemUnit,
          icon: '📦',
          category: 'custom',
        };

        const newSelected = new Map(selectedItems);
        newSelected.set(customId, customItem);
        setSelectedItems(newSelected);
        
        setShowCustomItemModal(false);
        setCustomItemName('');
        setCustomItemQuantity('1');
        setCustomItemUnit('pieces');
        
        if (!showCategories) {
          setShowCategories(true);
        }
      }
    }
  };

  const handleCreateFromSearch = (searchTerm: string) => {
    setCustomItemName(searchTerm);
    setCustomItemQuantity('1');
    setCustomItemUnit('pieces');
    setShowCustomItemModal(true);
  };

  // Group search results and selected items by category
  const getVisibleCategories = () => {
    let categoriesToShow = [...categories];
    
    // Add custom category if there are custom items
    const customItems = Array.from(selectedItems.values()).filter(item => item.category === 'custom');
    if (customItems.length > 0) {
      const customCategory: Category = {
        id: 'custom',
        name: 'Custom Items',
        icon: '📦',
        items: customItems.map(item => ({
          id: item.id,
          name: item.name,
          icon: item.icon,
          category: item.category,
          defaultUnit: item.unit,
          commonUnits: ['pieces', 'lbs', 'container', 'kg', 'oz', 'cup', 'tbsp', 'tsp']
        }))
      };
      categoriesToShow = [...categories, customCategory];
    }
    
    if (searchQuery.trim()) {
      // During search, group search results by category
      const searchResultsByCategory = new Map<string, GroceryItem[]>();
      
      searchResults.forEach(item => {
        if (!searchResultsByCategory.has(item.category)) {
          searchResultsByCategory.set(item.category, []);
        }
        searchResultsByCategory.get(item.category)!.push(item);
      });

      // Add custom items that match search
      const customSearchItems = customItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (customSearchItems.length > 0) {
        searchResultsByCategory.set('custom', customSearchItems);
      }

      // Return categories with search results
      return categoriesToShow
        .map(category => ({
          ...category,
          items: searchResultsByCategory.get(category.id) || [],
        }))
        .filter(category => category.items.length > 0);
    } else {
      // When not searching, only show categories that have selected items
      return categoriesToShow
        .map(category => ({
          ...category,
          items: category.id === 'custom'
            ? category.items
            : category.items.filter(item => selectedItems.has(item.id)),
        }))
        .filter(category => category.items.length > 0);
    }
  };

  const visibleCategories = getVisibleCategories();

  const handleCreateList = () => {
    if (listName.trim() && selectedItems.size > 0) {
      if (editMode && onUpdateList) {
        onUpdateList(listName.trim(), Array.from(selectedItems.values()));
      } else {
        onCreateList(listName.trim(), Array.from(selectedItems.values()));
      }
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBackPress}
        style={styles.headerButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Typography variant="h3" color={Theme.colors.text.primary}>
          ←
        </Typography>
      </TouchableOpacity>

      <Typography
        variant="h2"
        color={Theme.colors.text.primary}
        style={styles.headerTitle}
      >
        {editMode ? 'Edit List' : 'Create New List'}
      </Typography>

      <View style={styles.headerButton} />
    </View>
  );

  const renderListNameInput = () => (
    <View style={styles.inputSection}>
      <Typography
        variant="body"
        color={Theme.colors.text.primary}
        style={styles.inputLabel}
      >
        List Name
      </Typography>
      <TextInput
        style={styles.textInput}
        value={listName}
        onChangeText={setListName}
        placeholder="Enter list name (e.g., Weekly Groceries)"
        placeholderTextColor={Theme.colors.text.secondary}
      />
    </View>
  );

  const renderSearchInput = () => (
    <View style={styles.inputSection}>
      <Typography
        variant="body"
        color={Theme.colors.text.primary}
        style={styles.inputLabel}
      >
        Search & Add Items
      </Typography>
      <TextInput
        style={styles.textInput}
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          // Show categories when user starts searching
          if (text.trim() && !showCategories) {
            setShowCategories(true);
          }
        }}
        placeholder="Search for items to add to your list..."
        placeholderTextColor={Theme.colors.text.secondary}
      />
      
      {/* Search Results Dropdown */}
      {searchQuery.trim() && searchResults.length > 0 && (
        <View style={styles.searchDropdown}>
          <ScrollView 
            style={styles.searchDropdownScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.searchResultItem}
                onPress={() => {
                  // Show quantity/unit modal for the selected item
                  setCurrentItem(item);
                  setQuantity('1');
                  setSelectedUnit(item.defaultUnit || 'pieces');
                  setShowQuantityModal(true);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <Typography variant="body" style={styles.searchItemIcon}>
                  {item.icon}
                </Typography>
                <Typography
                  variant="body"
                  color={Theme.colors.text.primary}
                  style={styles.searchItemName}
                >
                  {item.name}
                </Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const renderCategoryHeader = (category: Category) => {
    const isCollapsed = collapsedCategories.has(category.id);
    const categoryItemCount = category.items.filter(item => selectedItems.has(item.id)).length;

    return (
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => toggleCategory(category.id)}
        accessibilityRole="button"
        accessibilityLabel={`${isCollapsed ? 'Expand' : 'Collapse'} ${category.name} category`}
      >
        <View style={styles.categoryLeft}>
          <Typography variant="h3" style={styles.categoryIcon}>
            {category.icon}
          </Typography>
          <View style={styles.categoryInfo}>
            <Typography
              variant="h3"
              color={Theme.colors.text.primary}
              style={styles.categoryName}
            >
              {category.name}
            </Typography>
            <Typography
              variant="caption"
              color={Theme.colors.text.secondary}
            >
              {category.items.length} items
              {categoryItemCount > 0 && ` • ${categoryItemCount} selected`}
            </Typography>
          </View>
        </View>
        <Typography
          variant="h3"
          color={Theme.colors.text.secondary}
          style={styles.chevron}
        >
          {isCollapsed ? '▼' : '▲'}
        </Typography>
      </TouchableOpacity>
    );
  };

  const renderItem = (item: GroceryItem) => {
    const isSelected = selectedItems.has(item.id);
    const selectedItemData = selectedItems.get(item.id);

    const handleQuantityChange = (increment: boolean) => {
      if (!selectedItemData) return;
      
      const currentQty = parseInt(selectedItemData.quantity) || 1;
      const newQty = increment ? currentQty + 1 : Math.max(1, currentQty - 1);
      
      const updatedItemData: SelectedItemData = {
        ...selectedItemData,
        quantity: newQty.toString()
      };
      
      setSelectedItems(new Map(selectedItems.set(item.id, updatedItemData)));
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.itemRow}
        onPress={() => toggleItem(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${isSelected ? 'Remove' : 'Add'} ${item.name}`}
      >
        <View style={styles.itemLeft}>
          <Typography variant="body" style={styles.itemIcon}>
            {item.icon}
          </Typography>
          <View style={styles.itemInfo}>
            <Typography
              variant="body"
              color={Theme.colors.text.primary}
              style={styles.itemName}
            >
              {item.name}
            </Typography>
            {isSelected && selectedItemData && (
              <View style={styles.quantityControls}>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    style={[styles.quantityButton, { borderRightWidth: 1, borderRightColor: '#E5E7EB' }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Decrease quantity for ${item.name}`}
                  >
                    <Typography variant="body" style={styles.quantityButtonText}>
                      -
                    </Typography>
                  </TouchableOpacity>
                  <View style={styles.quantityDisplay}>
                    <Typography
                      variant="caption"
                      color={Theme.colors.text.primary}
                      style={styles.quantityText}
                    >
                      {selectedItemData.quantity}
                    </Typography>
                  </View>
                  <TouchableOpacity
                    style={[styles.quantityButton, { borderRightWidth: 0 }]}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleQuantityChange(true);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Increase quantity for ${item.name}`}
                  >
                    <Typography variant="body" style={styles.quantityButtonText}>
                      +
                    </Typography>
                  </TouchableOpacity>
                </View>
                <Typography
                  variant="caption"
                  color={Theme.colors.text.secondary}
                  style={styles.unitText}
                >
                  {selectedItemData.unit}
                </Typography>
              </View>
            )}
          </View>
        </View>
        {isSelected && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={(e) => {
              e.stopPropagation();
              const newSelected = new Map(selectedItems);
              newSelected.delete(item.id);
              setSelectedItems(newSelected);
            }}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.name} from list`}
          >
            <Typography
              variant="body"
              color={Theme.colors.background.primary}
              style={styles.removeButtonText}
            >
              ✕
            </Typography>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderCategory = (category: Category) => {
    const isCollapsed = collapsedCategories.has(category.id);

    return (
      <View key={category.id} style={styles.categoryContainer}>
        {renderCategoryHeader(category)}
        {!isCollapsed && (
          <View style={styles.itemsContainer}>
            {category.items.map(renderItem)}
          </View>
        )}
      </View>
    );
  };

  const renderQuantityModal = () => (
    showQuantityModal && currentItem && (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Typography
            variant="h3"
            color={Theme.colors.text.primary}
            style={styles.modalTitle}
          >
            Add {currentItem.name}
          </Typography>

          <View style={styles.quantitySection}>
            <Typography
              variant="body"
              color={Theme.colors.text.primary}
              style={styles.modalLabel}
            >
              Quantity
            </Typography>
            <TextInput
              style={styles.quantityInput}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="1"
              keyboardType="numeric"
              selectTextOnFocus
            />
          </View>

          <View style={styles.unitSection}>
            <Typography
              variant="body"
              color={Theme.colors.text.primary}
              style={styles.modalLabel}
            >
              Unit
            </Typography>
            <View style={styles.unitsContainer}>
              {currentItem.commonUnits.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitButton,
                    selectedUnit === unit && styles.unitButtonSelected
                  ]}
                  onPress={() => setSelectedUnit(unit)}
                >
                  <Typography
                    variant="caption"
                    color={selectedUnit === unit ? Theme.colors.background.primary : Theme.colors.text.primary}
                    style={styles.unitButtonText}
                  >
                    {unit}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={() => {
                setShowQuantityModal(false);
                setCurrentItem(null);
              }}
            >
              <Typography variant="body" color={Theme.colors.text.secondary}>
                Cancel
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonPrimary}
              onPress={handleAddItemWithQuantity}
            >
              <Typography variant="body" color={Theme.colors.background.primary}>
                Add Item
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  );

  const renderCustomItemModal = () => {
    const commonUnits = ['pieces', 'lbs', 'container', 'kg', 'oz', 'cup', 'tbsp', 'tsp', 'gallon', 'dozen', 'bag'];
    
    return showCustomItemModal && (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Typography
            variant="h3"
            color={Theme.colors.text.primary}
            style={styles.modalTitle}
          >
            Add Custom Item
          </Typography>

          <View style={styles.inputGroup}>
            <Typography
              variant="body"
              color={Theme.colors.text.primary}
              style={styles.modalLabel}
            >
              Item Name
            </Typography>
            <TextInput
              style={styles.modalTextInput}
              value={customItemName}
              onChangeText={setCustomItemName}
              placeholder="Enter item name"
              autoFocus
            />
          </View>

          <View style={styles.quantitySection}>
            <Typography
              variant="body"
              color={Theme.colors.text.primary}
              style={styles.modalLabel}
            >
              Quantity
            </Typography>
            <TextInput
              style={styles.quantityInput}
              value={customItemQuantity}
              onChangeText={setCustomItemQuantity}
              placeholder="1"
              keyboardType="numeric"
              selectTextOnFocus
            />
          </View>

          <View style={styles.unitSection}>
            <Typography
              variant="body"
              color={Theme.colors.text.primary}
              style={styles.modalLabel}
            >
              Unit
            </Typography>
            <View style={styles.unitsContainer}>
              {commonUnits.map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    styles.unitButton,
                    customItemUnit === unit && styles.unitButtonSelected
                  ]}
                  onPress={() => setCustomItemUnit(unit)}
                >
                  <Typography
                    variant="caption"
                    color={customItemUnit === unit ? Theme.colors.background.primary : Theme.colors.text.primary}
                    style={styles.unitButtonText}
                  >
                    {unit}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={() => {
                setShowCustomItemModal(false);
                setCustomItemName('');
                setCustomItemQuantity('1');
                setCustomItemUnit('pieces');
              }}
            >
              <Typography variant="body" color={Theme.colors.text.secondary}>
                Cancel
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonPrimary}
              onPress={handleAddCustomItem}
              disabled={!customItemName.trim()}
            >
              <Typography variant="body" color={Theme.colors.background.primary}>
                Add Item
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderDuplicateModal = () => (
    showDuplicateModal && duplicateItemData && (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Typography
            variant="h3"
            color={Theme.colors.text.primary}
            style={styles.modalTitle}
          >
            Item Already Added
          </Typography>

          <View style={styles.duplicateMessage}>
            <Typography
              variant="body"
              color={Theme.colors.text.primary}
              style={styles.duplicateText}
            >
              {duplicateItemData.existingItem.name} with {duplicateItemData.existingItem.quantity} {duplicateItemData.existingItem.unit} is already in your list.
            </Typography>
            <Typography
              variant="body"
              color={Theme.colors.text.primary}
              style={styles.duplicateText}
            >
              Do you really want to add {duplicateItemData.newQuantity} {duplicateItemData.newUnit} more?
            </Typography>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={handleDuplicateCancel}
            >
              <Typography variant="body" color={Theme.colors.text.secondary}>
                Cancel
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonPrimary}
              onPress={handleDuplicateConfirm}
            >
              <Typography variant="body" color={Theme.colors.background.primary}>
                Add More
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderListNameInput()}
        {renderSearchInput()}
        
        {/* Loading state */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Typography
              variant="body"
              color={Theme.colors.text.secondary}
              style={styles.loadingText}
            >
              Loading grocery items...
            </Typography>
          </View>
        )}
        
        {/* Show categories section only when user has selected items and NOT searching */}
        {showCategories && !searchQuery.trim() && (
          <View style={styles.categoriesSection}>
            <Typography
              variant="h3"
              color={Theme.colors.text.primary}
              style={styles.sectionTitle}
            >
              Selected Items ({selectedItems.size} selected)
            </Typography>
            {visibleCategories.length > 0 ? (
              visibleCategories.map(renderCategory)
            ) : (
              <View style={styles.emptyState}>
                <Typography
                  variant="body"
                  color={Theme.colors.text.secondary}
                  style={styles.emptyStateText}
                >
                  Start searching to add items to your list
                </Typography>
              </View>
            )}
          </View>
        )}

        {/* Initial state - show helpful message when no search/selection */}
        {!showCategories && (
          <View style={styles.initialState}>
            <Typography
              variant="h3"
              color={Theme.colors.text.primary}
              style={styles.initialStateTitle}
            >
              🛒 Ready to create your list?
            </Typography>
            <Typography
              variant="body"
              color={Theme.colors.text.secondary}
              style={styles.initialStateDescription}
            >
              1. Give your list a name above{'\n'}
              2. Search for items to add{'\n'}
              3. Select items you need{'\n'}
              4. Create your list!
            </Typography>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomSection}>
        <Button
          title={`${editMode ? 'Update' : 'Create'} List${selectedItems.size > 0 ? ` (${selectedItems.size} items)` : ''}`}
          variant="primary"
          size="medium"
          onPress={handleCreateList}
          disabled={!listName.trim() || selectedItems.size === 0 || (editMode && !hasChanges)}
          style={styles.createButton}
        />
      </View>

      {/* Modals */}
      {renderQuantityModal()}
      {renderCustomItemModal()}
      {renderDuplicateModal()}
    </SafeAreaView>
  );

};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  } as ViewStyle,

  header: {
    backgroundColor: Theme.colors.background.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } as ViewStyle,

  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  headerTitle: {
    fontWeight: '700',
    fontSize: 18,
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100, // Space for fixed button (reduced)
  } as ViewStyle,

  inputSection: {
    marginBottom: Theme.spacing.md,
  } as ViewStyle,

  inputLabel: {
    fontWeight: '700',
    marginBottom: Theme.spacing.sm,
  } as ViewStyle,

  textInput: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: Theme.colors.text.primary,
  } as ViewStyle,

  categoriesSection: {
    marginTop: Theme.spacing.md,
  } as ViewStyle,

  sectionTitle: {
    fontWeight: '700',
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  categoryContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.xl,
    marginBottom: Theme.spacing.md,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  } as ViewStyle,

  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
  } as ViewStyle,

  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  categoryIcon: {
    fontSize: 24,
    marginRight: Theme.spacing.md,
  } as ViewStyle,

  categoryInfo: {
    flex: 1,
  } as ViewStyle,

  categoryName: {
    fontWeight: '700',
    marginBottom: 2,
  } as ViewStyle,

  chevron: {
    fontSize: 12,
    marginLeft: Theme.spacing.sm,
  } as ViewStyle,

  itemsContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
  } as ViewStyle,

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.md,
  } as ViewStyle,

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  itemIcon: {
    fontSize: 20,
    marginRight: Theme.spacing.md,
  } as ViewStyle,

  itemName: {
    fontWeight: '500',
  } as ViewStyle,

  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } as ViewStyle,

  removeButtonText: {
    fontSize: 16,
    fontWeight: '700',
  } as ViewStyle,

  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.background.primary,
    padding: Theme.spacing.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: 'center',
  } as ViewStyle,

  createButton: {
    minWidth: 200,
    maxWidth: 300,
    height: 44,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  } as ViewStyle,

  // Search Dropdown Styles
  searchDropdown: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: Theme.spacing.xs,
    maxHeight: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  } as ViewStyle,

  searchDropdownScroll: {
    maxHeight: 200,
  } as ViewStyle,

  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  } as ViewStyle,

  searchItemIcon: {
    marginRight: Theme.spacing.md,
    fontSize: 18,
  } as ViewStyle,

  searchItemName: {
    flex: 1,
    fontSize: 16,
  } as ViewStyle,

  // Initial and Empty States
  initialState: {
    alignItems: 'center',
    paddingVertical: Theme.spacing['4xl'],
    paddingHorizontal: Theme.spacing.lg,
  } as ViewStyle,

  initialStateTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  initialStateDescription: {
    textAlign: 'center',
    lineHeight: 24,
  } as ViewStyle,

  emptyState: {
    alignItems: 'center',
    paddingVertical: Theme.spacing['2xl'],
    paddingHorizontal: Theme.spacing.lg,
  } as ViewStyle,

  emptyStateText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  addCustomFromSearchButton: {
    backgroundColor: Theme.colors.background.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: Theme.colors.primary[500],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } as ViewStyle,

  addCustomFromSearchText: {
    textAlign: 'center',
    fontWeight: '600',
  } as ViewStyle,

  // Search Header Styles
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  } as ViewStyle,

  addCustomButton: {
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.primary[500],
  } as ViewStyle,

  addCustomText: {
    fontSize: 12,
    fontWeight: '600',
  } as ViewStyle,

  // Item Info Styles
  itemInfo: {
    flex: 1,
  } as ViewStyle,

  itemQuantity: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  } as ViewStyle,

  // Quantity Controls Styles
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: Theme.spacing.sm,
  } as ViewStyle,

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  } as ViewStyle,

  quantityButton: {
    backgroundColor: '#F3F4F6',
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  } as ViewStyle,

  quantityButtonText: {
    color: Theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  } as ViewStyle,

  quantityDisplay: {
    paddingHorizontal: Theme.spacing.md,
    minWidth: 60,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.background.primary,
  } as ViewStyle,

  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 16,
    color: Theme.colors.text.primary,
    textAlign: 'center',
  } as ViewStyle,

  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.text.secondary,
  } as ViewStyle,

  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  } as ViewStyle,

  modalContent: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius['2xl'],
    padding: Theme.spacing['2xl'],
    margin: Theme.spacing.lg,
    width: '85%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  } as ViewStyle,

  modalTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  modalLabel: {
    fontWeight: '600',
    marginBottom: Theme.spacing.sm,
  } as ViewStyle,

  quantitySection: {
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  quantityInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'center',
  } as ViewStyle,

  unitSection: {
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  unitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.sm,
  } as ViewStyle,

  unitButton: {
    backgroundColor: '#F9F9F9',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  } as ViewStyle,

  unitButtonSelected: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  } as ViewStyle,

  unitButtonText: {
    fontSize: 12,
    fontWeight: '500',
  } as ViewStyle,

  inputGroup: {
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  modalTextInput: {
    backgroundColor: '#F9F9F9',
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  } as ViewStyle,

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.md,
  } as ViewStyle,

  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  } as ViewStyle,

  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#4ADE80',
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } as ViewStyle,

  loadingContainer: {
    paddingVertical: Theme.spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  loadingText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as ViewStyle,

  // Duplicate Modal Styles
  duplicateMessage: {
    marginBottom: Theme.spacing['2xl'],
    alignItems: 'center',
  } as ViewStyle,

  duplicateText: {
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
    lineHeight: 20,
  } as ViewStyle,
};
