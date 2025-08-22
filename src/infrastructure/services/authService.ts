import type { User, AuthUser } from '../../shared/types';
import type { CurrencyCode } from '../../shared/utils/currencyUtils';
import { DEFAULT_CURRENCY } from '../../shared/utils/currencyUtils';

// Authentication response types
export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  expiresAt: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  location?: string;
  preferences: {
    notifications: boolean;
    privacy: 'public' | 'friends' | 'private';
    language: string;
    theme: 'light' | 'dark' | 'auto';
    currency: CurrencyCode;
  };
  stats: {
    totalLists: number;
    totalFriends: number;
    listsCreated: number;
    collaborations: number;
  };
  createdAt: string;
  lastActiveAt: string;
  isActive: boolean;
}

// Mock authentication database
class MockAuthDatabase {
  private users: Map<string, User> = new Map();
  private passwords: Map<string, string> = new Map(); // email -> password
  private userProfiles: Map<string, UserProfile> = new Map();
  private sessions: Map<string, AuthSession> = new Map();
  private currentSession: AuthSession | null = null;
  private nextUserId: number = 1;

  constructor() {
    this.resetAllData();
  }

  // Reset all data to clean state
  resetAllData() {
    console.log('🧹 RESETTING ALL AUTH DATA - CLEARING CACHE');
    this.users.clear();
    this.passwords.clear();
    this.userProfiles.clear();
    this.sessions.clear();
    this.currentSession = null;
    this.nextUserId = 1;
    
    // Add 2 mock users for quick testing
    this.addMockUsers();
    
    console.log('✅ Auth data reset complete');
  }

  // Add mock users for testing
  private addMockUsers() {
    console.log('👥 Adding mock users for testing...');
    
    // Mock User 1: Mohsin
    const mohsinUser: User = {
      id: 'user_100',
      name: 'Mohsin Ali',
      email: 'mohsin@ali.com',
      avatar: '👨‍💼',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      lastActiveAt: new Date().toISOString(),
      isActive: true,
    };

    const mohsinProfile: UserProfile = {
      id: 'user_100',
      name: 'Mohsin Ali',
      email: 'mohsin@ali.com',
      avatar: '👨‍💼',
      bio: 'Software Developer',
      location: 'Pakistan',
      preferences: {
        notifications: true,
        privacy: 'friends',
        language: 'en',
        theme: 'light',
        currency: 'USD',
      },
      stats: {
        totalLists: 0,
        totalFriends: 0,
        listsCreated: 0,
        collaborations: 0,
      },
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      lastActiveAt: new Date().toISOString(),
      isActive: true,
    };

    // Mock User 2: Rabia
    const rabiaUser: User = {
      id: 'user_101',
      name: 'Rabia Ghaffar',
      email: 'rabia@test.com',
      avatar: '👩‍💼',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      lastActiveAt: new Date().toISOString(),
      isActive: true,
    };

    const rabiaProfile: UserProfile = {
      id: 'user_101',
      name: 'Rabia Ghaffar',
      email: 'rabia@test.com',
      avatar: '👩‍💼',
      bio: 'Designer',
      location: 'Pakistan',
      preferences: {
        notifications: true,
        privacy: 'friends',
        language: 'en',
        theme: 'light',
        currency: 'USD',
      },
      stats: {
        totalLists: 0,
        totalFriends: 0,
        listsCreated: 0,
        collaborations: 0,
      },
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      lastActiveAt: new Date().toISOString(),
      isActive: true,
    };

    // Add users to the database
    this.users.set(mohsinUser.email.toLowerCase(), mohsinUser);
    this.users.set(rabiaUser.email.toLowerCase(), rabiaUser);
    
    // Add passwords (both use 'test1234')
    this.passwords.set(mohsinUser.email.toLowerCase(), 'test1234');
    this.passwords.set(rabiaUser.email.toLowerCase(), 'test1234');
    
    // Add profiles
    this.userProfiles.set(mohsinUser.id, mohsinProfile);
    this.userProfiles.set(rabiaUser.id, rabiaProfile);
    
    console.log('✅ Mock users added:');
    console.log('  - Mohsin Ali (mohsin@ali.com) - Password: test1234');
    console.log('  - Rabia Ghaffar (rabia@test.com) - Password: test1234');
  }

