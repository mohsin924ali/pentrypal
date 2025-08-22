import { GroceryItem } from '../../shared/types';

export interface ShopProduct extends GroceryItem {
  price: number;
  discountPrice?: number;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviews: number;
  brand?: string;
  store: string;
  distance: string;
  imageUrl?: string;
  isOrganic?: boolean;
  isFeatured?: boolean;
}

export interface Store {
  id: string;
  name: string;
  distance: string;
  rating: number;
  isOpen: boolean;
  openUntil?: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDelivery: string;
  categories: string[];
}

export interface ShopFilters {
  categories: string[];
  stores: string[];
  priceRange: [number, number];
  rating: number;
  inStockOnly: boolean;
  organicOnly: boolean;
  featuredOnly: boolean;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'distance';
}

export interface CartItem {
  product: ShopProduct;
  quantity: number;
  selectedUnit: string;
}

// Mock shopping database
class MockShopDatabase {
  private products: ShopProduct[] = [];
  private stores: Store[] = [];
  private cart: CartItem[] = [];

  constructor() {
    // Start with empty database for clean testing
    // this.initializeMockData(); // Commented out to start fresh
  }

  private initializeMockData() {
    // Mock stores
    this.stores = [
      {
        id: 'store_1',
        name: 'Fresh Market',
        distance: '0.5 km',
        rating: 4.8,
        isOpen: true,
        openUntil: '10:00 PM',
        deliveryFee: 2.99,
        minimumOrder: 25,
        estimatedDelivery: '30-45 min',
        categories: ['fruits', 'vegetables', 'dairy', 'meat', 'pantry'],
      },
      {
        id: 'store_2',
        name: 'Organic Plus',
        distance: '1.2 km',
        rating: 4.6,
        isOpen: true,
        openUntil: '9:00 PM',
        deliveryFee: 1.99,
        minimumOrder: 35,
        estimatedDelivery: '45-60 min',
        categories: ['fruits', 'vegetables', 'dairy', 'pantry'],
      },
      {
        id: 'store_3',
        name: 'Quick Stop',
        distance: '0.8 km',
        rating: 4.2,
        isOpen: false,
        openUntil: 'Closed',
        deliveryFee: 3.99,
        minimumOrder: 20,
        estimatedDelivery: '20-35 min',
        categories: ['pantry', 'dairy', 'snacks'],
      },
    ];

    // Mock products
    this.products = [
      // Fruits
      {
        id: 'apple_red',
        name: 'Red Apples',
        category: 'fruits',
        icon: '🍎',
        price: 3.99,
        discountPrice: 2.99,
        inStock: true,
        stockCount: 150,
        rating: 4.5,
        reviews: 89,
        brand: 'Farm Fresh',
        store: 'Fresh Market',
        distance: '0.5 km',
        isOrganic: true,
        isFeatured: true,
        defaultUnit: 'lbs',
        commonUnits: ['lbs', 'kg', 'pieces'],
      },
      {
        id: 'banana',
        name: 'Bananas',
        category: 'fruits',
        icon: '🍌',
        price: 1.99,
        inStock: true,
        stockCount: 200,
        rating: 4.3,
        reviews: 156,
        brand: 'Tropical Best',
        store: 'Fresh Market',
        distance: '0.5 km',
        isOrganic: false,
        isFeatured: false,
        defaultUnit: 'bunch',
        commonUnits: ['bunch', 'lbs', 'pieces'],
      },
      {
        id: 'avocado',
        name: 'Avocados',
        category: 'fruits',
        icon: '🥑',
        price: 2.49,
        inStock: true,
        stockCount: 45,
        rating: 4.7,
        reviews: 67,
        brand: 'Green Valley',
        store: 'Organic Plus',
        distance: '1.2 km',
        isOrganic: true,
        isFeatured: true,
        defaultUnit: 'pieces',
        commonUnits: ['pieces', 'lbs'],
      },
      // Vegetables
      {
        id: 'carrot',
        name: 'Carrots',
        category: 'vegetables',
        icon: '🥕',
        price: 1.79,
        inStock: true,
        stockCount: 80,
        rating: 4.4,
        reviews: 43,
        brand: 'Garden Fresh',
        store: 'Fresh Market',
        distance: '0.5 km',
        isOrganic: true,
        isFeatured: false,
        defaultUnit: 'lbs',
        commonUnits: ['lbs', 'kg', 'bunch'],
      },
      {
        id: 'broccoli',
        name: 'Broccoli',
        category: 'vegetables',
        icon: '🥦',
        price: 2.99,
        inStock: true,
        stockCount: 25,
        rating: 4.2,
        reviews: 34,
        brand: 'Green Fields',
        store: 'Organic Plus',
        distance: '1.2 km',
        isOrganic: true,
        isFeatured: false,
        defaultUnit: 'head',
        commonUnits: ['head', 'lbs'],
      },
      // Dairy
      {
        id: 'milk_organic',
        name: 'Organic Milk',
        category: 'dairy',
        icon: '🥛',
        price: 4.99,
        inStock: true,
        stockCount: 30,
        rating: 4.6,
        reviews: 92,
        brand: 'Organic Valley',
        store: 'Organic Plus',
        distance: '1.2 km',
        isOrganic: true,
        isFeatured: true,
        defaultUnit: 'gallon',
        commonUnits: ['gallon', 'half gallon', 'quart'],
      },
      {
        id: 'cheese_cheddar',
        name: 'Cheddar Cheese',
        category: 'dairy',
        icon: '🧀',
        price: 5.49,
        discountPrice: 4.99,
        inStock: true,
        stockCount: 15,
        rating: 4.8,
        reviews: 78,
        brand: 'Artisan Dairy',
        store: 'Fresh Market',
        distance: '0.5 km',
        isOrganic: false,
        isFeatured: true,
        defaultUnit: 'lbs',
        commonUnits: ['lbs', 'oz', 'slices'],
      },
      // Pantry items
      {
        id: 'bread_whole_wheat',
        name: 'Whole Wheat Bread',
        category: 'pantry',
        icon: '🍞',
        price: 2.99,
        inStock: true,
        stockCount: 20,
        rating: 4.3,
        reviews: 45,
        brand: 'Bakery Fresh',
        store: 'Fresh Market',
        distance: '0.5 km',
        isOrganic: true,
        isFeatured: false,
        defaultUnit: 'loaf',
        commonUnits: ['loaf', 'slices'],
      },
      {
        id: 'pasta',
        name: 'Spaghetti Pasta',
        category: 'pantry',
        icon: '🍝',
        price: 1.49,
        inStock: false,
        stockCount: 0,
        rating: 4.1,
        reviews: 67,
        brand: 'Italian Best',
        store: 'Quick Stop',
        distance: '0.8 km',
        isOrganic: false,
        isFeatured: false,
        defaultUnit: 'lbs',
        commonUnits: ['lbs', 'oz', 'box'],
      },
    ];
  }

