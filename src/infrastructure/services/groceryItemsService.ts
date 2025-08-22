import type { GroceryItem, Category } from '../../shared/types';

// Performance-optimized grocery items database
class GroceryItemsDatabase {
  private items: Map<string, GroceryItem> = new Map();
  private categories: Map<string, Category> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map(); // word -> item IDs
  private categoryIndex: Map<string, Set<string>> = new Map(); // category -> item IDs
  private isInitialized: boolean = false;

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    if (this.isInitialized) return;

    // Define categories first
    const categoriesData: Category[] = [
      {
        id: 'fruits',
        name: 'Fruits & Berries',
        icon: '🍎',
        items: [],
      },
      {
        id: 'vegetables',
        name: 'Vegetables',
        icon: '🥕',
        items: [],
      },
      {
        id: 'meat_seafood',
        name: 'Meat & Seafood',
        icon: '🥩',
        items: [],
      },
      {
        id: 'dairy_eggs',
        name: 'Dairy & Eggs',
        icon: '🥛',
        items: [],
      },
      {
        id: 'bakery',
        name: 'Bakery & Bread',
        icon: '🍞',
        items: [],
      },
      {
        id: 'pantry_staples',
        name: 'Pantry Staples',
        icon: '🏺',
        items: [],
      },
      {
        id: 'snacks',
        name: 'Snacks & Candy',
        icon: '🍿',
        items: [],
      },
      {
        id: 'beverages',
        name: 'Beverages',
        icon: '🥤',
        items: [],
      },
      {
        id: 'frozen',
        name: 'Frozen Foods',
        icon: '🧊',
        items: [],
      },
      {
        id: 'household',
        name: 'Household Items',
        icon: '🧽',
        items: [],
      },
      {
        id: 'health_beauty',
        name: 'Health & Beauty',
        icon: '🧴',
        items: [],
      },
      {
        id: 'baby_kids',
        name: 'Baby & Kids',
        icon: '🍼',
        items: [],
      },
      {
        id: 'pet_supplies',
        name: 'Pet Supplies',
        icon: '🐕',
        items: [],
      },
      {
        id: 'herbs_spices',
        name: 'Herbs & Spices',
        icon: '🌿',
        items: [],
      },
      {
        id: 'international',
        name: 'International Foods',
        icon: '🌍',
        items: [],
      },
    ];