  private initializeMockUsers() {
    // Sample users for testing with specific passwords
    const mockUsersData = [
      {
        user: {
          id: 'user_1',
          name: 'Test User',
          email: 'test@pantrypal.com',
          avatar: '👤',
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          lastActiveAt: new Date().toISOString(),
          isActive: true,
        },
        password: 'password123'
      },
      {
        user: {
          id: 'user_2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@gmail.com',
          avatar: '👩',
          createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
          lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
          isActive: true,
        },
        password: 'password123'
      },
      {
        user: {
          id: 'user_3',
          name: 'Mike Chen',
          email: 'mike.chen@outlook.com',
          avatar: '👨',
          createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
          lastActiveAt: new Date(Date.now() - 86400000).toISOString(),
          isActive: true,
        },
        password: 'password123'
      },
      {
        user: {
          id: 'user_4',
          name: 'Emma Wilson',
          email: 'emma.wilson@gmail.com',
          avatar: '👩',
          createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          lastActiveAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          isActive: true,
        },
        password: 'password123'
      },
      {
        user: {
          id: 'user_5',
          name: 'David Brown',
          email: 'david.brown@hotmail.com',
          avatar: '👨',
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
          lastActiveAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          isActive: true,
        },
        password: 'password123'
      },
      {
        user: {
          id: 'user_6',
          name: 'Alex Garcia',
          email: 'alex.garcia@icloud.com',
          avatar: '🧑',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          lastActiveAt: new Date(Date.now() - 86400000).toISOString(),
          isActive: true,
        },
        password: 'password123'
      },
      {
        user: {
          id: 'user_7',
          name: 'Lisa Wang',
          email: 'lisa.wang@gmail.com',
          avatar: '👩',
          createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
          lastActiveAt: new Date(Date.now() - 3600000 * 12).toISOString(),
          isActive: true,
        },
        password: 'password123'
      },
    ];

    // Store users with their passwords
    mockUsersData.forEach(({ user, password }) => {
      this.users.set(user.email.toLowerCase(), user);
      this.passwords.set(user.email.toLowerCase(), password);
      
      // Create user profile
      const profile: UserProfile = {
        ...user,
        bio: `Hello! I'm ${user.name.split(' ')[0]} and I love using PantryPal for my shopping lists.`,
        location: this.getRandomLocation(),
        preferences: {
          notifications: true,
          privacy: 'friends',
          language: 'en',
          theme: 'auto',
          currency: DEFAULT_CURRENCY,
        },
        stats: {
          totalLists: Math.floor(Math.random() * 15) + 1,
          totalFriends: Math.floor(Math.random() * 20) + 1,
          listsCreated: Math.floor(Math.random() * 25) + 1,
          collaborations: Math.floor(Math.random() * 10) + 1,
        },
      };
      
      this.userProfiles.set(user.id, profile);
    });

    this.nextUserId = 100; // Start custom user IDs from 100
  }

