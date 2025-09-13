/**
 * Create New List Screen
 * Create shopping lists with categorized items and search functionality
 * Exact implementation matching the old project's user experience
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Keyboard,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';
import { GradientBackground } from '../../components/atoms/GradientBackground';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';

// Styles
import { baseStyles, createDynamicStyles } from './CreateListScreen.styles';

// Services
import groceryItemsService, {
  type Category,
  type GroceryItem,
} from '../../../infrastructure/services/groceryItemsService';

// Redux
import {
  addShoppingItem,
  createShoppingList,
  selectIsCreatingList,
  selectShoppingListError,
} from '../../../application/store/slices/shoppingListSlice';
import type { AppDispatch } from '../../../application/store';

// Navigation
import type { ListsStackParamList } from '../../navigation/ListsStackNavigator';
import type { StackNavigationProp } from '@react-navigation/stack';

// Types
import type { CreateListFormData } from '../../components/molecules/CreateListModal/CreateListModal';

type NavigationProp = StackNavigationProp<ListsStackParamList, 'CreateList'>;

// Screen dimensions are available but not currently used in this component

export interface CreateListScreenProps {
  onBackPress: () => void;
  onCreateList?: (listName: string, selectedItems: SelectedItemData[]) => void;
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
  onBackPress: _onBackPress,
  onCreateList,
  onUpdateList,
  editMode = false,
  existingListName = '',
  existingItems = [],
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  // Create dynamic styles
  const dynamicStyles = createDynamicStyles(theme);

  // Redux selectors
  const isCreatingList = useSelector(selectIsCreatingList);
  // Shopping list error state is available but not displayed in this component
  // const shoppingListError = useSelector(selectShoppingListError);

  // Form state
  const [listName, setListName] = useState('');
  const [selectedItems, setSelectedItems] = useState<Map<string, SelectedItemData>>(new Map());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  // Modal states
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<GroceryItem | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemQuantity, setCustomItemQuantity] = useState('1');
  const [customItemUnit, setCustomItemUnit] = useState('pieces');
  const [customItemCategory, setCustomItemCategory] = useState('');
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateItemData, setDuplicateItemData] = useState<{
    existingItem: SelectedItemData;
    newQuantity: string;
    newUnit: string;
  } | null>(null);

  // Data state
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchResults, setSearchResults] = useState<GroceryItem[]>([]);

  // Track original values for edit mode
  const [originalListName, setOriginalListName] = useState('');
  const [originalItems, setOriginalItems] = useState<Map<string, SelectedItemData>>(new Map());

  // Keyboard state for UX improvements
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // ScrollView ref for programmatic scrolling
  const scrollViewRef = useRef<ScrollView>(null);
  const modalScrollViewRef = useRef<ScrollView>(null);

  // Safe theme with fallbacks
  const safeTheme = theme?.colors
    ? theme
    : {
        colors: {
          primary: { '500': '#22c55e', '600': '#16a34a' },
          text: { primary: '#000000', secondary: '#666666', tertiary: '#999999' },
          background: { primary: '#ffffff' },
          surface: { background: '#ffffff', secondary: '#f5f5f5', card: '#ffffff' },
          border: { primary: '#e5e5e5' },
          semantic: { error: { '500': '#ef4444' }, success: { '500': '#10b981' } },
        },
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
      };

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

  // Keyboard visibility detection for better UX
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await groceryItemsService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchItems = async () => {
    try {
      const results = await groceryItemsService.searchItems(searchQuery);
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
      if (
        currentItem.quantity !== originalItem.quantity ||
        currentItem.unit !== originalItem.unit
      ) {
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
        item = await groceryItemsService.getItemById(itemId);
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
    if (customItemName.trim() && customItemCategory.trim()) {
      // Check if a custom item with the same name already exists in the same category
      const existingCustomItem = Array.from(selectedItems.values()).find(
        item =>
          item.category === customItemCategory &&
          item.name.toLowerCase() === customItemName.trim().toLowerCase()
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
        // Find the selected category to get its icon
        const selectedCategory = categories.find(cat => cat.id === customItemCategory);
        const customItem: SelectedItemData = {
          id: customId,
          name: customItemName.trim(),
          quantity: customItemQuantity.trim(),
          unit: customItemUnit,
          icon: selectedCategory?.icon || '📦',
          category: customItemCategory,
        };

        const newSelected = new Map(selectedItems);
        newSelected.set(customId, customItem);
        setSelectedItems(newSelected);

        setShowCustomItemModal(false);
        setCustomItemName('');
        setCustomItemQuantity('1');
        setCustomItemUnit('pieces');
        setCustomItemCategory('');
        setShowUnitDropdown(false);
        setShowCategoryDropdown(false);

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
    // Set first category as default, or empty if no categories
    setCustomItemCategory(categories.length > 0 && categories[0] ? categories[0].id : '');
    setShowCustomItemModal(true);
  };

  // Group search results and selected items by category
  const getVisibleCategories = () => {
    const categoriesToShow = [...categories];

    // Get all custom items (items with IDs starting with 'custom_')
    const customItems = Array.from(selectedItems.values()).filter(item =>
      item.id.startsWith('custom_')
    );

    if (searchQuery.trim()) {
      // During search, group search results by category
      const searchResultsByCategory = new Map<string, GroceryItem[]>();

      searchResults.forEach(item => {
        if (!searchResultsByCategory.has(item.category)) {
          searchResultsByCategory.set(item.category, []);
        }
        searchResultsByCategory.get(item.category)!.push(item);
      });

      // Add custom items that match search to their respective categories
      customItems.forEach(customItem => {
        if (customItem.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          if (!searchResultsByCategory.has(customItem.category)) {
            searchResultsByCategory.set(customItem.category, []);
          }
          // Convert custom item to GroceryItem format for display
          const groceryItem: GroceryItem = {
            id: customItem.id,
            name: customItem.name,
            icon: customItem.icon,
            category: customItem.category,
            defaultUnit: customItem.unit,
            commonUnits: ['pieces', 'lbs', 'container', 'kg', 'oz', 'cup', 'tbsp', 'tsp'],
          };
          searchResultsByCategory.get(customItem.category)!.push(groceryItem);
        }
      });

      // Return categories with search results
      return categoriesToShow
        .map(category => ({
          ...category,
          items: searchResultsByCategory.get(category.id) || [],
        }))
        .filter(category => category.items.length > 0);
    } else {
      // When not searching, show categories with selected items (including custom items)
      return categoriesToShow
        .map(category => {
          // Get regular selected items for this category
          const regularItems = category.items.filter(item => selectedItems.has(item.id));

          // Get custom items for this category
          const categoryCustomItems = customItems
            .filter(customItem => customItem.category === category.id)
            .map(customItem => ({
              id: customItem.id,
              name: customItem.name,
              icon: customItem.icon,
              category: customItem.category,
              defaultUnit: customItem.unit,
              commonUnits: ['pieces', 'lbs', 'container', 'kg', 'oz', 'cup', 'tbsp', 'tsp'],
            }));

          return {
            ...category,
            items: [...regularItems, ...categoryCustomItems],
          };
        })
        .filter(category => category.items.length > 0);
    }
  };

  const visibleCategories = getVisibleCategories();

  // Handle search field focus - scroll up to make space for dropdown
  const handleSearchFieldFocus = () => {
    // Small delay to ensure keyboard animation starts
    setTimeout(() => {
      const screenHeight = Dimensions.get('window').height;
      // Calculate optimal scroll position based on screen size
      // Scroll up by about 15% of screen height to create good space for dropdown
      const scrollOffset = Math.min(150, screenHeight * 0.15);

      scrollViewRef.current?.scrollTo({
        y: scrollOffset,
        animated: true,
      });
    }, 100);
  };

  // Handle modal dropdown scroll adjustment
  const handleModalDropdownScroll = (yOffset: number) => {
    setTimeout(() => {
      modalScrollViewRef.current?.scrollTo({
        y: yOffset,
        animated: true,
      });
    }, 100);
  };

  const handleCreateList = async () => {
    if (listName.trim() && selectedItems.size > 0) {
      try {
        const formData = {
          name: listName.trim(),
          description: '',
          budget_amount: undefined,
          budget_currency: 'USD',
        } as unknown as CreateListFormData;

        if (editMode && onUpdateList) {
          onUpdateList(listName.trim(), Array.from(selectedItems.values()));
        } else if (onCreateList) {
          onCreateList(listName.trim(), Array.from(selectedItems.values()));
        } else {
          // Use Redux to create the list
          console.log('🛒 Creating shopping list with items:', {
            listName: listName.trim(),
            itemCount: selectedItems.size,
            items: Array.from(selectedItems.values()),
          });

          const createdList = await dispatch(createShoppingList(formData)).unwrap();
          console.log('✅ Shopping list created:', createdList);

          // Add all selected items to the newly created list
          const itemsArray = Array.from(selectedItems.values());
          console.log('🛒 Adding items to list:', itemsArray);

          for (const item of itemsArray) {
            try {
              const itemData = {
                listId: createdList.id,
                name: item.name,
                quantity: parseFloat(item.quantity) || 1,
                unit: item.unit,
                category_id: undefined, // We don't have category mapping yet
                estimated_price: undefined,
                notes: undefined,
              } as any;

              console.log('🛒 Adding item to list:', itemData);
              await dispatch(addShoppingItem(itemData)).unwrap();
              console.log('✅ Item added successfully:', item.name);
            } catch (itemError: any) {
              console.error('❌ Failed to add item:', item.name, itemError);
              // Continue adding other items even if one fails
            }
          }

          // Navigate back to show the success animation on the lists screen
          navigation.goBack();
        }
      } catch (error: any) {
        console.error('Failed to create shopping list:', error);
        Alert.alert(
          'Error',
          error?.message || 'Failed to create shopping list. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  // Render functions will be implemented in the next part due to length...
  // [Continuing with render functions...]

  const renderHeader = () => (
    <View style={baseStyles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={baseStyles.headerButton}
        accessibilityRole='button'
        accessibilityLabel='Go back'>
        <Typography variant='h5' color={safeTheme.colors.text.primary}>
          ←
        </Typography>
      </TouchableOpacity>

      <Typography variant='h4' color={safeTheme.colors.text.primary}>
        {editMode ? 'Edit List' : 'Create New List'}
      </Typography>

      <View style={baseStyles.headerButton} />
    </View>
  );

  const renderListNameInput = () => (
    <View style={baseStyles.inputSection}>
      <Typography
        variant='body1'
        color={safeTheme.colors.text.primary}
        style={baseStyles.inputLabel}>
        List Name
      </Typography>
      <TextInput
        style={[
          baseStyles.textInput,
          dynamicStyles.textInputDynamic('#ffffff', '#e5e5e5', safeTheme.colors.text.primary),
        ]}
        value={listName}
        onChangeText={setListName}
        placeholder='Enter list name (e.g., Weekly Groceries)'
        placeholderTextColor={safeTheme.colors.text.secondary}
      />
    </View>
  );

  const renderSearchInput = () => (
    <View style={baseStyles.inputSection}>
      <Typography
        variant='body1'
        color={safeTheme.colors.text.primary}
        style={baseStyles.inputLabel}>
        Search & Add Items
      </Typography>
      <TextInput
        style={[
          baseStyles.textInput,
          dynamicStyles.textInputDynamic('#ffffff', '#e5e5e5', safeTheme.colors.text.primary),
        ]}
        value={searchQuery}
        onChangeText={text => {
          setSearchQuery(text);
          // Show categories when user starts searching
          if (text.trim() && !showCategories) {
            setShowCategories(true);
          }
        }}
        onFocus={handleSearchFieldFocus}
        placeholder='Search for items to add to your list...'
        placeholderTextColor={safeTheme.colors.text.secondary}
      />

      {/* Search Results Dropdown */}
      {searchQuery.trim() && (
        <View
          style={[
            baseStyles.searchDropdown,
            dynamicStyles.searchDropdownDynamic(safeTheme.colors.surface.card),
          ]}>
          <ScrollView
            style={baseStyles.searchDropdownScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps='always'>
            {searchResults.length > 0 ? (
              // Show search results
              searchResults.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={baseStyles.searchResultItem}
                  onPress={() => {
                    // Dismiss keyboard immediately for better UX
                    Keyboard.dismiss();
                    // Show quantity/unit modal for the selected item
                    setCurrentItem(item);
                    setQuantity('1');
                    setSelectedUnit(item.defaultUnit || 'pieces');
                    setShowQuantityModal(true);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}>
                  <Typography variant='body1' style={baseStyles.searchItemIcon}>
                    {item.icon}
                  </Typography>
                  <Typography
                    variant='body1'
                    color={safeTheme.colors.text.primary}
                    style={baseStyles.searchItemName}>
                    {item.name}
                  </Typography>
                </TouchableOpacity>
              ))
            ) : (
              // Show "Add Custom Item" option when no results found
              <TouchableOpacity
                style={baseStyles.searchResultItem}
                onPress={() => {
                  // Dismiss keyboard immediately for better UX
                  Keyboard.dismiss();
                  handleCreateFromSearch(searchQuery.trim());
                  setSearchQuery('');
                  setSearchResults([]);
                }}>
                <Typography variant='body1' style={baseStyles.searchItemIcon}>
                  ➕
                </Typography>
                <Typography
                  variant='body1'
                  color={safeTheme.colors.primary['500']}
                  style={baseStyles.searchItemName}>
                  Add "{searchQuery.trim()}" as custom item
                </Typography>
              </TouchableOpacity>
            )}
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
        style={baseStyles.categoryHeader}
        onPress={() => toggleCategory(category.id)}
        accessibilityRole='button'
        accessibilityLabel={`${isCollapsed ? 'Expand' : 'Collapse'} ${category.name} category`}>
        <View style={baseStyles.categoryLeft}>
          <Typography variant='h6' style={baseStyles.categoryIcon}>
            {category.icon}
          </Typography>
          <View style={baseStyles.categoryInfo}>
            <Typography
              variant='h5'
              color={safeTheme.colors.text.primary}
              style={baseStyles.categoryName}>
              {category.name}
            </Typography>
            <Typography variant='caption' color={safeTheme.colors.text.secondary}>
              {category.items.length} items
              {categoryItemCount > 0 && ` • ${categoryItemCount} selected`}
            </Typography>
          </View>
        </View>
        <Typography
          variant='body1'
          color={safeTheme.colors.text.secondary}
          style={baseStyles.chevron}>
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
        quantity: newQty.toString(),
      };

      setSelectedItems(new Map(selectedItems.set(item.id, updatedItemData)));
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={baseStyles.itemRow}
        onPress={() => {
          // Dismiss keyboard if it's open for better UX
          Keyboard.dismiss();
          toggleItem(item.id);
        }}
        accessibilityRole='button'
        accessibilityLabel={`${isSelected ? 'Remove' : 'Add'} ${item.name}`}>
        <View style={baseStyles.itemLeft}>
          <Typography variant='body1' style={baseStyles.itemIcon}>
            {item.icon}
          </Typography>
          <View style={baseStyles.itemInfo}>
            <Typography
              variant='body1'
              color={safeTheme.colors.text.primary}
              style={baseStyles.itemName}>
              {item.name}
            </Typography>
            {isSelected && selectedItemData && (
              <View style={baseStyles.quantityControls}>
                <View
                  style={[
                    baseStyles.quantityContainer,
                    { backgroundColor: safeTheme.colors.surface.card },
                  ]}>
                  <TouchableOpacity
                    style={[
                      baseStyles.quantityButton,
                      { borderRightWidth: 1, borderRightColor: '#E5E7EB' },
                    ]}
                    onPress={e => {
                      e.stopPropagation();
                      handleQuantityChange(false);
                    }}
                    accessibilityRole='button'
                    accessibilityLabel={`Decrease quantity for ${item.name}`}>
                    <Typography variant='body1' style={baseStyles.quantityButtonText}>
                      -
                    </Typography>
                  </TouchableOpacity>
                  <View
                    style={[
                      baseStyles.quantityDisplay,
                      { backgroundColor: safeTheme.colors.surface.card },
                    ]}>
                    <Typography
                      variant='caption'
                      color={safeTheme.colors.text.primary}
                      style={baseStyles.quantityText}>
                      {selectedItemData.quantity}
                    </Typography>
                  </View>
                  <TouchableOpacity
                    style={[baseStyles.quantityButton, baseStyles.quantityButtonLast]}
                    onPress={e => {
                      e.stopPropagation();
                      handleQuantityChange(true);
                    }}
                    accessibilityRole='button'
                    accessibilityLabel={`Increase quantity for ${item.name}`}>
                    <Typography variant='body1' style={baseStyles.quantityButtonText}>
                      +
                    </Typography>
                  </TouchableOpacity>
                </View>
                <Typography
                  variant='caption'
                  color={safeTheme.colors.text.secondary}
                  style={baseStyles.unitText}>
                  {selectedItemData.unit}
                </Typography>
              </View>
            )}
          </View>
        </View>
        {isSelected && (
          <TouchableOpacity
            style={baseStyles.removeButton}
            onPress={e => {
              e.stopPropagation();
              const newSelected = new Map(selectedItems);
              newSelected.delete(item.id);
              setSelectedItems(newSelected);
            }}
            accessibilityRole='button'
            accessibilityLabel={`Remove ${item.name} from list`}>
            <Typography variant='body1' color='#ffffff' style={baseStyles.removeButtonText}>
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
      <View
        key={category.id}
        style={[
          baseStyles.categoryContainer,
          dynamicStyles.categoryContainerDynamic(safeTheme.colors.surface.card),
        ]}>
        {renderCategoryHeader(category)}
        {!isCollapsed && (
          <View style={baseStyles.itemsContainer}>{category.items.map(renderItem)}</View>
        )}
      </View>
    );
  };

  const renderQuantityModal = () =>
    showQuantityModal &&
    currentItem && (
      <View style={baseStyles.modalOverlay}>
        <View
          style={[
            baseStyles.modalContent,
            dynamicStyles.modalContentDynamic(safeTheme.colors.surface.card),
          ]}>
          <Typography
            variant='h5'
            color={safeTheme.colors.text.primary}
            style={baseStyles.modalTitle}>
            Add {currentItem.name}
          </Typography>

          <View style={baseStyles.quantitySection}>
            <Typography
              variant='body1'
              color={safeTheme.colors.text.primary}
              style={baseStyles.modalLabel}>
              Quantity
            </Typography>
            <TextInput
              style={[
                baseStyles.quantityInput,
                dynamicStyles.quantityInputDynamic(
                  '#F9F9F9',
                  '#E5E7EB',
                  safeTheme.colors.text.primary
                ),
              ]}
              value={quantity}
              onChangeText={setQuantity}
              placeholder='1'
              keyboardType='numeric'
              selectTextOnFocus
            />
          </View>

          <View style={baseStyles.unitSection}>
            <Typography
              variant='body1'
              color={safeTheme.colors.text.primary}
              style={baseStyles.modalLabel}>
              Unit
            </Typography>
            <View style={baseStyles.unitsContainer}>
              {currentItem.commonUnits.map(unit => (
                <TouchableOpacity
                  key={unit}
                  style={[
                    baseStyles.unitButton,
                    selectedUnit === unit && [
                      baseStyles.unitButtonSelected,
                      { backgroundColor: safeTheme.colors.primary['500'] },
                    ],
                  ]}
                  onPress={() => setSelectedUnit(unit)}>
                  <Typography
                    variant='caption'
                    color={selectedUnit === unit ? '#ffffff' : safeTheme.colors.text.primary}
                    style={baseStyles.unitButtonText}>
                    {unit}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={baseStyles.modalButtons}>
            <TouchableOpacity
              style={[
                baseStyles.modalButtonSecondary,
                { backgroundColor: (safeTheme.colors.surface as any).secondary },
              ]}
              onPress={() => {
                setShowQuantityModal(false);
                setCurrentItem(null);
              }}>
              <Typography variant='body1' color={safeTheme.colors.text.secondary}>
                Cancel
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                baseStyles.modalButtonPrimary,
                { backgroundColor: safeTheme.colors.primary['500'] },
              ]}
              onPress={handleAddItemWithQuantity}>
              <Typography variant='body1' color='#ffffff'>
                Add Item
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );

  const renderDuplicateModal = () =>
    showDuplicateModal &&
    duplicateItemData && (
      <View style={baseStyles.modalOverlay}>
        <View
          style={[
            baseStyles.modalContent,
            dynamicStyles.modalContentDynamic(safeTheme.colors.surface.card),
          ]}>
          <Typography
            variant='h5'
            color={safeTheme.colors.text.primary}
            style={baseStyles.modalTitle}>
            Item Already Added
          </Typography>

          <View style={baseStyles.duplicateMessage}>
            <Typography
              variant='body1'
              color={safeTheme.colors.text.primary}
              style={baseStyles.duplicateText}>
              {duplicateItemData.existingItem.name} with {duplicateItemData.existingItem.quantity}{' '}
              {duplicateItemData.existingItem.unit} is already in your list.
            </Typography>
            <Typography
              variant='body1'
              color={safeTheme.colors.text.primary}
              style={baseStyles.duplicateText}>
              Do you really want to add {duplicateItemData.newQuantity} {duplicateItemData.newUnit}{' '}
              more?
            </Typography>
          </View>

          <View style={baseStyles.modalButtons}>
            <TouchableOpacity
              style={[
                baseStyles.modalButtonSecondary,
                { backgroundColor: (safeTheme.colors.surface as any).secondary },
              ]}
              onPress={handleDuplicateCancel}>
              <Typography variant='body1' color={safeTheme.colors.text.secondary}>
                Cancel
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                baseStyles.modalButtonPrimary,
                { backgroundColor: safeTheme.colors.primary['500'] },
              ]}
              onPress={handleDuplicateConfirm}>
              <Typography variant='body1' color='#ffffff'>
                Add More
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );

  const renderCustomItemModal = () =>
    showCustomItemModal && (
      <View style={baseStyles.modalOverlay}>
        <View
          style={[
            baseStyles.modalContent,
            dynamicStyles.modalContentDynamic(safeTheme.colors.surface.card),
          ]}>
          <Typography
            variant='h5'
            color={safeTheme.colors.text.primary}
            style={baseStyles.modalTitle}>
            Add Custom Item
          </Typography>

          <ScrollView
            ref={modalScrollViewRef}
            style={baseStyles.modalScrollView}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
            bounces={false}>
            <View style={baseStyles.quantitySection}>
              <Typography
                variant='body1'
                color={safeTheme.colors.text.primary}
                style={baseStyles.modalLabel}>
                Item Name
              </Typography>
              <TextInput
                style={[
                  baseStyles.quantityInput,
                  dynamicStyles.quantityInputDynamic(
                    '#F9F9F9',
                    '#E5E7EB',
                    safeTheme.colors.text.primary
                  ),
                ]}
                value={customItemName}
                onChangeText={setCustomItemName}
                placeholder='Enter item name'
                placeholderTextColor={safeTheme.colors.text.secondary}
                autoFocus={true}
              />
            </View>

            <View style={baseStyles.quantitySection}>
              <Typography
                variant='body1'
                color={safeTheme.colors.text.primary}
                style={baseStyles.modalLabel}>
                Quantity
              </Typography>
              <TextInput
                style={[
                  baseStyles.quantityInput,
                  dynamicStyles.quantityInputDynamic(
                    '#F9F9F9',
                    '#E5E7EB',
                    safeTheme.colors.text.primary
                  ),
                ]}
                value={customItemQuantity}
                onChangeText={setCustomItemQuantity}
                placeholder='1'
                placeholderTextColor={safeTheme.colors.text.secondary}
                keyboardType='numeric'
              />
            </View>

            <View style={baseStyles.quantitySection}>
              <Typography
                variant='body1'
                color={safeTheme.colors.text.primary}
                style={baseStyles.modalLabel}>
                Unit
              </Typography>
              <View style={baseStyles.dropdownWrapper}>
                <TouchableOpacity
                  style={[
                    baseStyles.quantityInput,
                    dynamicStyles.quantityInputDynamic(
                      '#F9F9F9',
                      '#E5E7EB',
                      safeTheme.colors.text.primary
                    ),
                    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
                  ]}
                  onPress={() => {
                    setShowUnitDropdown(!showUnitDropdown);
                    // Close other dropdowns when this one opens
                    if (!showUnitDropdown) {
                      setShowCategoryDropdown(false);
                      // Scroll to make dropdown visible (unit dropdown is around 150px from top)
                      handleModalDropdownScroll(100);
                    }
                  }}>
                  <Typography variant='body1' color={safeTheme.colors.text.primary}>
                    {customItemUnit}
                  </Typography>
                  <Typography variant='body1' color={safeTheme.colors.text.secondary}>
                    {showUnitDropdown ? '▲' : '▼'}
                  </Typography>
                </TouchableOpacity>
                {showUnitDropdown && (
                  <View
                    style={[
                      baseStyles.unitDropdownContainer,
                      { backgroundColor: safeTheme.colors.surface.card },
                    ]}>
                    <ScrollView
                      style={baseStyles.dropdownScroll}
                      showsVerticalScrollIndicator={false}>
                      {[
                        'pieces',
                        'lbs',
                        'kg',
                        'container',
                        'bag',
                        'box',
                        'bottle',
                        'jar',
                        'pack',
                        'oz',
                        'cup',
                        'tbsp',
                        'tsp',
                      ].map(unit => (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            baseStyles.dropdownItem,
                            customItemUnit === unit && {
                              backgroundColor: `${safeTheme.colors.primary['500']}20`,
                            },
                          ]}
                          onPress={() => {
                            setCustomItemUnit(unit);
                            setShowUnitDropdown(false);
                          }}>
                          <Typography
                            variant='body1'
                            color={
                              customItemUnit === unit
                                ? safeTheme.colors.primary['500']
                                : safeTheme.colors.text.primary
                            }>
                            {unit}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>

            <View style={baseStyles.quantitySection}>
              <Typography
                variant='body1'
                color={safeTheme.colors.text.primary}
                style={baseStyles.modalLabel}>
                Category
              </Typography>
              <View style={baseStyles.dropdownWrapper}>
                <TouchableOpacity
                  style={[
                    baseStyles.quantityInput,
                    dynamicStyles.quantityInputDynamic(
                      '#F9F9F9',
                      '#E5E7EB',
                      safeTheme.colors.text.primary
                    ),
                    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
                  ]}
                  onPress={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    // Close other dropdowns when this one opens
                    if (!showCategoryDropdown) {
                      setShowUnitDropdown(false);
                      // Scroll to make dropdown visible (category dropdown is around 250px from top)
                      handleModalDropdownScroll(200);
                    }
                  }}>
                  <Typography variant='body1' color={safeTheme.colors.text.primary}>
                    {customItemCategory
                      ? `${categories.find(cat => cat.id === customItemCategory)?.icon} ${categories.find(cat => cat.id === customItemCategory)?.name}`
                      : 'Select category'}
                  </Typography>
                  <Typography variant='body1' color={safeTheme.colors.text.secondary}>
                    {showCategoryDropdown ? '▲' : '▼'}
                  </Typography>
                </TouchableOpacity>
                {showCategoryDropdown && (
                  <View
                    style={[
                      baseStyles.categoryDropdownContainer,
                      { backgroundColor: safeTheme.colors.surface.card },
                    ]}>
                    <ScrollView
                      style={baseStyles.dropdownScroll}
                      showsVerticalScrollIndicator={false}>
                      {categories.map(category => (
                        <TouchableOpacity
                          key={category.id}
                          style={[
                            baseStyles.dropdownItem,
                            customItemCategory === category.id && {
                              backgroundColor: `${safeTheme.colors.primary['500']}20`,
                            },
                          ]}
                          onPress={() => {
                            setCustomItemCategory(category.id);
                            setShowCategoryDropdown(false);
                          }}>
                          <Typography
                            variant='body1'
                            color={
                              customItemCategory === category.id
                                ? safeTheme.colors.primary['500']
                                : safeTheme.colors.text.primary
                            }>
                            {category.icon} {category.name}
                          </Typography>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={baseStyles.modalButtons}>
            <TouchableOpacity
              style={[
                baseStyles.modalButtonSecondary,
                { backgroundColor: (safeTheme.colors.surface as any).secondary },
              ]}
              onPress={() => {
                setShowCustomItemModal(false);
                setCustomItemName('');
                setCustomItemQuantity('1');
                setCustomItemUnit('pieces');
                setCustomItemCategory('');
                setShowUnitDropdown(false);
                setShowCategoryDropdown(false);
              }}>
              <Typography variant='body1' color={safeTheme.colors.text.secondary}>
                Cancel
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                baseStyles.modalButtonPrimary,
                {
                  backgroundColor:
                    !customItemName.trim() || !customItemCategory.trim()
                      ? safeTheme.colors.text.secondary
                      : safeTheme.colors.primary['500'],
                },
              ]}
              onPress={handleAddCustomItem}
              disabled={!customItemName.trim() || !customItemCategory.trim()}>
              <Typography variant='body1' color='#ffffff'>
                Add Item
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );

  return (
    <GradientBackground>
      <SafeAreaView style={baseStyles.container}>
        {renderHeader()}

        <ScrollView
          ref={scrollViewRef}
          style={baseStyles.scrollView}
          contentContainerStyle={baseStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='interactive'>
          {renderListNameInput()}
          {renderSearchInput()}

          {/* Loading state */}
          {isLoading && (
            <View style={baseStyles.loadingContainer}>
              <Typography
                variant='body1'
                color={safeTheme.colors.text.secondary}
                style={baseStyles.loadingText}>
                Loading grocery items...
              </Typography>
            </View>
          )}

          {/* Show categories section only when user has selected items and NOT searching */}
          {showCategories && !searchQuery.trim() && (
            <View style={baseStyles.categoriesSection}>
              <Typography
                variant='h6'
                color={safeTheme.colors.text.primary}
                style={baseStyles.sectionTitle}>
                Selected Items ({selectedItems.size} selected)
              </Typography>
              {visibleCategories.length > 0 ? (
                visibleCategories.map(renderCategory)
              ) : (
                <View style={baseStyles.emptyState}>
                  <Typography
                    variant='body1'
                    color={safeTheme.colors.text.secondary}
                    style={baseStyles.emptyStateText}>
                    Start searching to add items to your list
                  </Typography>
                </View>
              )}
            </View>
          )}

          {/* Initial state - show helpful message when no search/selection */}
          {!showCategories && (
            <View style={baseStyles.initialState}>
              <Typography
                variant='h5'
                color={safeTheme.colors.text.primary}
                style={baseStyles.initialStateTitle}>
                🛒 Ready to create your list?
              </Typography>
              <Typography
                variant='body1'
                color={safeTheme.colors.text.secondary}
                style={baseStyles.initialStateDescription}>
                1. Give your list a name above{'\n'}
                2. Search for items to add{'\n'}
                3. Select items you need{'\n'}
                4. Create your list!
              </Typography>
            </View>
          )}
        </ScrollView>

        {/* Fixed Bottom Button - Hidden when keyboard is visible */}
        {!isKeyboardVisible && (
          <View
            style={[
              baseStyles.bottomSection,
              dynamicStyles.bottomSectionDynamic(safeTheme.colors.surface.card),
            ]}>
            <Button
              title={`${editMode ? 'Update' : 'Create'} List${selectedItems.size > 0 ? ` (${selectedItems.size} items)` : ''}`}
              variant='primary'
              onPress={handleCreateList}
              disabled={
                !listName.trim() ||
                selectedItems.size === 0 ||
                (editMode && !hasChanges) ||
                isCreatingList
              }
              style={baseStyles.createButton}
            />
          </View>
        )}

        {/* Modals */}
        {renderQuantityModal()}
        {renderDuplicateModal()}
        {renderCustomItemModal()}
      </SafeAreaView>
    </GradientBackground>
  );
};