    // Comprehensive items database
    const itemsData: Omit<GroceryItem, 'category'>[] = [
      // Fruits & Berries
      { id: 'apples', name: 'Apples', icon: '🍎', defaultUnit: 'lbs', commonUnits: ['lbs', 'pieces', 'kg', 'bag'], categoryId: 'fruits' },
      { id: 'bananas', name: 'Bananas', icon: '🍌', defaultUnit: 'bunch', commonUnits: ['bunch', 'pieces', 'lbs'], categoryId: 'fruits' },
      { id: 'oranges', name: 'Oranges', icon: '🍊', defaultUnit: 'pieces', commonUnits: ['pieces', 'lbs', 'bag'], categoryId: 'fruits' },
      { id: 'grapes', name: 'Grapes', icon: '🍇', defaultUnit: 'lbs', commonUnits: ['lbs', 'container', 'kg'], categoryId: 'fruits' },
      { id: 'strawberries', name: 'Strawberries', icon: '🍓', defaultUnit: 'container', commonUnits: ['container', 'lbs', 'pint'], categoryId: 'fruits' },
      { id: 'blueberries', name: 'Blueberries', icon: '🫐', defaultUnit: 'container', commonUnits: ['container', 'pint', 'cup'], categoryId: 'fruits' },
      { id: 'blackberries', name: 'Blackberries', icon: '🫐', defaultUnit: 'container', commonUnits: ['container', 'pint', 'cup'], categoryId: 'fruits' },
      { id: 'raspberries', name: 'Raspberries', icon: '🫐', defaultUnit: 'container', commonUnits: ['container', 'pint', 'cup'], categoryId: 'fruits' },
      { id: 'pineapple', name: 'Pineapple', icon: '🍍', defaultUnit: 'pieces', commonUnits: ['pieces', 'cup'], categoryId: 'fruits' },
      { id: 'mango', name: 'Mango', icon: '🥭', defaultUnit: 'pieces', commonUnits: ['pieces', 'cup'], categoryId: 'fruits' },
      { id: 'avocado', name: 'Avocado', icon: '🥑', defaultUnit: 'pieces', commonUnits: ['pieces', 'bag'], categoryId: 'fruits' },
      { id: 'watermelon', name: 'Watermelon', icon: '🍉', defaultUnit: 'pieces', commonUnits: ['pieces', 'lbs'], categoryId: 'fruits' },
      { id: 'cantaloupe', name: 'Cantaloupe', icon: '🍈', defaultUnit: 'pieces', commonUnits: ['pieces', 'cup'], categoryId: 'fruits' },
      { id: 'honeydew', name: 'Honeydew', icon: '🍈', defaultUnit: 'pieces', commonUnits: ['pieces', 'cup'], categoryId: 'fruits' },
      { id: 'peaches', name: 'Peaches', icon: '🍑', defaultUnit: 'lbs', commonUnits: ['lbs', 'pieces', 'can'], categoryId: 'fruits' },
      { id: 'pears', name: 'Pears', icon: '🍐', defaultUnit: 'lbs', commonUnits: ['lbs', 'pieces', 'can'], categoryId: 'fruits' },
      { id: 'plums', name: 'Plums', icon: '🫐', defaultUnit: 'lbs', commonUnits: ['lbs', 'pieces'], categoryId: 'fruits' },
      { id: 'cherries', name: 'Cherries', icon: '🍒', defaultUnit: 'lbs', commonUnits: ['lbs', 'container', 'bag'], categoryId: 'fruits' },
      { id: 'kiwi', name: 'Kiwi', icon: '🥝', defaultUnit: 'pieces', commonUnits: ['pieces', 'bag'], categoryId: 'fruits' },
      { id: 'lemons', name: 'Lemons', icon: '🍋', defaultUnit: 'pieces', commonUnits: ['pieces', 'bag', 'lbs'], categoryId: 'fruits' },
      { id: 'limes', name: 'Limes', icon: '🍋', defaultUnit: 'pieces', commonUnits: ['pieces', 'bag', 'lbs'], categoryId: 'fruits' },

      // Vegetables
      { id: 'carrots', name: 'Carrots', icon: '🥕', defaultUnit: 'lbs', commonUnits: ['lbs', 'bag', 'bunch'], categoryId: 'vegetables' },
      { id: 'broccoli', name: 'Broccoli', icon: '🥦', defaultUnit: 'bunch', commonUnits: ['bunch', 'head', 'bag'], categoryId: 'vegetables' },
      { id: 'cauliflower', name: 'Cauliflower', icon: '🥬', defaultUnit: 'head', commonUnits: ['head', 'bag'], categoryId: 'vegetables' },
      { id: 'spinach', name: 'Spinach', icon: '🥬', defaultUnit: 'bag', commonUnits: ['bag', 'bunch', 'container'], categoryId: 'vegetables' },
      { id: 'lettuce', name: 'Lettuce', icon: '🥬', defaultUnit: 'head', commonUnits: ['head', 'bag'], categoryId: 'vegetables' },
      { id: 'tomatoes', name: 'Tomatoes', icon: '🍅', defaultUnit: 'lbs', commonUnits: ['lbs', 'pieces', 'container'], categoryId: 'vegetables' },
      { id: 'potatoes', name: 'Potatoes', icon: '🥔', defaultUnit: 'lbs', commonUnits: ['lbs', 'bag', 'pieces'], categoryId: 'vegetables' },
      { id: 'sweet_potatoes', name: 'Sweet Potatoes', icon: '🍠', defaultUnit: 'lbs', commonUnits: ['lbs', 'pieces'], categoryId: 'vegetables' },
      { id: 'onions', name: 'Onions', icon: '🧅', defaultUnit: 'lbs', commonUnits: ['lbs', 'bag', 'pieces'], categoryId: 'vegetables' },
      { id: 'garlic', name: 'Garlic', icon: '🧄', defaultUnit: 'bulb', commonUnits: ['bulb', 'cloves', 'container'], categoryId: 'vegetables' },
      { id: 'bell_peppers', name: 'Bell Peppers', icon: '🫑', defaultUnit: 'pieces', commonUnits: ['pieces', 'lbs', 'bag'], categoryId: 'vegetables' },
      { id: 'cucumbers', name: 'Cucumbers', icon: '🥒', defaultUnit: 'pieces', commonUnits: ['pieces', 'lbs'], categoryId: 'vegetables' },
      { id: 'zucchini', name: 'Zucchini', icon: '🥒', defaultUnit: 'pieces', commonUnits: ['pieces', 'lbs'], categoryId: 'vegetables' },
      { id: 'mushrooms', name: 'Mushrooms', icon: '🍄', defaultUnit: 'container', commonUnits: ['container', 'lbs', 'oz'], categoryId: 'vegetables' },
      { id: 'celery', name: 'Celery', icon: '🥬', defaultUnit: 'bunch', commonUnits: ['bunch', 'stalks'], categoryId: 'vegetables' },
      { id: 'green_beans', name: 'Green Beans', icon: '🫘', defaultUnit: 'lbs', commonUnits: ['lbs', 'bag'], categoryId: 'vegetables' },
      { id: 'asparagus', name: 'Asparagus', icon: '🥬', defaultUnit: 'bunch', commonUnits: ['bunch', 'lbs'], categoryId: 'vegetables' },
      { id: 'corn', name: 'Corn', icon: '🌽', defaultUnit: 'ears', commonUnits: ['ears', 'bag', 'can'], categoryId: 'vegetables' },
      { id: 'peas', name: 'Peas', icon: '🫘', defaultUnit: 'bag', commonUnits: ['bag', 'cup', 'can'], categoryId: 'vegetables' },
      { id: 'brussels_sprouts', name: 'Brussels Sprouts', icon: '🥬', defaultUnit: 'lbs', commonUnits: ['lbs', 'container'], categoryId: 'vegetables' },

      // Meat & Seafood
      { id: 'chicken_breast', name: 'Chicken Breast', icon: '🍗', defaultUnit: 'lbs', commonUnits: ['lbs', 'pieces', 'kg'], categoryId: 'meat_seafood' },
      { id: 'chicken_thighs', name: 'Chicken Thighs', icon: '🍗', defaultUnit: 'lbs', commonUnits: ['lbs', 'pieces', 'kg'], categoryId: 'meat_seafood' },
      { id: 'ground_beef', name: 'Ground Beef', icon: '🥩', defaultUnit: 'lbs', commonUnits: ['lbs', 'kg'], categoryId: 'meat_seafood' },
      { id: 'beef_steak', name: 'Beef Steak', icon: '🥩', defaultUnit: 'lbs', commonUnits: ['lbs', 'pieces', 'kg'], categoryId: 'meat_seafood' },
      { id: 'pork_chops', name: 'Pork Chops', icon: '🥩', defaultUnit: 'lbs', commonUnits: ['lbs', 'pieces'], categoryId: 'meat_seafood' },
      { id: 'bacon', name: 'Bacon', icon: '🥓', defaultUnit: 'package', commonUnits: ['package', 'lbs'], categoryId: 'meat_seafood' },
      { id: 'salmon', name: 'Salmon', icon: '🐟', defaultUnit: 'lbs', commonUnits: ['lbs', 'fillets', 'kg'], categoryId: 'meat_seafood' },
      { id: 'shrimp', name: 'Shrimp', icon: '🦐', defaultUnit: 'lbs', commonUnits: ['lbs', 'bag', 'kg'], categoryId: 'meat_seafood' },
      { id: 'tuna', name: 'Tuna', icon: '🐟', defaultUnit: 'can', commonUnits: ['can', 'lbs', 'fillets'], categoryId: 'meat_seafood' },
      { id: 'turkey', name: 'Turkey', icon: '🦃', defaultUnit: 'lbs', commonUnits: ['lbs', 'pieces', 'package'], categoryId: 'meat_seafood' },

      // Dairy & Eggs
      { id: 'milk', name: 'Milk', icon: '🥛', defaultUnit: 'gallon', commonUnits: ['gallon', 'half-gallon', 'quart'], categoryId: 'dairy_eggs' },
      { id: 'eggs', name: 'Eggs', icon: '🥚', defaultUnit: 'dozen', commonUnits: ['dozen', 'pieces'], categoryId: 'dairy_eggs' },
      { id: 'butter', name: 'Butter', icon: '🧈', defaultUnit: 'package', commonUnits: ['package', 'sticks'], categoryId: 'dairy_eggs' },
      { id: 'cheese_cheddar', name: 'Cheddar Cheese', icon: '🧀', defaultUnit: 'package', commonUnits: ['package', 'lbs', 'slices'], categoryId: 'dairy_eggs' },
      { id: 'yogurt', name: 'Yogurt', icon: '🥛', defaultUnit: 'container', commonUnits: ['container', 'cup', 'package'], categoryId: 'dairy_eggs' },
      { id: 'cream_cheese', name: 'Cream Cheese', icon: '🧀', defaultUnit: 'package', commonUnits: ['package', 'oz'], categoryId: 'dairy_eggs' },
      { id: 'sour_cream', name: 'Sour Cream', icon: '🥛', defaultUnit: 'container', commonUnits: ['container', 'cup'], categoryId: 'dairy_eggs' },
      { id: 'heavy_cream', name: 'Heavy Cream', icon: '🥛', defaultUnit: 'pint', commonUnits: ['pint', 'quart', 'cup'], categoryId: 'dairy_eggs' },

      // Bakery & Bread
      { id: 'bread_white', name: 'White Bread', icon: '🍞', defaultUnit: 'loaf', commonUnits: ['loaf', 'slices'], categoryId: 'bakery' },
      { id: 'bread_wheat', name: 'Wheat Bread', icon: '🍞', defaultUnit: 'loaf', commonUnits: ['loaf', 'slices'], categoryId: 'bakery' },
      { id: 'bagels', name: 'Bagels', icon: '🥯', defaultUnit: 'package', commonUnits: ['package', 'pieces'], categoryId: 'bakery' },
      { id: 'croissants', name: 'Croissants', icon: '🥐', defaultUnit: 'package', commonUnits: ['package', 'pieces'], categoryId: 'bakery' },
      { id: 'muffins', name: 'Muffins', icon: '🧁', defaultUnit: 'package', commonUnits: ['package', 'pieces'], categoryId: 'bakery' },
      { id: 'tortillas', name: 'Tortillas', icon: '🫓', defaultUnit: 'package', commonUnits: ['package', 'pieces'], categoryId: 'bakery' },

      // Pantry Staples
      { id: 'rice', name: 'Rice', icon: '🍚', defaultUnit: 'bag', commonUnits: ['bag', 'lbs', 'cup'], categoryId: 'pantry_staples' },
      { id: 'pasta', name: 'Pasta', icon: '🍝', defaultUnit: 'box', commonUnits: ['box', 'bag', 'lbs'], categoryId: 'pantry_staples' },
      { id: 'flour', name: 'Flour', icon: '🌾', defaultUnit: 'bag', commonUnits: ['bag', 'lbs', 'cup'], categoryId: 'pantry_staples' },
      { id: 'sugar', name: 'Sugar', icon: '🍯', defaultUnit: 'bag', commonUnits: ['bag', 'lbs', 'cup'], categoryId: 'pantry_staples' },
      { id: 'olive_oil', name: 'Olive Oil', icon: '🫒', defaultUnit: 'bottle', commonUnits: ['bottle', 'cup', 'liter'], categoryId: 'pantry_staples' },
      { id: 'vegetable_oil', name: 'Vegetable Oil', icon: '🥒', defaultUnit: 'bottle', commonUnits: ['bottle', 'cup', 'liter'], categoryId: 'pantry_staples' },
      { id: 'vinegar', name: 'Vinegar', icon: '🍶', defaultUnit: 'bottle', commonUnits: ['bottle', 'cup'], categoryId: 'pantry_staples' },
      { id: 'salt', name: 'Salt', icon: '🧂', defaultUnit: 'container', commonUnits: ['container', 'box'], categoryId: 'pantry_staples' },
      { id: 'black_pepper', name: 'Black Pepper', icon: '🌶️', defaultUnit: 'container', commonUnits: ['container', 'oz'], categoryId: 'pantry_staples' },
      { id: 'canned_tomatoes', name: 'Canned Tomatoes', icon: '🥫', defaultUnit: 'can', commonUnits: ['can', 'package'], categoryId: 'pantry_staples' },
      { id: 'chicken_broth', name: 'Chicken Broth', icon: '🥫', defaultUnit: 'container', commonUnits: ['container', 'can', 'cup'], categoryId: 'pantry_staples' },
      { id: 'beans_black', name: 'Black Beans', icon: '🫘', defaultUnit: 'can', commonUnits: ['can', 'bag', 'cup'], categoryId: 'pantry_staples' },
      { id: 'beans_kidney', name: 'Kidney Beans', icon: '🫘', defaultUnit: 'can', commonUnits: ['can', 'bag', 'cup'], categoryId: 'pantry_staples' },

      // Snacks & Candy
      { id: 'chips_potato', name: 'Potato Chips', icon: '🍟', defaultUnit: 'bag', commonUnits: ['bag', 'oz'], categoryId: 'snacks' },
      { id: 'crackers', name: 'Crackers', icon: '🍘', defaultUnit: 'box', commonUnits: ['box', 'package'], categoryId: 'snacks' },
      { id: 'nuts_mixed', name: 'Mixed Nuts', icon: '🥜', defaultUnit: 'container', commonUnits: ['container', 'bag', 'lbs'], categoryId: 'snacks' },
      { id: 'popcorn', name: 'Popcorn', icon: '🍿', defaultUnit: 'box', commonUnits: ['box', 'bag'], categoryId: 'snacks' },
      { id: 'chocolate', name: 'Chocolate', icon: '🍫', defaultUnit: 'bar', commonUnits: ['bar', 'bag', 'pieces'], categoryId: 'snacks' },

      // Beverages
      { id: 'water_bottled', name: 'Bottled Water', icon: '💧', defaultUnit: 'case', commonUnits: ['case', 'bottles', 'gallon'], categoryId: 'beverages' },
      { id: 'coffee', name: 'Coffee', icon: '☕', defaultUnit: 'bag', commonUnits: ['bag', 'container', 'lbs'], categoryId: 'beverages' },
      { id: 'tea', name: 'Tea', icon: '🍵', defaultUnit: 'box', commonUnits: ['box', 'bags'], categoryId: 'beverages' },
      { id: 'juice_orange', name: 'Orange Juice', icon: '🧃', defaultUnit: 'container', commonUnits: ['container', 'gallon', 'cup'], categoryId: 'beverages' },
      { id: 'soda', name: 'Soda', icon: '🥤', defaultUnit: 'case', commonUnits: ['case', 'bottles', 'cans'], categoryId: 'beverages' },
      { id: 'wine', name: 'Wine', icon: '🍷', defaultUnit: 'bottle', commonUnits: ['bottle', 'case'], categoryId: 'beverages' },
      { id: 'beer', name: 'Beer', icon: '🍺', defaultUnit: 'case', commonUnits: ['case', 'bottles', 'cans'], categoryId: 'beverages' },

      // Frozen Foods
      { id: 'ice_cream', name: 'Ice Cream', icon: '🍦', defaultUnit: 'container', commonUnits: ['container', 'pint'], categoryId: 'frozen' },
      { id: 'frozen_vegetables', name: 'Frozen Vegetables', icon: '🥶', defaultUnit: 'bag', commonUnits: ['bag', 'cup'], categoryId: 'frozen' },
      { id: 'frozen_pizza', name: 'Frozen Pizza', icon: '🍕', defaultUnit: 'pieces', commonUnits: ['pieces', 'box'], categoryId: 'frozen' },
      { id: 'frozen_berries', name: 'Frozen Berries', icon: '🫐', defaultUnit: 'bag', commonUnits: ['bag', 'cup'], categoryId: 'frozen' },

      // Household Items
      { id: 'paper_towels', name: 'Paper Towels', icon: '🧻', defaultUnit: 'package', commonUnits: ['package', 'rolls'], categoryId: 'household' },
      { id: 'toilet_paper', name: 'Toilet Paper', icon: '🧻', defaultUnit: 'package', commonUnits: ['package', 'rolls'], categoryId: 'household' },
      { id: 'dish_soap', name: 'Dish Soap', icon: '🧽', defaultUnit: 'bottle', commonUnits: ['bottle', 'refill'], categoryId: 'household' },
      { id: 'laundry_detergent', name: 'Laundry Detergent', icon: '🧴', defaultUnit: 'container', commonUnits: ['container', 'bottle'], categoryId: 'household' },
      { id: 'trash_bags', name: 'Trash Bags', icon: '🗑️', defaultUnit: 'box', commonUnits: ['box', 'roll'], categoryId: 'household' },

      // Health & Beauty
      { id: 'toothpaste', name: 'Toothpaste', icon: '🦷', defaultUnit: 'tube', commonUnits: ['tube', 'package'], categoryId: 'health_beauty' },
      { id: 'shampoo', name: 'Shampoo', icon: '🧴', defaultUnit: 'bottle', commonUnits: ['bottle', 'container'], categoryId: 'health_beauty' },
      { id: 'soap_bar', name: 'Bar Soap', icon: '🧼', defaultUnit: 'bar', commonUnits: ['bar', 'package'], categoryId: 'health_beauty' },
      { id: 'vitamins', name: 'Vitamins', icon: '💊', defaultUnit: 'bottle', commonUnits: ['bottle', 'package'], categoryId: 'health_beauty' },

      // Baby & Kids
      { id: 'diapers', name: 'Diapers', icon: '🍼', defaultUnit: 'package', commonUnits: ['package', 'pieces'], categoryId: 'baby_kids' },
      { id: 'baby_food', name: 'Baby Food', icon: '🍼', defaultUnit: 'jar', commonUnits: ['jar', 'package'], categoryId: 'baby_kids' },
      { id: 'formula', name: 'Baby Formula', icon: '🍼', defaultUnit: 'container', commonUnits: ['container', 'can'], categoryId: 'baby_kids' },

      // Pet Supplies
      { id: 'dog_food', name: 'Dog Food', icon: '🐕', defaultUnit: 'bag', commonUnits: ['bag', 'can', 'lbs'], categoryId: 'pet_supplies' },
      { id: 'cat_food', name: 'Cat Food', icon: '🐱', defaultUnit: 'bag', commonUnits: ['bag', 'can', 'lbs'], categoryId: 'pet_supplies' },
      { id: 'cat_litter', name: 'Cat Litter', icon: '🐱', defaultUnit: 'bag', commonUnits: ['bag', 'container', 'lbs'], categoryId: 'pet_supplies' },

      // Herbs & Spices
      { id: 'basil', name: 'Basil', icon: '🌿', defaultUnit: 'container', commonUnits: ['container', 'bunch', 'oz'], categoryId: 'herbs_spices' },
      { id: 'oregano', name: 'Oregano', icon: '🌿', defaultUnit: 'container', commonUnits: ['container', 'oz'], categoryId: 'herbs_spices' },
      { id: 'thyme', name: 'Thyme', icon: '🌿', defaultUnit: 'container', commonUnits: ['container', 'bunch', 'oz'], categoryId: 'herbs_spices' },
      { id: 'rosemary', name: 'Rosemary', icon: '🌿', defaultUnit: 'container', commonUnits: ['container', 'bunch', 'oz'], categoryId: 'herbs_spices' },
      { id: 'cumin', name: 'Cumin', icon: '🌶️', defaultUnit: 'container', commonUnits: ['container', 'oz'], categoryId: 'herbs_spices' },
      { id: 'paprika', name: 'Paprika', icon: '🌶️', defaultUnit: 'container', commonUnits: ['container', 'oz'], categoryId: 'herbs_spices' },

      // International Foods
      { id: 'soy_sauce', name: 'Soy Sauce', icon: '🍶', defaultUnit: 'bottle', commonUnits: ['bottle', 'cup'], categoryId: 'international' },
      { id: 'coconut_milk', name: 'Coconut Milk', icon: '🥥', defaultUnit: 'can', commonUnits: ['can', 'container'], categoryId: 'international' },
      { id: 'curry_powder', name: 'Curry Powder', icon: '🌶️', defaultUnit: 'container', commonUnits: ['container', 'oz'], categoryId: 'international' },
      { id: 'garam_masala', name: 'Garam Masala', icon: '🌶️', defaultUnit: 'container', commonUnits: ['container', 'oz'], categoryId: 'international' },
      { id: 'sesame_oil', name: 'Sesame Oil', icon: '🫒', defaultUnit: 'bottle', commonUnits: ['bottle', 'cup'], categoryId: 'international' },
    ];