  private getRandomLocation(): string {
    const locations = [
      'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
      'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA',
      'Dallas, TX', 'San Jose, CA', 'Austin, TX', 'Jacksonville, FL'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
  }

  // Simulate async operations
  private async delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate JWT-like token (for testing)
  private generateToken(userId: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: userId, 
      iat: Date.now(), 
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
    const signature = btoa(`mock_signature_${userId}_${Date.now()}`);
    return `${header}.${payload}.${signature}`;
  }

  // Validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  private validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    if (password.length > 128) {
      return { isValid: false, message: 'Password must be less than 128 characters' };
    }
    return { isValid: true };
  }

  // ==================== AUTHENTICATION OPERATIONS ====================

  // Login user
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await this.delay();

    try {
      const { email, password } = credentials;

      if (!email || !password) {
        return {
          success: false,
          message: 'Email and password are required',
        };
      }

      if (!this.isValidEmail(email)) {
        return {
          success: false,
          message: 'Please enter a valid email address',
        };
      }

      const user = this.users.get(email.toLowerCase());
      
      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Get the stored password for this user
      const storedPassword = this.passwords.get(email.toLowerCase());
      
      if (!storedPassword || password !== storedPassword) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Update last active
      user.lastActiveAt = new Date().toISOString();
      user.isActive = true;

      // Generate session
      const token = this.generateToken(user.id);
      const session: AuthSession = {
        isAuthenticated: true,
        user,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      this.currentSession = session;
      this.sessions.set(token, session);

      return {
        success: true,
        user,
        token,
        message: 'Login successful',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login',
      };
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<RegisterResponse> {
    await this.delay();

    try {
      const { name, email, password, confirmPassword } = data;

      // Validation
      if (!name || !email || !password || !confirmPassword) {
        return {
          success: false,
          message: 'All fields are required',
        };
      }

      if (!this.isValidEmail(email)) {
        return {
          success: false,
          message: 'Please enter a valid email address',
        };
      }

      const passwordValidation = this.validatePassword(password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.message,
        };
      }

      if (password !== confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match',
        };
      }

      // Check if user already exists
      if (this.users.has(email.toLowerCase())) {
        return {
          success: false,
          message: 'An account with this email already exists',
        };
      }

      // Create new user
      const newUser: User = {
        id: `user_${this.nextUserId++}`,
        name: name.trim(),
        email: email.toLowerCase(),
        avatar: this.getRandomAvatar(),
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isActive: true,
      };

      // Store user and password
      this.users.set(newUser.email, newUser);
      this.passwords.set(newUser.email, password);

      // Create user profile
      const profile: UserProfile = {
        ...newUser,
        bio: `Hello! I'm ${newUser.name.split(' ')[0]} and I'm new to PantryPal!`,
        location: '',
        preferences: {
          notifications: true,
          privacy: 'friends',
          language: 'en',
          theme: 'auto',
        },
        stats: {
          totalLists: 0,
          totalFriends: 0,
          listsCreated: 0,
          collaborations: 0,
        },
      };

      this.userProfiles.set(newUser.id, profile);

      // Generate session
      const token = this.generateToken(newUser.id);
      const session: AuthSession = {
        isAuthenticated: true,
        user: newUser,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      this.currentSession = session;
      this.sessions.set(token, session);

      return {
        success: true,
        user: newUser,
        token,
        message: 'Registration successful',
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration',
      };
    }
  }

  private getRandomAvatar(): string {
    const avatars = ['👤', '👨', '👩', '🧑', '👱', '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🎓', '👩‍🎓'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  // Logout user
  async logout(): Promise<{ success: boolean; message?: string }> {
    await this.delay(100);

    try {
      if (this.currentSession?.token) {
        this.sessions.delete(this.currentSession.token);
      }
      
      this.currentSession = null;

      return {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        message: 'An error occurred during logout',
      };
    }
  }

  // Get current session
  async getCurrentSession(): Promise<AuthSession> {
    await this.delay(50);
    
    if (!this.currentSession) {
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        expiresAt: null,
      };
    }

    // Check if session is expired
    if (this.currentSession.expiresAt && new Date() > new Date(this.currentSession.expiresAt)) {
      this.currentSession = null;
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        expiresAt: null,
      };
    }

    return this.currentSession;
  }

  // Validate token
  async validateToken(token: string): Promise<{ isValid: boolean; user?: User }> {
    await this.delay(100);

    const session = this.sessions.get(token);
    
    if (!session || !session.expiresAt) {
      return { isValid: false };
    }

    if (new Date() > new Date(session.expiresAt)) {
      this.sessions.delete(token);
      return { isValid: false };
    }

    return {
      isValid: true,
      user: session.user || undefined,
    };
  }

  // ==================== USER PROFILE OPERATIONS ====================

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    await this.delay();
    return this.userProfiles.get(userId) || null;
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    await this.delay();

    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return null;
    }

    const updatedProfile = {
      ...profile,
      ...updates,
      id: profile.id, // Prevent ID changes
      email: profile.email, // Prevent email changes through profile update
    };

    this.userProfiles.set(userId, updatedProfile);

    // Update user in users map if name or avatar changed
    if (updates.name || updates.avatar) {
      console.log('Profile update detected - name:', updates.name, 'avatar:', updates.avatar);
      
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      if (user) {
        console.log('Found user to update:', user.email, 'old avatar:', user.avatar);
        
        if (updates.name) user.name = updates.name;
        if (updates.avatar) user.avatar = updates.avatar;
        this.users.set(user.email, user);

        console.log('Updated user avatar to:', user.avatar);

        // Update current session if it's the same user
        if (this.currentSession?.user?.id === userId) {
          this.currentSession.user = user;
          console.log('Updated current session user avatar to:', this.currentSession.user.avatar);
        }

        // Sync avatar changes to SocialService to ensure search results show updated avatars
        console.log('Calling syncUserToSocialService...');
        this.syncUserToSocialService(user);
        
        // Sync avatar changes to ShoppingListService to update collaborators in all lists
        console.log('Calling syncUserToShoppingListService...');
        this.syncUserToShoppingListService(user);
      } else {
        console.log('User not found in users map for ID:', userId);
      }
    } else {
      console.log('No name or avatar changes detected in profile update');
    }

    return updatedProfile;
  }

  // ==================== SYNC OPERATIONS ====================

  // Sync user updates to SocialService (for avatar/name changes)
  private async syncUserToSocialService(user: any): Promise<void> {
    try {
      console.log('Attempting to sync user to social service:', user.email);
      
      // Use direct import instead of dynamic import
      const { SocialService } = await import('./socialService');
      console.log('SocialService imported successfully:', !!SocialService);
      
      if (SocialService && typeof SocialService.syncUserFromAuth === 'function') {
        console.log('syncUserFromAuth function found, calling it...');
        await SocialService.syncUserFromAuth(user);
        console.log('Successfully synced user avatar to social service');
      } else {
        console.warn('SocialService.syncUserFromAuth is not available');
        console.log('SocialService keys:', Object.keys(SocialService || {}));
      }
    } catch (syncError) {
      console.error('Error syncing user updates to social service:', syncError);
      // Don't fail the profile update if sync fails
    }
  }

  // Sync user updates to ShoppingListService (for avatar/name changes in collaborators)
  private async syncUserToShoppingListService(user: any): Promise<void> {
    try {
      console.log('Attempting to sync user to shopping list service:', user.email);
      
      // Use direct import instead of dynamic import
      const { ShoppingListService } = await import('./shoppingListService');
      console.log('ShoppingListService imported successfully:', !!ShoppingListService);
      
      if (ShoppingListService && typeof ShoppingListService.syncUserFromAuth === 'function') {
        console.log('syncUserFromAuth function found, calling it...');
        await ShoppingListService.syncUserFromAuth(user);
        console.log('Successfully synced user avatar to shopping list service');
      } else {
        console.warn('ShoppingListService.syncUserFromAuth is not available');
        console.log('ShoppingListService keys:', Object.keys(ShoppingListService || {}));
      }
    } catch (syncError) {
      console.error('Error syncing user updates to shopping list service:', syncError);
      // Don't fail the profile update if sync fails
    }
  }

  // ==================== USER MANAGEMENT OPERATIONS ====================

  // Get all users (for admin or testing)
  async getAllUsers(): Promise<User[]> {
    await this.delay();
    return Array.from(this.users.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Search users by email or name
  async searchUsers(query: string): Promise<User[]> {
    await this.delay();

    if (!query.trim()) {
      return [];
    }

    const queryLower = query.toLowerCase();
    return Array.from(this.users.values()).filter(user =>
      user.name.toLowerCase().includes(queryLower) ||
      user.email.toLowerCase().includes(queryLower)
    );
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    await this.delay();
    return Array.from(this.users.values()).find(u => u.id === userId) || null;
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    await this.delay();
    return this.users.get(email.toLowerCase()) || null;
  }

  // Update user activity
  async updateUserActivity(userId: string): Promise<boolean> {
    const user = Array.from(this.users.values()).find(u => u.id === userId);
    if (user) {
      user.lastActiveAt = new Date().toISOString();
      user.isActive = true;
      this.users.set(user.email, user);
      return true;
    }
    return false;
  }

  // ==================== PASSWORD MANAGEMENT ====================

  // Change password
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    await this.delay();

    try {
      const user = Array.from(this.users.values()).find(u => u.id === userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // Validate current password
      const storedPassword = this.passwords.get(user.email.toLowerCase());
      if (!storedPassword || currentPassword !== storedPassword) {
        return {
          success: false,
          message: 'Current password is incorrect',
        };
      }

      const passwordValidation = this.validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.message,
        };
      }

      // Store the new password
      this.passwords.set(user.email.toLowerCase(), newPassword);

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'An error occurred while changing password',
      };
    }
  }

  // Reset password (send reset link)
  async requestPasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
    await this.delay();

    if (!this.isValidEmail(email)) {
      return {
        success: false,
        message: 'Please enter a valid email address',
      };
    }

    const user = this.users.get(email.toLowerCase());
    
    // Always return success for security (don't reveal if email exists)
    return {
      success: true,
      message: 'If an account with this email exists, you will receive a password reset link',
    };
  }
}