  // Simulate async operations
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all products with optional filters
  async getProducts(filters?: Partial<ShopFilters>): Promise<ShopProduct[]> {
    await this.delay();
    
    let filteredProducts = [...this.products];

    if (filters) {
      // Filter by categories
      if (filters.categories && filters.categories.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          filters.categories!.includes(p.category)
        );
      }

      // Filter by stores
      if (filters.stores && filters.stores.length > 0) {
        filteredProducts = filteredProducts.filter(p => 
          filters.stores!.includes(p.store)
        );
      }

      // Filter by price range
      if (filters.priceRange) {
        const [min, max] = filters.priceRange;
        filteredProducts = filteredProducts.filter(p => 
          p.price >= min && p.price <= max
        );
      }

      // Filter by rating
      if (filters.rating) {
        filteredProducts = filteredProducts.filter(p => p.rating >= filters.rating!);
      }

      // Filter by stock
      if (filters.inStockOnly) {
        filteredProducts = filteredProducts.filter(p => p.inStock);
      }

      // Filter by organic
      if (filters.organicOnly) {
        filteredProducts = filteredProducts.filter(p => p.isOrganic);
      }

      // Filter by featured
      if (filters.featuredOnly) {
        filteredProducts = filteredProducts.filter(p => p.isFeatured);
      }

      // Sort products
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'price_low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price_high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
          case 'distance':
            filteredProducts.sort((a, b) => 
              parseFloat(a.distance) - parseFloat(b.distance)
            );
            break;
          default:
            // Keep original order for relevance
            break;
        }
      }
    }

    return filteredProducts;
  }

  // Search products
  async searchProducts(query: string, filters?: Partial<ShopFilters>): Promise<ShopProduct[]> {
    await this.delay();
    
    const allProducts = await this.getProducts(filters);
    
    if (!query.trim()) {
      return allProducts;
    }

    const searchTerm = query.toLowerCase();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm))
    );
  }

  // Get featured products
  async getFeaturedProducts(): Promise<ShopProduct[]> {
    await this.delay();
    return this.products.filter(p => p.isFeatured);
  }

  // Get products by category
  async getProductsByCategory(category: string): Promise<ShopProduct[]> {
    await this.delay();
    return this.products.filter(p => p.category === category);
  }

  // Get all stores
  async getStores(): Promise<Store[]> {
    await this.delay();
    return [...this.stores];
  }

  // Get available categories
  async getCategories(): Promise<string[]> {
    await this.delay();
    const categories = new Set(this.products.map(p => p.category));
    return Array.from(categories);
  }

  // Cart management
  async addToCart(productId: string, quantity: number, unit: string): Promise<void> {
    await this.delay();
    
    const product = this.products.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const existingItem = this.cart.find(item => 
      item.product.id === productId && item.selectedUnit === unit
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        product,
        quantity,
        selectedUnit: unit,
      });
    }
  }

  async removeFromCart(productId: string, unit: string): Promise<void> {
    await this.delay();
    
    this.cart = this.cart.filter(item => 
      !(item.product.id === productId && item.selectedUnit === unit)
    );
  }

  async updateCartQuantity(productId: string, unit: string, quantity: number): Promise<void> {
    await this.delay();
    
    const item = this.cart.find(item => 
      item.product.id === productId && item.selectedUnit === unit
    );

    if (item) {
      if (quantity <= 0) {
        await this.removeFromCart(productId, unit);
      } else {
        item.quantity = quantity;
      }
    }
  }

  async getCart(): Promise<CartItem[]> {
    await this.delay();
    return [...this.cart];
  }

  async clearCart(): Promise<void> {
    await this.delay();
    this.cart = [];
  }

  async getCartTotal(): Promise<number> {
    await this.delay();
    
    return this.cart.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }
}

// Singleton instance
const mockShopDB = new MockShopDatabase();

// Service interface
export const ShopService = {
  // Products
  getProducts: (filters?: Partial<ShopFilters>) => mockShopDB.getProducts(filters),
  searchProducts: (query: string, filters?: Partial<ShopFilters>) => mockShopDB.searchProducts(query, filters),
  getFeaturedProducts: () => mockShopDB.getFeaturedProducts(),
  getProductsByCategory: (category: string) => mockShopDB.getProductsByCategory(category),
  
  // Stores and categories
  getStores: () => mockShopDB.getStores(),
  getCategories: () => mockShopDB.getCategories(),
  
  // Cart management
  addToCart: (productId: string, quantity: number, unit: string) => mockShopDB.addToCart(productId, quantity, unit),
  removeFromCart: (productId: string, unit: string) => mockShopDB.removeFromCart(productId, unit),
  updateCartQuantity: (productId: string, unit: string, quantity: number) => mockShopDB.updateCartQuantity(productId, unit, quantity),
  getCart: () => mockShopDB.getCart(),
  clearCart: () => mockShopDB.clearCart(),
  getCartTotal: () => mockShopDB.getCartTotal(),
};

export default ShopService;