    // Store categories
    categoriesData.forEach(category => {
      this.categories.set(category.id, category);
      this.categoryIndex.set(category.id, new Set());
    });

    // Process and store items
    itemsData.forEach(itemData => {
      const item: GroceryItem = {
        ...itemData,
        category: itemData.categoryId,
      };

      this.items.set(item.id, item);
      
      // Add to category index
      const categoryItems = this.categoryIndex.get(item.category);
      if (categoryItems) {
        categoryItems.add(item.id);
      }

      // Build search index
      this.indexItemForSearch(item);
    });

    // Update categories with their items
    this.categories.forEach((category, categoryId) => {
      const itemIds = this.categoryIndex.get(categoryId) || new Set();
      category.items = Array.from(itemIds).map(id => this.items.get(id)!);
    });

    this.isInitialized = true;
  }

  private indexItemForSearch(item: GroceryItem) {
    // Split item name into searchable words
    const words = item.name.toLowerCase()
      .split(/[\s\-_&,]+/)
      .filter(word => word.length > 1);

    words.forEach(word => {
      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, new Set());
      }
      this.searchIndex.get(word)!.add(item.id);
    });

    // Also index the full name
    const fullName = item.name.toLowerCase().replace(/[\s\-_&,]+/g, '');
    if (!this.searchIndex.has(fullName)) {
      this.searchIndex.set(fullName, new Set());
    }
    this.searchIndex.get(fullName)!.add(item.id);
  }

  // Performance-optimized search
  async searchItems(query: string, categoryId?: string): Promise<GroceryItem[]> {
    if (!query.trim()) {
      return categoryId ? this.getItemsByCategory(categoryId) : [];
    }

    const searchTerms = query.toLowerCase()
      .split(/[\s\-_&,]+/)
      .filter(term => term.length > 0);

    if (searchTerms.length === 0) {
      return [];
    }

    // Find items that match any search term
    const matchingItemIds = new Set<string>();

    searchTerms.forEach(term => {
      // Exact word matches
      if (this.searchIndex.has(term)) {
        this.searchIndex.get(term)!.forEach(id => matchingItemIds.add(id));
      }

      // Partial matches (starts with)
      this.searchIndex.forEach((itemIds, indexedWord) => {
        if (indexedWord.startsWith(term)) {
          itemIds.forEach(id => matchingItemIds.add(id));
        }
      });
    });

    // Convert to items and filter by category if specified
    let results = Array.from(matchingItemIds)
      .map(id => this.items.get(id)!)
      .filter(item => item !== undefined);

    if (categoryId) {
      results = results.filter(item => item.category === categoryId);
    }

    // Sort by relevance (exact matches first, then partial matches)
    const queryLower = query.toLowerCase();
    results.sort((a, b) => {
      const aExact = a.name.toLowerCase().includes(queryLower) ? 1 : 0;
      const bExact = b.name.toLowerCase().includes(queryLower) ? 1 : 0;
      
      if (aExact !== bExact) {
        return bExact - aExact; // Exact matches first
      }
      
      return a.name.localeCompare(b.name); // Alphabetical for ties
    });

    return results;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getItemsByCategory(categoryId: string): Promise<GroceryItem[]> {
    const category = this.categories.get(categoryId);
    return category ? [...category.items] : [];
  }

  async getItemById(itemId: string): Promise<GroceryItem | null> {
    return this.items.get(itemId) || null;
  }

  async getAllItems(): Promise<GroceryItem[]> {
    return Array.from(this.items.values());
  }

  // Get popular/common items for quick access
  async getPopularItems(limit: number = 20): Promise<GroceryItem[]> {
    // Return most commonly used items
    const popularIds = [
      'milk', 'eggs', 'bread_white', 'bananas', 'apples',
      'chicken_breast', 'ground_beef', 'tomatoes', 'onions', 'potatoes',
      'cheese_cheddar', 'butter', 'yogurt', 'carrots', 'broccoli',
      'rice', 'pasta', 'olive_oil', 'salt', 'black_pepper'
    ];

    return popularIds
      .map(id => this.items.get(id))
      .filter(item => item !== undefined)
      .slice(0, limit) as GroceryItem[];
  }

  // Get items by multiple categories
  async getItemsByCategories(categoryIds: string[]): Promise<Map<string, GroceryItem[]>> {
    const result = new Map<string, GroceryItem[]>();
    
    categoryIds.forEach(categoryId => {
      const items = this.getItemsByCategory(categoryId);
      result.set(categoryId, items);
    });

    return result;
  }

  // Get category statistics
  async getCategoryStats(): Promise<Map<string, number>> {
    const stats = new Map<string, number>();
    
    this.categories.forEach((category, categoryId) => {
      stats.set(categoryId, category.items.length);
    });

    return stats;
  }
}

// Singleton instance for performance
const groceryDB = new GroceryItemsDatabase();

// Service interface
export const GroceryItemsService = {
  // Core search and retrieval
  searchItems: (query: string, categoryId?: string) => groceryDB.searchItems(query, categoryId),
  getCategories: () => groceryDB.getCategories(),
  getItemsByCategory: (categoryId: string) => groceryDB.getItemsByCategory(categoryId),
  getItemById: (itemId: string) => groceryDB.getItemById(itemId),
  getAllItems: () => groceryDB.getAllItems(),

  // Convenience methods
  getPopularItems: (limit?: number) => groceryDB.getPopularItems(limit),
  getItemsByCategories: (categoryIds: string[]) => groceryDB.getItemsByCategories(categoryIds),
  getCategoryStats: () => groceryDB.getCategoryStats(),
};

export default GroceryItemsService;