// Singleton instance
const mockAuthDB = new MockAuthDatabase();

// Global reset function
export const resetAllAppData = () => {
  console.log('🔄 RESETTING ALL APP DATA');
  mockAuthDB.resetAllData();
  
  // Reset other services
  setTimeout(async () => {
    try {
      const { SocialService } = await import('./socialService');
      if (SocialService && typeof SocialService.resetAllData === 'function') {
        SocialService.resetAllData();
      }
      
      const { ShoppingListService } = await import('./shoppingListService');
      if (ShoppingListService && typeof ShoppingListService.resetAllData === 'function') {
        ShoppingListService.resetAllData();
      }
      
      // Clear Redux store data
      try {
        const { store } = await import('@/application/store');
        store.dispatch({ type: 'shoppingLists/resetShoppingLists' });
        store.dispatch({ type: 'pantry/resetPantry' });
        store.dispatch({ type: 'ui/resetUI' });
        console.log('✅ Redux store data cleared');
      } catch (reduxError) {
        console.error('Error clearing Redux store:', reduxError);
      }
      
      console.log('✅ All app data reset complete');
    } catch (error) {
      console.error('Error resetting other services:', error);
    }
  }, 100);
};

// Service interface
export const AuthService = {
  // Authentication
  login: (credentials: LoginCredentials) => mockAuthDB.login(credentials),
  register: (data: RegisterData) => mockAuthDB.register(data),
  logout: () => mockAuthDB.logout(),

  // Session management
  getCurrentSession: () => mockAuthDB.getCurrentSession(),
  validateToken: (token: string) => mockAuthDB.validateToken(token),

  // User profile
  getUserProfile: (userId: string) => mockAuthDB.getUserProfile(userId),
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => mockAuthDB.updateUserProfile(userId, updates),

  // User management
  getAllUsers: () => mockAuthDB.getAllUsers(),
  searchUsers: (query: string) => mockAuthDB.searchUsers(query),
  getUserById: (userId: string) => mockAuthDB.getUserById(userId),
  getUserByEmail: (email: string) => mockAuthDB.getUserByEmail(email),
  updateUserActivity: (userId: string) => mockAuthDB.updateUserActivity(userId),

  // Password management
  changePassword: (userId: string, currentPassword: string, newPassword: string) => 
    mockAuthDB.changePassword(userId, currentPassword, newPassword),
  requestPasswordReset: (email: string) => mockAuthDB.requestPasswordReset(email),
};

export default AuthService;
