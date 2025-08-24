/**
 * Grocery Items Service
 * Provides grocery item data, categories, and search functionality
 */

export interface GroceryItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  defaultUnit: string;
  commonUnits: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  items: GroceryItem[];
}

class GroceryItemsService {
  private categories: Category[] = [
    {
      id: 'fruits',
      name: 'Fruits & Vegetables',
      icon: '🍎',
      items: [
        // Fruits
        {
          id: 'apple',
          name: 'Apple',
          icon: '🍎',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg', 'bag'],
        },
        {
          id: 'banana',
          name: 'Banana',
          icon: '🍌',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'bunch', 'lbs', 'kg'],
        },
        {
          id: 'orange',
          name: 'Orange',
          icon: '🍊',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg', 'bag'],
        },
        {
          id: 'mango',
          name: 'Mango',
          icon: '🥭',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg'],
        },
        {
          id: 'grapes',
          name: 'Grapes',
          icon: '🍇',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'container'],
        },
        {
          id: 'strawberry',
          name: 'Strawberry',
          icon: '🍓',
          category: 'fruits',
          defaultUnit: 'container',
          commonUnits: ['container', 'lbs', 'kg', 'pint'],
        },
        {
          id: 'pineapple',
          name: 'Pineapple',
          icon: '🍍',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg'],
        },
        {
          id: 'watermelon',
          name: 'Watermelon',
          icon: '🍉',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg'],
        },
        {
          id: 'peach',
          name: 'Peach',
          icon: '🍑',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces', 'bag'],
        },
        {
          id: 'pear',
          name: 'Pear',
          icon: '🍐',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces', 'bag'],
        },
        {
          id: 'kiwi',
          name: 'Kiwi',
          icon: '🥝',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'container'],
        },
        {
          id: 'lemon',
          name: 'Lemon',
          icon: '🍋',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'bag'],
        },
        {
          id: 'lime',
          name: 'Lime',
          icon: '🟢',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'bag'],
        },
        {
          id: 'pomegranate',
          name: 'Pomegranate',
          icon: '🍎',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs'],
        },
        {
          id: 'dates',
          name: 'Dates',
          icon: '🌴',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'container', 'box'],
        },
        {
          id: 'figs',
          name: 'Figs',
          icon: '🍇',
          category: 'fruits',
          defaultUnit: 'container',
          commonUnits: ['container', 'lbs', 'pieces'],
        },

        // Vegetables
        {
          id: 'carrot',
          name: 'Carrot',
          icon: '🥕',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces', 'bag'],
        },
        {
          id: 'broccoli',
          name: 'Broccoli',
          icon: '🥦',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg', 'bag'],
        },
        {
          id: 'lettuce',
          name: 'Lettuce',
          icon: '🥬',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'bag', 'lbs'],
        },
        {
          id: 'tomato',
          name: 'Tomato',
          icon: '🍅',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces', 'container'],
        },
        {
          id: 'potato',
          name: 'Potato',
          icon: '🥔',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'pieces'],
        },
        {
          id: 'onion',
          name: 'Onion',
          icon: '🧅',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'pieces'],
        },
        {
          id: 'garlic',
          name: 'Garlic',
          icon: '🧄',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'bulb'],
        },
        {
          id: 'cucumber',
          name: 'Cucumber',
          icon: '🥒',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg'],
        },
        {
          id: 'bell_pepper',
          name: 'Bell Pepper',
          icon: '🫑',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg'],
        },
        {
          id: 'spinach',
          name: 'Spinach',
          icon: '🥬',
          category: 'fruits',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'lbs', 'container'],
        },
        {
          id: 'cabbage',
          name: 'Cabbage',
          icon: '🥬',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg'],
        },
        {
          id: 'cauliflower',
          name: 'Cauliflower',
          icon: '🥦',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg'],
        },
        {
          id: 'zucchini',
          name: 'Zucchini',
          icon: '🥒',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg'],
        },
        {
          id: 'eggplant',
          name: 'Eggplant',
          icon: '🍆',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg'],
        },
        {
          id: 'sweet_potato',
          name: 'Sweet Potato',
          icon: '🍠',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'corn',
          name: 'Corn',
          icon: '🌽',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'bag', 'dozen'],
        },
        {
          id: 'green_beans',
          name: 'Green Beans',
          icon: '🫘',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag'],
        },
        {
          id: 'peas',
          name: 'Peas',
          icon: '🟢',
          category: 'fruits',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'lbs', 'container'],
        },
        {
          id: 'mushroom',
          name: 'Mushroom',
          icon: '🍄',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'container', 'pieces'],
        },
        {
          id: 'celery',
          name: 'Celery',
          icon: '🥬',
          category: 'fruits',
          defaultUnit: 'bunch',
          commonUnits: ['bunch', 'pieces', 'lbs'],
        },
        {
          id: 'radish',
          name: 'Radish',
          icon: '🔴',
          category: 'fruits',
          defaultUnit: 'bunch',
          commonUnits: ['bunch', 'lbs', 'pieces'],
        },
        {
          id: 'beets',
          name: 'Beets',
          icon: '🔴',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bunch', 'pieces'],
        },
        {
          id: 'turnip',
          name: 'Turnip',
          icon: '🟡',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'parsley',
          name: 'Parsley',
          icon: '🌿',
          category: 'fruits',
          defaultUnit: 'bunch',
          commonUnits: ['bunch', 'container', 'pieces'],
        },
        {
          id: 'cilantro',
          name: 'Cilantro',
          icon: '🌿',
          category: 'fruits',
          defaultUnit: 'bunch',
          commonUnits: ['bunch', 'container', 'pieces'],
        },
        {
          id: 'mint',
          name: 'Mint',
          icon: '🌿',
          category: 'fruits',
          defaultUnit: 'bunch',
          commonUnits: ['bunch', 'container', 'pieces'],
        },
        {
          id: 'basil',
          name: 'Basil',
          icon: '🌿',
          category: 'fruits',
          defaultUnit: 'container',
          commonUnits: ['container', 'bunch', 'pieces'],
        },
        {
          id: 'ginger',
          name: 'Ginger',
          icon: '🫚',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'pieces', 'oz'],
        },
        {
          id: 'okra',
          name: 'Okra',
          icon: '🫛',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag'],
        },
        {
          id: 'artichoke',
          name: 'Artichoke',
          icon: '🥬',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs'],
        },
        {
          id: 'asparagus',
          name: 'Asparagus',
          icon: '🥬',
          category: 'fruits',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bunch'],
        },
        {
          id: 'leek',
          name: 'Leek',
          icon: '🥬',
          category: 'fruits',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'bunch'],
        },
      ],
    },
    {
      id: 'dairy',
      name: 'Dairy & Eggs',
      icon: '🥛',
      items: [
        // Milk Products
        {
          id: 'whole_milk',
          name: 'Whole Milk',
          icon: '🥛',
          category: 'dairy',
          defaultUnit: 'gallon',
          commonUnits: ['gallon', 'half-gallon', 'quart', 'liter'],
        },
        {
          id: 'low_fat_milk',
          name: '2% Milk',
          icon: '🥛',
          category: 'dairy',
          defaultUnit: 'gallon',
          commonUnits: ['gallon', 'half-gallon', 'quart', 'liter'],
        },
        {
          id: 'skim_milk',
          name: 'Skim Milk',
          icon: '🥛',
          category: 'dairy',
          defaultUnit: 'gallon',
          commonUnits: ['gallon', 'half-gallon', 'quart', 'liter'],
        },
        {
          id: 'almond_milk',
          name: 'Almond Milk',
          icon: '🥛',
          category: 'dairy',
          defaultUnit: 'carton',
          commonUnits: ['carton', 'liter', 'quart'],
        },
        {
          id: 'oat_milk',
          name: 'Oat Milk',
          icon: '🥛',
          category: 'dairy',
          defaultUnit: 'carton',
          commonUnits: ['carton', 'liter', 'quart'],
        },
        {
          id: 'coconut_milk',
          name: 'Coconut Milk',
          icon: '🥥',
          category: 'dairy',
          defaultUnit: 'can',
          commonUnits: ['can', 'carton', 'liter'],
        },
        {
          id: 'heavy_cream',
          name: 'Heavy Cream',
          icon: '🥛',
          category: 'dairy',
          defaultUnit: 'pint',
          commonUnits: ['pint', 'quart', 'container'],
        },
        {
          id: 'half_and_half',
          name: 'Half & Half',
          icon: '🥛',
          category: 'dairy',
          defaultUnit: 'pint',
          commonUnits: ['pint', 'quart', 'container'],
        },

        // Eggs
        {
          id: 'large_eggs',
          name: 'Large Eggs',
          icon: '🥚',
          category: 'dairy',
          defaultUnit: 'dozen',
          commonUnits: ['dozen', '18-count', '24-count'],
        },
        {
          id: 'organic_eggs',
          name: 'Organic Eggs',
          icon: '🥚',
          category: 'dairy',
          defaultUnit: 'dozen',
          commonUnits: ['dozen', '18-count'],
        },
        {
          id: 'free_range_eggs',
          name: 'Free Range Eggs',
          icon: '🥚',
          category: 'dairy',
          defaultUnit: 'dozen',
          commonUnits: ['dozen', '18-count'],
        },

        // Cheese (Halal Certified)
        {
          id: 'cheddar_cheese',
          name: 'Cheddar Cheese',
          icon: '🧀',
          category: 'dairy',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'oz', 'block', 'slices'],
        },
        {
          id: 'mozzarella_cheese',
          name: 'Mozzarella Cheese',
          icon: '🧀',
          category: 'dairy',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'oz', 'block', 'shredded'],
        },
        {
          id: 'swiss_cheese',
          name: 'Swiss Cheese',
          icon: '🧀',
          category: 'dairy',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'oz', 'slices'],
        },
        {
          id: 'cream_cheese',
          name: 'Cream Cheese',
          icon: '🧀',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'block'],
        },
        {
          id: 'cottage_cheese',
          name: 'Cottage Cheese',
          icon: '🧀',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'lbs', 'oz'],
        },
        {
          id: 'ricotta_cheese',
          name: 'Ricotta Cheese',
          icon: '🧀',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'lbs', 'oz'],
        },
        {
          id: 'parmesan_cheese',
          name: 'Parmesan Cheese',
          icon: '🧀',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'grated'],
        },
        {
          id: 'feta_cheese',
          name: 'Feta Cheese',
          icon: '🧀',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'crumbled'],
        },

        // Butter & Spreads
        {
          id: 'unsalted_butter',
          name: 'Unsalted Butter',
          icon: '🧈',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'sticks', 'lbs'],
        },
        {
          id: 'salted_butter',
          name: 'Salted Butter',
          icon: '🧈',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'sticks', 'lbs'],
        },
        {
          id: 'ghee',
          name: 'Ghee (Clarified Butter)',
          icon: '🧈',
          category: 'dairy',
          defaultUnit: 'jar',
          commonUnits: ['jar', 'container', 'oz'],
        },

        // Yogurt
        {
          id: 'plain_yogurt',
          name: 'Plain Yogurt',
          icon: '🍶',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'cups', 'oz'],
        },
        {
          id: 'greek_yogurt',
          name: 'Greek Yogurt',
          icon: '🍶',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'cups', 'oz'],
        },
        {
          id: 'vanilla_yogurt',
          name: 'Vanilla Yogurt',
          icon: '🍶',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'cups', 'oz'],
        },
        {
          id: 'strawberry_yogurt',
          name: 'Strawberry Yogurt',
          icon: '🍓',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'cups', 'oz'],
        },
        {
          id: 'yogurt_drink',
          name: 'Yogurt Drink (Lassi)',
          icon: '🥤',
          category: 'dairy',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'container', 'oz'],
        },

        // Other Dairy
        {
          id: 'sour_cream',
          name: 'Sour Cream',
          icon: '🍶',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'cups'],
        },
        {
          id: 'whipped_cream',
          name: 'Whipped Cream',
          icon: '🍶',
          category: 'dairy',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'can'],
        },
        {
          id: 'buttermilk',
          name: 'Buttermilk',
          icon: '🥛',
          category: 'dairy',
          defaultUnit: 'quart',
          commonUnits: ['quart', 'pint', 'container'],
        },
      ],
    },
    {
      id: 'meat',
      name: 'Halal Meat & Seafood',
      icon: '🥩',
      items: [
        // Halal Chicken
        {
          id: 'halal_chicken_breast',
          name: 'Halal Chicken Breast',
          icon: '🐔',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'halal_chicken_thighs',
          name: 'Halal Chicken Thighs',
          icon: '🐔',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'halal_whole_chicken',
          name: 'Halal Whole Chicken',
          icon: '🐔',
          category: 'meat',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'lbs', 'kg'],
        },
        {
          id: 'halal_chicken_wings',
          name: 'Halal Chicken Wings',
          icon: '🐔',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'halal_chicken_drumsticks',
          name: 'Halal Chicken Drumsticks',
          icon: '🐔',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'halal_ground_chicken',
          name: 'Halal Ground Chicken',
          icon: '🐔',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'container'],
        },

        // Halal Beef
        {
          id: 'halal_ground_beef',
          name: 'Halal Ground Beef',
          icon: '🥩',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'container'],
        },
        {
          id: 'halal_beef_steak',
          name: 'Halal Beef Steak',
          icon: '🥩',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'halal_beef_roast',
          name: 'Halal Beef Roast',
          icon: '🥩',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'halal_beef_ribs',
          name: 'Halal Beef Ribs',
          icon: '🥩',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'rack'],
        },
        {
          id: 'halal_beef_brisket',
          name: 'Halal Beef Brisket',
          icon: '🥩',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },

        // Halal Lamb/Mutton
        {
          id: 'halal_lamb_chops',
          name: 'Halal Lamb Chops',
          icon: '🐑',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'halal_ground_lamb',
          name: 'Halal Ground Lamb',
          icon: '🐑',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'container'],
        },
        {
          id: 'halal_leg_of_lamb',
          name: 'Halal Leg of Lamb',
          icon: '🐑',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'halal_mutton',
          name: 'Halal Mutton',
          icon: '🐑',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },

        // Halal Goat
        {
          id: 'halal_goat_meat',
          name: 'Halal Goat Meat',
          icon: '🐐',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'halal_goat_chops',
          name: 'Halal Goat Chops',
          icon: '🐐',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },

        // Seafood (Halal - Fish with scales)
        {
          id: 'salmon_fillet',
          name: 'Salmon Fillet',
          icon: '🐟',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces', 'fillet'],
        },
        {
          id: 'tilapia',
          name: 'Tilapia',
          icon: '🐟',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces', 'fillet'],
        },
        {
          id: 'cod',
          name: 'Cod',
          icon: '🐟',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces', 'fillet'],
        },
        {
          id: 'tuna',
          name: 'Tuna',
          icon: '🐟',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces', 'can'],
        },
        {
          id: 'mackerel',
          name: 'Mackerel',
          icon: '🐟',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'sardines',
          name: 'Sardines',
          icon: '🐟',
          category: 'meat',
          defaultUnit: 'can',
          commonUnits: ['can', 'lbs', 'container'],
        },
        {
          id: 'trout',
          name: 'Trout',
          icon: '🐟',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'sea_bass',
          name: 'Sea Bass',
          icon: '🐟',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },
        {
          id: 'halibut',
          name: 'Halibut',
          icon: '🐟',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces', 'fillet'],
        },
        {
          id: 'snapper',
          name: 'Red Snapper',
          icon: '🐟',
          category: 'meat',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'pieces'],
        },

        // Canned Fish
        {
          id: 'canned_tuna',
          name: 'Canned Tuna',
          icon: '🥫',
          category: 'meat',
          defaultUnit: 'can',
          commonUnits: ['can', 'pack', 'container'],
        },
        {
          id: 'canned_salmon',
          name: 'Canned Salmon',
          icon: '🥫',
          category: 'meat',
          defaultUnit: 'can',
          commonUnits: ['can', 'pack', 'container'],
        },
        {
          id: 'canned_sardines',
          name: 'Canned Sardines',
          icon: '🥫',
          category: 'meat',
          defaultUnit: 'can',
          commonUnits: ['can', 'pack', 'container'],
        },
      ],
    },
    {
      id: 'pantry',
      name: 'Pantry Staples',
      icon: '🏺',
      items: [
        // Rice & Grains
        {
          id: 'basmati_rice',
          name: 'Basmati Rice',
          icon: '🍚',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'jasmine_rice',
          name: 'Jasmine Rice',
          icon: '🍚',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'brown_rice',
          name: 'Brown Rice',
          icon: '🍚',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'white_rice',
          name: 'White Rice',
          icon: '🍚',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'quinoa',
          name: 'Quinoa',
          icon: '🌾',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'bulgur',
          name: 'Bulgur Wheat',
          icon: '🌾',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'couscous',
          name: 'Couscous',
          icon: '🌾',
          category: 'pantry',
          defaultUnit: 'box',
          commonUnits: ['box', 'lbs', 'bag'],
        },
        {
          id: 'barley',
          name: 'Barley',
          icon: '🌾',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'oats',
          name: 'Oats',
          icon: '🌾',
          category: 'pantry',
          defaultUnit: 'container',
          commonUnits: ['container', 'lbs', 'bag'],
        },

        // Pasta & Noodles
        {
          id: 'spaghetti',
          name: 'Spaghetti',
          icon: '🍝',
          category: 'pantry',
          defaultUnit: 'box',
          commonUnits: ['box', 'lbs', 'bag'],
        },
        {
          id: 'penne_pasta',
          name: 'Penne Pasta',
          icon: '🍝',
          category: 'pantry',
          defaultUnit: 'box',
          commonUnits: ['box', 'lbs', 'bag'],
        },
        {
          id: 'macaroni',
          name: 'Macaroni',
          icon: '🍝',
          category: 'pantry',
          defaultUnit: 'box',
          commonUnits: ['box', 'lbs', 'bag'],
        },
        {
          id: 'lasagna_sheets',
          name: 'Lasagna Sheets',
          icon: '🍝',
          category: 'pantry',
          defaultUnit: 'box',
          commonUnits: ['box', 'lbs'],
        },
        {
          id: 'rice_noodles',
          name: 'Rice Noodles',
          icon: '🍜',
          category: 'pantry',
          defaultUnit: 'package',
          commonUnits: ['package', 'lbs', 'bag'],
        },

        // Flour & Baking
        {
          id: 'all_purpose_flour',
          name: 'All-Purpose Flour',
          icon: '🌾',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'whole_wheat_flour',
          name: 'Whole Wheat Flour',
          icon: '🌾',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'bread_flour',
          name: 'Bread Flour',
          icon: '🌾',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'cake_flour',
          name: 'Cake Flour',
          icon: '🌾',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'baking_powder',
          name: 'Baking Powder',
          icon: '🥄',
          category: 'pantry',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'tsp'],
        },
        {
          id: 'baking_soda',
          name: 'Baking Soda',
          icon: '🥄',
          category: 'pantry',
          defaultUnit: 'box',
          commonUnits: ['box', 'container', 'oz'],
        },
        {
          id: 'yeast',
          name: 'Active Dry Yeast',
          icon: '🍞',
          category: 'pantry',
          defaultUnit: 'package',
          commonUnits: ['package', 'jar', 'oz'],
        },

        // Sugar & Sweeteners
        {
          id: 'white_sugar',
          name: 'White Sugar',
          icon: '🍯',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'brown_sugar',
          name: 'Brown Sugar',
          icon: '🍯',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'powdered_sugar',
          name: 'Powdered Sugar',
          icon: '🍯',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'honey',
          name: 'Honey',
          icon: '🍯',
          category: 'pantry',
          defaultUnit: 'jar',
          commonUnits: ['jar', 'bottle', 'oz', 'cup'],
        },
        {
          id: 'maple_syrup',
          name: 'Maple Syrup',
          icon: '🍁',
          category: 'pantry',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'cup'],
        },

        // Oils & Vinegars
        {
          id: 'olive_oil',
          name: 'Olive Oil',
          icon: '🫒',
          category: 'pantry',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'liter', 'gallon', 'cup'],
        },
        {
          id: 'vegetable_oil',
          name: 'Vegetable Oil',
          icon: '🫒',
          category: 'pantry',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'liter', 'gallon', 'cup'],
        },
        {
          id: 'coconut_oil',
          name: 'Coconut Oil',
          icon: '🥥',
          category: 'pantry',
          defaultUnit: 'jar',
          commonUnits: ['jar', 'container', 'oz', 'cup'],
        },
        {
          id: 'sesame_oil',
          name: 'Sesame Oil',
          icon: '🫒',
          category: 'pantry',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'cup'],
        },
        {
          id: 'white_vinegar',
          name: 'White Vinegar',
          icon: '🍶',
          category: 'pantry',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'gallon', 'cup'],
        },
        {
          id: 'apple_cider_vinegar',
          name: 'Apple Cider Vinegar',
          icon: '🍎',
          category: 'pantry',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'cup'],
        },
        {
          id: 'balsamic_vinegar',
          name: 'Balsamic Vinegar',
          icon: '🍶',
          category: 'pantry',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'cup'],
        },

        // Bread & Bakery
        {
          id: 'white_bread',
          name: 'White Bread',
          icon: '🍞',
          category: 'pantry',
          defaultUnit: 'loaf',
          commonUnits: ['loaf', 'pieces', 'bag'],
        },
        {
          id: 'whole_wheat_bread',
          name: 'Whole Wheat Bread',
          icon: '🍞',
          category: 'pantry',
          defaultUnit: 'loaf',
          commonUnits: ['loaf', 'pieces', 'bag'],
        },
        {
          id: 'pita_bread',
          name: 'Pita Bread',
          icon: '🫓',
          category: 'pantry',
          defaultUnit: 'package',
          commonUnits: ['package', 'pieces', 'bag'],
        },
        {
          id: 'naan_bread',
          name: 'Naan Bread',
          icon: '🫓',
          category: 'pantry',
          defaultUnit: 'package',
          commonUnits: ['package', 'pieces'],
        },
        {
          id: 'tortillas',
          name: 'Tortillas',
          icon: '🌯',
          category: 'pantry',
          defaultUnit: 'package',
          commonUnits: ['package', 'pieces'],
        },
        {
          id: 'bagels',
          name: 'Bagels',
          icon: '🥯',
          category: 'pantry',
          defaultUnit: 'package',
          commonUnits: ['package', 'pieces', 'dozen'],
        },

        // Canned Goods
        {
          id: 'canned_tomatoes',
          name: 'Canned Tomatoes',
          icon: '🥫',
          category: 'pantry',
          defaultUnit: 'can',
          commonUnits: ['can', 'pack', 'case'],
        },
        {
          id: 'tomato_paste',
          name: 'Tomato Paste',
          icon: '🥫',
          category: 'pantry',
          defaultUnit: 'can',
          commonUnits: ['can', 'tube', 'jar'],
        },
        {
          id: 'tomato_sauce',
          name: 'Tomato Sauce',
          icon: '🥫',
          category: 'pantry',
          defaultUnit: 'can',
          commonUnits: ['can', 'jar', 'bottle'],
        },
        {
          id: 'coconut_milk_canned',
          name: 'Canned Coconut Milk',
          icon: '🥫',
          category: 'pantry',
          defaultUnit: 'can',
          commonUnits: ['can', 'pack'],
        },
        {
          id: 'chicken_broth',
          name: 'Chicken Broth',
          icon: '🥫',
          category: 'pantry',
          defaultUnit: 'carton',
          commonUnits: ['carton', 'can', 'container'],
        },
        {
          id: 'vegetable_broth',
          name: 'Vegetable Broth',
          icon: '🥫',
          category: 'pantry',
          defaultUnit: 'carton',
          commonUnits: ['carton', 'can', 'container'],
        },

        // Beans & Legumes
        {
          id: 'black_beans',
          name: 'Black Beans',
          icon: '🫘',
          category: 'pantry',
          defaultUnit: 'can',
          commonUnits: ['can', 'lbs', 'bag'],
        },
        {
          id: 'kidney_beans',
          name: 'Kidney Beans',
          icon: '🫘',
          category: 'pantry',
          defaultUnit: 'can',
          commonUnits: ['can', 'lbs', 'bag'],
        },
        {
          id: 'chickpeas',
          name: 'Chickpeas',
          icon: '🫘',
          category: 'pantry',
          defaultUnit: 'can',
          commonUnits: ['can', 'lbs', 'bag'],
        },
        {
          id: 'lentils',
          name: 'Lentils',
          icon: '🫘',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
        {
          id: 'split_peas',
          name: 'Split Peas',
          icon: '🫘',
          category: 'pantry',
          defaultUnit: 'lbs',
          commonUnits: ['lbs', 'kg', 'bag', 'cup'],
        },
      ],
    },
    {
      id: 'beverages',
      name: 'Beverages',
      icon: '🥤',
      items: [
        // Water
        {
          id: 'bottled_water',
          name: 'Bottled Water',
          icon: '💧',
          category: 'beverages',
          defaultUnit: 'case',
          commonUnits: ['case', 'bottle', 'gallon', 'liter'],
        },
        {
          id: 'sparkling_water',
          name: 'Sparkling Water',
          icon: '💧',
          category: 'beverages',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'can', 'liter', 'case'],
        },
        {
          id: 'coconut_water',
          name: 'Coconut Water',
          icon: '🥥',
          category: 'beverages',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'can', 'carton'],
        },

        // Coffee & Tea
        {
          id: 'ground_coffee',
          name: 'Ground Coffee',
          icon: '☕',
          category: 'beverages',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'lbs', 'container', 'can'],
        },
        {
          id: 'coffee_beans',
          name: 'Coffee Beans',
          icon: '☕',
          category: 'beverages',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'lbs', 'container'],
        },
        {
          id: 'instant_coffee',
          name: 'Instant Coffee',
          icon: '☕',
          category: 'beverages',
          defaultUnit: 'jar',
          commonUnits: ['jar', 'container', 'oz'],
        },
        {
          id: 'black_tea',
          name: 'Black Tea',
          icon: '🍵',
          category: 'beverages',
          defaultUnit: 'box',
          commonUnits: ['box', 'bag', 'container'],
        },
        {
          id: 'green_tea',
          name: 'Green Tea',
          icon: '🍵',
          category: 'beverages',
          defaultUnit: 'box',
          commonUnits: ['box', 'bag', 'container'],
        },
        {
          id: 'herbal_tea',
          name: 'Herbal Tea',
          icon: '🍵',
          category: 'beverages',
          defaultUnit: 'box',
          commonUnits: ['box', 'bag', 'container'],
        },
        {
          id: 'chai_tea',
          name: 'Chai Tea',
          icon: '🍵',
          category: 'beverages',
          defaultUnit: 'box',
          commonUnits: ['box', 'bag', 'container'],
        },

        // Juices
        {
          id: 'orange_juice',
          name: 'Orange Juice',
          icon: '🍊',
          category: 'beverages',
          defaultUnit: 'carton',
          commonUnits: ['carton', 'bottle', 'gallon', 'liter'],
        },
        {
          id: 'apple_juice',
          name: 'Apple Juice',
          icon: '🍎',
          category: 'beverages',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'carton', 'gallon', 'liter'],
        },
        {
          id: 'grape_juice',
          name: 'Grape Juice',
          icon: '🍇',
          category: 'beverages',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'carton', 'liter'],
        },
        {
          id: 'cranberry_juice',
          name: 'Cranberry Juice',
          icon: '🫐',
          category: 'beverages',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'carton', 'liter'],
        },
        {
          id: 'pomegranate_juice',
          name: 'Pomegranate Juice',
          icon: '🍎',
          category: 'beverages',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'carton', 'liter'],
        },
        {
          id: 'mango_juice',
          name: 'Mango Juice',
          icon: '🥭',
          category: 'beverages',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'carton', 'liter'],
        },

        // Soft Drinks (Halal)
        {
          id: 'cola',
          name: 'Cola (Halal)',
          icon: '🥤',
          category: 'beverages',
          defaultUnit: 'can',
          commonUnits: ['can', 'bottle', 'case', 'liter'],
        },
        {
          id: 'lemon_lime_soda',
          name: 'Lemon-Lime Soda',
          icon: '🥤',
          category: 'beverages',
          defaultUnit: 'can',
          commonUnits: ['can', 'bottle', 'case', 'liter'],
        },
        {
          id: 'ginger_ale',
          name: 'Ginger Ale',
          icon: '🥤',
          category: 'beverages',
          defaultUnit: 'can',
          commonUnits: ['can', 'bottle', 'case', 'liter'],
        },
        {
          id: 'root_beer',
          name: 'Root Beer',
          icon: '🥤',
          category: 'beverages',
          defaultUnit: 'can',
          commonUnits: ['can', 'bottle', 'case', 'liter'],
        },

        // Energy & Sports Drinks (Halal)
        {
          id: 'sports_drink',
          name: 'Sports Drink',
          icon: '🥤',
          category: 'beverages',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'case', 'liter'],
        },
        {
          id: 'energy_drink_halal',
          name: 'Energy Drink (Halal)',
          icon: '⚡',
          category: 'beverages',
          defaultUnit: 'can',
          commonUnits: ['can', 'bottle', 'case'],
        },

        // Milk-based Drinks
        {
          id: 'chocolate_milk',
          name: 'Chocolate Milk',
          icon: '🍫',
          category: 'beverages',
          defaultUnit: 'carton',
          commonUnits: ['carton', 'bottle', 'gallon'],
        },
        {
          id: 'strawberry_milk',
          name: 'Strawberry Milk',
          icon: '🍓',
          category: 'beverages',
          defaultUnit: 'carton',
          commonUnits: ['carton', 'bottle', 'gallon'],
        },
        {
          id: 'protein_shake',
          name: 'Protein Shake',
          icon: '🥤',
          category: 'beverages',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'can', 'container'],
        },

        // Traditional/Cultural Drinks
        {
          id: 'rose_water',
          name: 'Rose Water',
          icon: '🌹',
          category: 'beverages',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'ml'],
        },
        {
          id: 'tamarind_drink',
          name: 'Tamarind Drink',
          icon: '🥤',
          category: 'beverages',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'can', 'liter'],
        },
        {
          id: 'mango_lassi',
          name: 'Mango Lassi',
          icon: '🥭',
          category: 'beverages',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'container', 'cup'],
        },
      ],
    },
    {
      id: 'snacks',
      name: 'Halal Snacks & Treats',
      icon: '🍿',
      items: [
        // Chips & Crisps
        {
          id: 'potato_chips',
          name: 'Potato Chips',
          icon: '🍟',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'box'],
        },
        {
          id: 'tortilla_chips',
          name: 'Tortilla Chips',
          icon: '🌽',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'box'],
        },
        {
          id: 'pita_chips',
          name: 'Pita Chips',
          icon: '🫓',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'box'],
        },
        {
          id: 'rice_cakes',
          name: 'Rice Cakes',
          icon: '🍘',
          category: 'snacks',
          defaultUnit: 'package',
          commonUnits: ['package', 'bag', 'pieces'],
        },
        {
          id: 'pretzels',
          name: 'Pretzels',
          icon: '🥨',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'box'],
        },
        {
          id: 'popcorn',
          name: 'Popcorn',
          icon: '🍿',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'box'],
        },

        // Nuts & Seeds
        {
          id: 'almonds',
          name: 'Almonds',
          icon: '🥜',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'lbs', 'oz'],
        },
        {
          id: 'cashews',
          name: 'Cashews',
          icon: '🥜',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'lbs', 'oz'],
        },
        {
          id: 'walnuts',
          name: 'Walnuts',
          icon: '🥜',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'lbs', 'oz'],
        },
        {
          id: 'pistachios',
          name: 'Pistachios',
          icon: '🥜',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'lbs', 'oz'],
        },
        {
          id: 'peanuts',
          name: 'Peanuts',
          icon: '🥜',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'lbs', 'oz'],
        },
        {
          id: 'mixed_nuts',
          name: 'Mixed Nuts',
          icon: '🥜',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'lbs', 'oz'],
        },
        {
          id: 'sunflower_seeds',
          name: 'Sunflower Seeds',
          icon: '🌻',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'oz'],
        },
        {
          id: 'pumpkin_seeds',
          name: 'Pumpkin Seeds',
          icon: '🎃',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'oz'],
        },

        // Cookies & Biscuits (Halal)
        {
          id: 'chocolate_chip_cookies',
          name: 'Chocolate Chip Cookies',
          icon: '🍪',
          category: 'snacks',
          defaultUnit: 'package',
          commonUnits: ['package', 'box', 'container'],
        },
        {
          id: 'oatmeal_cookies',
          name: 'Oatmeal Cookies',
          icon: '🍪',
          category: 'snacks',
          defaultUnit: 'package',
          commonUnits: ['package', 'box', 'container'],
        },
        {
          id: 'graham_crackers',
          name: 'Graham Crackers',
          icon: '🍪',
          category: 'snacks',
          defaultUnit: 'box',
          commonUnits: ['box', 'package', 'container'],
        },
        {
          id: 'vanilla_wafers',
          name: 'Vanilla Wafers',
          icon: '🍪',
          category: 'snacks',
          defaultUnit: 'box',
          commonUnits: ['box', 'package', 'container'],
        },
        {
          id: 'digestive_biscuits',
          name: 'Digestive Biscuits',
          icon: '🍪',
          category: 'snacks',
          defaultUnit: 'package',
          commonUnits: ['package', 'box'],
        },

        // Chocolate & Candy (Halal)
        {
          id: 'dark_chocolate',
          name: 'Dark Chocolate',
          icon: '🍫',
          category: 'snacks',
          defaultUnit: 'bar',
          commonUnits: ['bar', 'package', 'box'],
        },
        {
          id: 'milk_chocolate',
          name: 'Milk Chocolate',
          icon: '🍫',
          category: 'snacks',
          defaultUnit: 'bar',
          commonUnits: ['bar', 'package', 'box'],
        },
        {
          id: 'chocolate_chips',
          name: 'Chocolate Chips',
          icon: '🍫',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'oz'],
        },
        {
          id: 'gummy_bears_halal',
          name: 'Gummy Bears (Halal)',
          icon: '🐻',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'package', 'container'],
        },
        {
          id: 'hard_candy',
          name: 'Hard Candy',
          icon: '🍬',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'package', 'container'],
        },

        // Dried Fruits
        {
          id: 'raisins',
          name: 'Raisins',
          icon: '🍇',
          category: 'snacks',
          defaultUnit: 'box',
          commonUnits: ['box', 'bag', 'container', 'oz'],
        },
        {
          id: 'dried_apricots',
          name: 'Dried Apricots',
          icon: '🍑',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'oz'],
        },
        {
          id: 'dried_cranberries',
          name: 'Dried Cranberries',
          icon: '🫐',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'oz'],
        },
        {
          id: 'dried_mango',
          name: 'Dried Mango',
          icon: '🥭',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'oz'],
        },
        {
          id: 'trail_mix',
          name: 'Trail Mix',
          icon: '🥜',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'oz'],
        },

        // Crackers
        {
          id: 'saltine_crackers',
          name: 'Saltine Crackers',
          icon: '🍘',
          category: 'snacks',
          defaultUnit: 'box',
          commonUnits: ['box', 'package', 'sleeve'],
        },
        {
          id: 'wheat_crackers',
          name: 'Wheat Crackers',
          icon: '🍘',
          category: 'snacks',
          defaultUnit: 'box',
          commonUnits: ['box', 'package', 'container'],
        },
        {
          id: 'cheese_crackers',
          name: 'Cheese Crackers',
          icon: '🧀',
          category: 'snacks',
          defaultUnit: 'box',
          commonUnits: ['box', 'package', 'container'],
        },

        // Healthy Snacks
        {
          id: 'granola_bars',
          name: 'Granola Bars',
          icon: '🥜',
          category: 'snacks',
          defaultUnit: 'box',
          commonUnits: ['box', 'package', 'pieces'],
        },
        {
          id: 'protein_bars',
          name: 'Protein Bars',
          icon: '💪',
          category: 'snacks',
          defaultUnit: 'box',
          commonUnits: ['box', 'package', 'pieces'],
        },
        {
          id: 'fruit_snacks',
          name: 'Fruit Snacks',
          icon: '🍓',
          category: 'snacks',
          defaultUnit: 'box',
          commonUnits: ['box', 'package', 'pouches'],
        },
        {
          id: 'veggie_chips',
          name: 'Veggie Chips',
          icon: '🥕',
          category: 'snacks',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'box'],
        },
      ],
    },
    {
      id: 'frozen',
      name: 'Frozen Foods',
      icon: '🧊',
      items: [
        // Ice Cream & Desserts
        {
          id: 'vanilla_ice_cream',
          name: 'Vanilla Ice Cream',
          icon: '🍦',
          category: 'frozen',
          defaultUnit: 'container',
          commonUnits: ['container', 'gallon', 'pint', 'quart'],
        },
        {
          id: 'chocolate_ice_cream',
          name: 'Chocolate Ice Cream',
          icon: '🍦',
          category: 'frozen',
          defaultUnit: 'container',
          commonUnits: ['container', 'gallon', 'pint', 'quart'],
        },
        {
          id: 'strawberry_ice_cream',
          name: 'Strawberry Ice Cream',
          icon: '🍓',
          category: 'frozen',
          defaultUnit: 'container',
          commonUnits: ['container', 'gallon', 'pint', 'quart'],
        },
        {
          id: 'sorbet',
          name: 'Sorbet',
          icon: '🍧',
          category: 'frozen',
          defaultUnit: 'container',
          commonUnits: ['container', 'pint', 'quart'],
        },
        {
          id: 'frozen_yogurt',
          name: 'Frozen Yogurt',
          icon: '🍦',
          category: 'frozen',
          defaultUnit: 'container',
          commonUnits: ['container', 'pint', 'quart'],
        },
        {
          id: 'popsicles',
          name: 'Popsicles',
          icon: '🍭',
          category: 'frozen',
          defaultUnit: 'box',
          commonUnits: ['box', 'pack', 'pieces'],
        },

        // Frozen Vegetables
        {
          id: 'frozen_broccoli',
          name: 'Frozen Broccoli',
          icon: '🥦',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'box', 'lbs'],
        },
        {
          id: 'frozen_peas',
          name: 'Frozen Peas',
          icon: '🟢',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'box', 'lbs'],
        },
        {
          id: 'frozen_corn',
          name: 'Frozen Corn',
          icon: '🌽',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'box', 'lbs'],
        },
        {
          id: 'frozen_green_beans',
          name: 'Frozen Green Beans',
          icon: '🫘',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'box', 'lbs'],
        },
        {
          id: 'frozen_spinach',
          name: 'Frozen Spinach',
          icon: '🥬',
          category: 'frozen',
          defaultUnit: 'box',
          commonUnits: ['box', 'bag', 'oz'],
        },
        {
          id: 'frozen_mixed_vegetables',
          name: 'Frozen Mixed Vegetables',
          icon: '🥕',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'box', 'lbs'],
        },
        {
          id: 'frozen_cauliflower',
          name: 'Frozen Cauliflower',
          icon: '🥦',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'box', 'lbs'],
        },
        {
          id: 'frozen_carrots',
          name: 'Frozen Carrots',
          icon: '🥕',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'box', 'lbs'],
        },

        // Frozen Fruits
        {
          id: 'frozen_strawberries',
          name: 'Frozen Strawberries',
          icon: '🍓',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'lbs'],
        },
        {
          id: 'frozen_blueberries',
          name: 'Frozen Blueberries',
          icon: '🫐',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'lbs'],
        },
        {
          id: 'frozen_mango',
          name: 'Frozen Mango',
          icon: '🥭',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'lbs'],
        },
        {
          id: 'frozen_mixed_berries',
          name: 'Frozen Mixed Berries',
          icon: '🍓',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'lbs'],
        },
        {
          id: 'frozen_pineapple',
          name: 'Frozen Pineapple',
          icon: '🍍',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'container', 'lbs'],
        },

        // Frozen Meals (Halal)
        {
          id: 'frozen_pizza_halal',
          name: 'Frozen Pizza (Halal)',
          icon: '🍕',
          category: 'frozen',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'box'],
        },
        {
          id: 'frozen_burrito_halal',
          name: 'Frozen Burrito (Halal)',
          icon: '🌯',
          category: 'frozen',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'box', 'pack'],
        },
        {
          id: 'frozen_pasta_meal',
          name: 'Frozen Pasta Meal',
          icon: '🍝',
          category: 'frozen',
          defaultUnit: 'container',
          commonUnits: ['container', 'box', 'pieces'],
        },
        {
          id: 'frozen_rice_bowl',
          name: 'Frozen Rice Bowl',
          icon: '🍚',
          category: 'frozen',
          defaultUnit: 'container',
          commonUnits: ['container', 'box', 'pieces'],
        },
        {
          id: 'frozen_soup',
          name: 'Frozen Soup',
          icon: '🍲',
          category: 'frozen',
          defaultUnit: 'container',
          commonUnits: ['container', 'box', 'pieces'],
        },

        // Frozen Bread & Bakery
        {
          id: 'frozen_bread',
          name: 'Frozen Bread',
          icon: '🍞',
          category: 'frozen',
          defaultUnit: 'loaf',
          commonUnits: ['loaf', 'pieces', 'bag'],
        },
        {
          id: 'frozen_bagels',
          name: 'Frozen Bagels',
          icon: '🥯',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'pieces', 'dozen'],
        },
        {
          id: 'frozen_waffles',
          name: 'Frozen Waffles',
          icon: '🧇',
          category: 'frozen',
          defaultUnit: 'box',
          commonUnits: ['box', 'pieces', 'pack'],
        },
        {
          id: 'frozen_pancakes',
          name: 'Frozen Pancakes',
          icon: '🥞',
          category: 'frozen',
          defaultUnit: 'box',
          commonUnits: ['box', 'pieces', 'pack'],
        },
        {
          id: 'frozen_croissants',
          name: 'Frozen Croissants',
          icon: '🥐',
          category: 'frozen',
          defaultUnit: 'box',
          commonUnits: ['box', 'pieces', 'pack'],
        },

        // Frozen Appetizers (Halal)
        {
          id: 'frozen_spring_rolls',
          name: 'Frozen Spring Rolls',
          icon: '🥟',
          category: 'frozen',
          defaultUnit: 'box',
          commonUnits: ['box', 'pieces', 'pack'],
        },
        {
          id: 'frozen_samosas',
          name: 'Frozen Samosas',
          icon: '🥟',
          category: 'frozen',
          defaultUnit: 'box',
          commonUnits: ['box', 'pieces', 'pack'],
        },
        {
          id: 'frozen_mozzarella_sticks',
          name: 'Frozen Mozzarella Sticks',
          icon: '🧀',
          category: 'frozen',
          defaultUnit: 'box',
          commonUnits: ['box', 'pieces', 'pack'],
        },
        {
          id: 'frozen_french_fries',
          name: 'Frozen French Fries',
          icon: '🍟',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'box', 'lbs'],
        },
        {
          id: 'frozen_onion_rings',
          name: 'Frozen Onion Rings',
          icon: '🧅',
          category: 'frozen',
          defaultUnit: 'bag',
          commonUnits: ['bag', 'box', 'pieces'],
        },
      ],
    },
    {
      id: 'household',
      name: 'Household Items',
      icon: '🧽',
      items: [
        // Paper Products
        {
          id: 'toilet_paper',
          name: 'Toilet Paper',
          icon: '🧻',
          category: 'household',
          defaultUnit: 'pack',
          commonUnits: ['pack', 'rolls', 'case'],
        },
        {
          id: 'paper_towels',
          name: 'Paper Towels',
          icon: '🧻',
          category: 'household',
          defaultUnit: 'pack',
          commonUnits: ['pack', 'rolls', 'case'],
        },
        {
          id: 'facial_tissues',
          name: 'Facial Tissues',
          icon: '🧻',
          category: 'household',
          defaultUnit: 'box',
          commonUnits: ['box', 'pack', 'case'],
        },
        {
          id: 'napkins',
          name: 'Napkins',
          icon: '🧻',
          category: 'household',
          defaultUnit: 'pack',
          commonUnits: ['pack', 'box', 'pieces'],
        },
        {
          id: 'paper_plates',
          name: 'Paper Plates',
          icon: '🍽️',
          category: 'household',
          defaultUnit: 'pack',
          commonUnits: ['pack', 'pieces', 'case'],
        },
        {
          id: 'paper_cups',
          name: 'Paper Cups',
          icon: '🥤',
          category: 'household',
          defaultUnit: 'pack',
          commonUnits: ['pack', 'pieces', 'case'],
        },

        // Cleaning Supplies
        {
          id: 'dish_soap',
          name: 'Dish Soap',
          icon: '🧽',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'container', 'oz'],
        },
        {
          id: 'hand_soap',
          name: 'Hand Soap',
          icon: '🧼',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'container', 'pump'],
        },
        {
          id: 'body_wash',
          name: 'Body Wash',
          icon: '🧴',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'container', 'oz'],
        },
        {
          id: 'shampoo',
          name: 'Shampoo',
          icon: '🧴',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'container', 'oz'],
        },
        {
          id: 'conditioner',
          name: 'Conditioner',
          icon: '🧴',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'container', 'oz'],
        },
        {
          id: 'all_purpose_cleaner',
          name: 'All-Purpose Cleaner',
          icon: '🧽',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'container', 'spray'],
        },
        {
          id: 'glass_cleaner',
          name: 'Glass Cleaner',
          icon: '🧽',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'spray', 'container'],
        },
        {
          id: 'bathroom_cleaner',
          name: 'Bathroom Cleaner',
          icon: '🧽',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'spray', 'container'],
        },
        {
          id: 'floor_cleaner',
          name: 'Floor Cleaner',
          icon: '🧽',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'container', 'gallon'],
        },
        {
          id: 'disinfectant_wipes',
          name: 'Disinfectant Wipes',
          icon: '🧻',
          category: 'household',
          defaultUnit: 'container',
          commonUnits: ['container', 'pack', 'case'],
        },

        // Laundry
        {
          id: 'laundry_detergent',
          name: 'Laundry Detergent',
          icon: '🧴',
          category: 'household',
          defaultUnit: 'container',
          commonUnits: ['container', 'bottle', 'box', 'pods'],
        },
        {
          id: 'fabric_softener',
          name: 'Fabric Softener',
          icon: '🧴',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'container', 'sheets'],
        },
        {
          id: 'bleach',
          name: 'Bleach',
          icon: '🧴',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'gallon', 'container'],
        },
        {
          id: 'stain_remover',
          name: 'Stain Remover',
          icon: '🧴',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'spray', 'stick'],
        },
        {
          id: 'dryer_sheets',
          name: 'Dryer Sheets',
          icon: '🧻',
          category: 'household',
          defaultUnit: 'box',
          commonUnits: ['box', 'pack', 'sheets'],
        },

        // Personal Care
        {
          id: 'toothpaste',
          name: 'Toothpaste',
          icon: '🦷',
          category: 'household',
          defaultUnit: 'tube',
          commonUnits: ['tube', 'pack', 'oz'],
        },
        {
          id: 'toothbrush',
          name: 'Toothbrush',
          icon: '🪥',
          category: 'household',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'pack'],
        },
        {
          id: 'mouthwash',
          name: 'Mouthwash',
          icon: '🧴',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'container', 'oz'],
        },
        {
          id: 'dental_floss',
          name: 'Dental Floss',
          icon: '🦷',
          category: 'household',
          defaultUnit: 'container',
          commonUnits: ['container', 'pack'],
        },
        {
          id: 'deodorant',
          name: 'Deodorant',
          icon: '🧴',
          category: 'household',
          defaultUnit: 'stick',
          commonUnits: ['stick', 'spray', 'roll-on'],
        },
        {
          id: 'razors',
          name: 'Razors',
          icon: '🪒',
          category: 'household',
          defaultUnit: 'pack',
          commonUnits: ['pack', 'pieces', 'disposable'],
        },
        {
          id: 'shaving_cream',
          name: 'Shaving Cream',
          icon: '🧴',
          category: 'household',
          defaultUnit: 'can',
          commonUnits: ['can', 'tube', 'bottle'],
        },

        // Baby Care
        {
          id: 'diapers',
          name: 'Diapers',
          icon: '👶',
          category: 'household',
          defaultUnit: 'pack',
          commonUnits: ['pack', 'case', 'pieces'],
        },
        {
          id: 'baby_wipes',
          name: 'Baby Wipes',
          icon: '🧻',
          category: 'household',
          defaultUnit: 'pack',
          commonUnits: ['pack', 'container', 'case'],
        },
        {
          id: 'baby_formula',
          name: 'Baby Formula',
          icon: '🍼',
          category: 'household',
          defaultUnit: 'container',
          commonUnits: ['container', 'can', 'box'],
        },
        {
          id: 'baby_food',
          name: 'Baby Food',
          icon: '🍼',
          category: 'household',
          defaultUnit: 'jar',
          commonUnits: ['jar', 'pouch', 'pack'],
        },

        // Kitchen Supplies
        {
          id: 'aluminum_foil',
          name: 'Aluminum Foil',
          icon: '📦',
          category: 'household',
          defaultUnit: 'roll',
          commonUnits: ['roll', 'box', 'feet'],
        },
        {
          id: 'plastic_wrap',
          name: 'Plastic Wrap',
          icon: '📦',
          category: 'household',
          defaultUnit: 'roll',
          commonUnits: ['roll', 'box', 'feet'],
        },
        {
          id: 'parchment_paper',
          name: 'Parchment Paper',
          icon: '📦',
          category: 'household',
          defaultUnit: 'roll',
          commonUnits: ['roll', 'box', 'sheets'],
        },
        {
          id: 'ziplock_bags',
          name: 'Ziplock Bags',
          icon: '📦',
          category: 'household',
          defaultUnit: 'box',
          commonUnits: ['box', 'pack', 'pieces'],
        },
        {
          id: 'garbage_bags',
          name: 'Garbage Bags',
          icon: '🗑️',
          category: 'household',
          defaultUnit: 'box',
          commonUnits: ['box', 'roll', 'pieces'],
        },
        {
          id: 'sponges',
          name: 'Sponges',
          icon: '🧽',
          category: 'household',
          defaultUnit: 'pack',
          commonUnits: ['pack', 'pieces', 'container'],
        },

        // Air Fresheners & Candles
        {
          id: 'air_freshener',
          name: 'Air Freshener',
          icon: '🌸',
          category: 'household',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'spray', 'plug-in'],
        },
        {
          id: 'candles',
          name: 'Candles',
          icon: '🕯️',
          category: 'household',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'pack', 'jar'],
        },
        {
          id: 'matches',
          name: 'Matches',
          icon: '🔥',
          category: 'household',
          defaultUnit: 'box',
          commonUnits: ['box', 'pack'],
        },
        {
          id: 'lighter',
          name: 'Lighter',
          icon: '🔥',
          category: 'household',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'pack'],
        },

        // Batteries & Electronics
        {
          id: 'batteries_aa',
          name: 'AA Batteries',
          icon: '🔋',
          category: 'household',
          defaultUnit: 'pack',
          commonUnits: ['pack', 'pieces', 'case'],
        },
        {
          id: 'batteries_aaa',
          name: 'AAA Batteries',
          icon: '🔋',
          category: 'household',
          defaultUnit: 'pack',
          commonUnits: ['pack', 'pieces', 'case'],
        },
        {
          id: 'light_bulbs',
          name: 'Light Bulbs',
          icon: '💡',
          category: 'household',
          defaultUnit: 'pieces',
          commonUnits: ['pieces', 'pack', 'box'],
        },
      ],
    },
    {
      id: 'spices',
      name: 'Spices & Seasonings',
      icon: '🌶️',
      items: [
        // Basic Spices
        {
          id: 'salt',
          name: 'Salt',
          icon: '🧂',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'box', 'lbs', 'oz'],
        },
        {
          id: 'black_pepper',
          name: 'Black Pepper',
          icon: '🌶️',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'grinder'],
        },
        {
          id: 'garlic_powder',
          name: 'Garlic Powder',
          icon: '🧄',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'onion_powder',
          name: 'Onion Powder',
          icon: '🧅',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'paprika',
          name: 'Paprika',
          icon: '🌶️',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'cumin',
          name: 'Cumin',
          icon: '🌶️',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'coriander',
          name: 'Coriander',
          icon: '🌿',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'turmeric',
          name: 'Turmeric',
          icon: '🟡',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'chili_powder',
          name: 'Chili Powder',
          icon: '🌶️',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'cayenne_pepper',
          name: 'Cayenne Pepper',
          icon: '🌶️',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },

        // Herbs
        {
          id: 'oregano',
          name: 'Oregano',
          icon: '🌿',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'thyme',
          name: 'Thyme',
          icon: '🌿',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'rosemary',
          name: 'Rosemary',
          icon: '🌿',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'sage',
          name: 'Sage',
          icon: '🌿',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'bay_leaves',
          name: 'Bay Leaves',
          icon: '🍃',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'dried_basil',
          name: 'Dried Basil',
          icon: '🌿',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'dried_parsley',
          name: 'Dried Parsley',
          icon: '🌿',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },

        // International Spices
        {
          id: 'garam_masala',
          name: 'Garam Masala',
          icon: '🌶️',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'curry_powder',
          name: 'Curry Powder',
          icon: '🌶️',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'cardamom',
          name: 'Cardamom',
          icon: '🌿',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'cinnamon',
          name: 'Cinnamon',
          icon: '🟤',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar', 'sticks'],
        },
        {
          id: 'cloves',
          name: 'Cloves',
          icon: '🌿',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'nutmeg',
          name: 'Nutmeg',
          icon: '🌰',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'allspice',
          name: 'Allspice',
          icon: '🌶️',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'star_anise',
          name: 'Star Anise',
          icon: '⭐',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'fennel_seeds',
          name: 'Fennel Seeds',
          icon: '🌿',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'mustard_seeds',
          name: 'Mustard Seeds',
          icon: '🟡',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'sesame_seeds',
          name: 'Sesame Seeds',
          icon: '🌰',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar', 'bag'],
        },

        // Spice Blends
        {
          id: 'italian_seasoning',
          name: 'Italian Seasoning',
          icon: '🌿',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'taco_seasoning',
          name: 'Taco Seasoning',
          icon: '🌮',
          category: 'spices',
          defaultUnit: 'packet',
          commonUnits: ['packet', 'container', 'oz'],
        },
        {
          id: 'ranch_seasoning',
          name: 'Ranch Seasoning',
          icon: '🌿',
          category: 'spices',
          defaultUnit: 'packet',
          commonUnits: ['packet', 'container', 'oz'],
        },
        {
          id: 'bbq_seasoning',
          name: 'BBQ Seasoning',
          icon: '🍖',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'cajun_seasoning',
          name: 'Cajun Seasoning',
          icon: '🌶️',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },
        {
          id: 'everything_bagel_seasoning',
          name: 'Everything Bagel Seasoning',
          icon: '🥯',
          category: 'spices',
          defaultUnit: 'container',
          commonUnits: ['container', 'oz', 'jar'],
        },

        // Extracts & Flavorings
        {
          id: 'vanilla_extract',
          name: 'Vanilla Extract',
          icon: '🍦',
          category: 'spices',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'container'],
        },
        {
          id: 'almond_extract',
          name: 'Almond Extract',
          icon: '🥜',
          category: 'spices',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'container'],
        },
        {
          id: 'lemon_extract',
          name: 'Lemon Extract',
          icon: '🍋',
          category: 'spices',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'container'],
        },
        {
          id: 'coconut_extract',
          name: 'Coconut Extract',
          icon: '🥥',
          category: 'spices',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'container'],
        },

        // Condiments & Sauces
        {
          id: 'soy_sauce',
          name: 'Soy Sauce',
          icon: '🥢',
          category: 'spices',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'container'],
        },
        {
          id: 'hot_sauce',
          name: 'Hot Sauce',
          icon: '🌶️',
          category: 'spices',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'container'],
        },
        {
          id: 'worcestershire_sauce',
          name: 'Worcestershire Sauce',
          icon: '🍶',
          category: 'spices',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'container'],
        },
        {
          id: 'fish_sauce',
          name: 'Fish Sauce',
          icon: '🐟',
          category: 'spices',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'container'],
        },
        {
          id: 'sriracha',
          name: 'Sriracha',
          icon: '🌶️',
          category: 'spices',
          defaultUnit: 'bottle',
          commonUnits: ['bottle', 'oz', 'container'],
        },
        {
          id: 'tahini',
          name: 'Tahini',
          icon: '🥜',
          category: 'spices',
          defaultUnit: 'jar',
          commonUnits: ['jar', 'container', 'oz'],
        },
      ],
    },
  ];

  private allItems: GroceryItem[] = [];
  private itemsCache: Map<string, GroceryItem> = new Map();
  private searchCache: Map<string, GroceryItem[]> = new Map();
  private isInitialized = false;

  constructor() {
    // Lazy initialization - items will be flattened when first needed
  }

  private initializeItems() {
    if (this.isInitialized) return;

    // Flatten all items for easy searching
    this.allItems = this.categories.reduce((acc, category) => {
      return acc.concat(category.items);
    }, [] as GroceryItem[]);

    // Build cache for O(1) lookups
    this.allItems.forEach(item => {
      this.itemsCache.set(item.id, item);
    });

    this.isInitialized = true;
  }

  /**
   * Get all categories with their items
   */
  async getCategories(): Promise<Category[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.categories;
  }

  /**
   * Search for items by name with caching for better performance
   */
  async searchItems(query: string): Promise<GroceryItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    if (!query.trim()) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();

    // Check cache first
    if (this.searchCache.has(searchTerm)) {
      return this.searchCache.get(searchTerm)!.slice(0, 20);
    }

    // Initialize items if not done yet
    this.initializeItems();

    // Perform search with fuzzy matching
    const results = this.allItems.filter(item => {
      const itemName = item.name.toLowerCase();
      return (
        itemName.includes(searchTerm) ||
        itemName.split(' ').some(word => word.startsWith(searchTerm))
      );
    });

    // Cache the results
    this.searchCache.set(searchTerm, results);

    return results.slice(0, 20); // Limit results for performance
  }

  /**
   * Get a specific item by ID with O(1) lookup
   */
  async getItemById(itemId: string): Promise<GroceryItem | null> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 50));

    // Initialize items if not done yet
    this.initializeItems();

    return this.itemsCache.get(itemId) || null;
  }

  /**
   * Get items by category
   */
  async getItemsByCategory(categoryId: string): Promise<GroceryItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.items : [];
  }

  /**
   * Get popular/recommended items with updated IDs
   */
  async getPopularItems(limit: number = 10): Promise<GroceryItem[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Initialize items if not done yet
    this.initializeItems();

    // Return a mix of popular items from different categories (updated with new IDs)
    const popularItemIds = [
      'whole_milk',
      'large_eggs',
      'white_bread',
      'halal_chicken_breast',
      'apple',
      'banana',
      'basmati_rice',
      'spaghetti',
      'cheddar_cheese',
      'bottled_water',
      'olive_oil',
      'salt',
      'black_pepper',
      'onion',
      'garlic',
    ];

    return popularItemIds
      .map(id => this.itemsCache.get(id))
      .filter(Boolean)
      .slice(0, limit) as GroceryItem[];
  }

  /**
   * Clear search cache (useful for memory management)
   */
  clearSearchCache(): void {
    this.searchCache.clear();
  }

  /**
   * Get total number of items available
   */
  getTotalItemCount(): number {
    this.initializeItems();
    return this.allItems.length;
  }

  /**
   * Get items count by category
   */
  getCategoryItemCounts(): Record<string, number> {
    return this.categories.reduce(
      (acc, category) => {
        acc[category.id] = category.items.length;
        return acc;
      },
      {} as Record<string, number>
    );
  }
}

// Export singleton instance
const groceryItemsService = new GroceryItemsService();
export default groceryItemsService;
