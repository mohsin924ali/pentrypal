import { Friend, FriendRequest, SentInvite, User, SocialStats } from '../../shared/types';

// Global type declaration for avatar sync
declare global {
  var SocialServiceSync: ((authUser: any) => Promise<boolean>) | undefined;
}

// Mock database storage for social features
class MockSocialDatabase {
  private currentUserId: string = 'current_user_1'; // Simulate logged-in user
  private users: User[] = [];
  private friends: Friend[] = [];
  private friendRequests: FriendRequest[] = [];
  private sentInvites: SentInvite[] = [];
  private nextId: number = 1;

  constructor() {
    this.resetAllData();
  }

  // Reset all data to clean state
  resetAllData() {
    console.log('🧹 RESETTING ALL SOCIAL DATA - CLEARING CACHE');
    this.currentUserId = 'current_user_1';
    this.users = [];
    this.friends = [];
    this.friendRequests = [];
    this.sentInvites = [];
    this.nextId = 1;
    
    // Add mock users to social service
    this.addMockUsers();
    
    console.log('✅ Social data reset complete');
  }

  // Add mock users for testing
  private addMockUsers() {
    console.log('👥 Adding mock users to social service...');
    
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

    // Add users to social service
    this.users.push(mohsinUser);
    this.users.push(rabiaUser);
    
    // Add sample friends for testing
    this.addSampleFriends();
    
    console.log('✅ Mock users added to social service:');
    console.log('  - Mohsin Ali (mohsin@ali.com)');
    console.log('  - Rabia Ghaffar (rabia@test.com)');
  }

  // Add sample friends for testing
  private addSampleFriends() {
    console.log('👥 Adding sample friends for testing...');
    
    // Mohsin's friends (Rabia is his friend)
    const mohsinFriend: Friend = {
      id: 'friend_1',
      name: 'Rabia Ghaffar',
      email: 'rabia@test.com',
      avatar: '👩‍💼',
      status: 'accepted',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
      isActive: true,
    };

    // Rabia's friends (Mohsin is her friend)
    const rabiaFriend: Friend = {
      id: 'friend_2',
      name: 'Mohsin Ali',
      email: 'mohsin@ali.com',
      avatar: '👨‍💼',
      status: 'accepted',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      lastActiveAt: new Date(Date.now() - 1800000).toISOString(),
      isActive: true,
    };

    // Add friends to the database
    this.friends.push(mohsinFriend);
    this.friends.push(rabiaFriend);
    
    console.log('✅ Sample friends added:');
    console.log('  - Mohsin has Rabia as friend');
    console.log('  - Rabia has Mohsin as friend');
  }

  private initializeSampleData() {
    // Initialize current user
    const currentUser: User = {
      id: this.currentUserId,
      name: 'You',
      email: 'you@pantrypal.com',
      avatar: '👤',
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
      lastActiveAt: new Date().toISOString(),
      isActive: true,
    };

    // Sample users in the system
    const sampleUsers: User[] = [
      currentUser,
      {
        id: 'user_2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@gmail.com',
        avatar: '👩',
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        lastActiveAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        isActive: true,
      },
      {
        id: 'user_3',
        name: 'Mike Chen',
        email: 'mike.chen@outlook.com',
        avatar: '👨',
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        lastActiveAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        isActive: true,
      },
      {
        id: 'user_4',
        name: 'Emma Wilson',
        email: 'emma.wilson@gmail.com',
        avatar: '👩',
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        lastActiveAt: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
        isActive: true,
      },
      {
        id: 'user_5',
        name: 'David Brown',
        email: 'david.brown@hotmail.com',
        avatar: '👨',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        lastActiveAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        isActive: true,
      },
      {
        id: 'user_6',
        name: 'Alex Garcia',
        email: 'alex.garcia@icloud.com',
        avatar: '🧑',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        lastActiveAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        isActive: true,
      },
      {
        id: 'user_7',
        name: 'Lisa Wang',
        email: 'lisa.wang@gmail.com',
        avatar: '👩',
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        lastActiveAt: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
        isActive: true,
      },
    ];

    // Sample existing friends
    const sampleFriends: Friend[] = [
      {
        id: 'friend_1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@gmail.com',
        avatar: '👩',
        status: 'accepted',
        addedAt: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
        mutualLists: 3,
        lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'friend_2',
        name: 'Mike Chen',
        email: 'mike.chen@outlook.com',
        avatar: '👨',
        status: 'accepted',
        addedAt: new Date(Date.now() - 86400000 * 14).toISOString(), // 14 days ago
        mutualLists: 1,
        lastActiveAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    // Sample pending friend requests (incoming)
    const sampleRequests: FriendRequest[] = [
      {
        id: 'request_1',
        fromUserId: 'user_7',
        toUserId: this.currentUserId,
        fromUser: {
          id: 'user_7',
          name: 'Lisa Wang',
          email: 'lisa.wang@gmail.com',
          avatar: '👩',
        },
        toUser: {
          id: this.currentUserId,
          name: 'You',
          email: 'you@pantrypal.com',
          avatar: '👤',
        },
        status: 'pending',
        sentAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      },
    ];

    // Sample sent invites (outgoing)
    const sampleInvites: SentInvite[] = [
      {
        id: 'invite_1',
        email: 'john.doe@yahoo.com',
        invitedByUserId: this.currentUserId,
        status: 'pending',
        sentAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        expiresAt: new Date(Date.now() + 86400000 * 6).toISOString(), // 6 days from now
      },
    ];

    this.users = sampleUsers;
    this.friends = sampleFriends;
    this.friendRequests = sampleRequests;
    this.sentInvites = sampleInvites;
    this.nextId = 100;
  }

  // Simulate async operations
  private async delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== USER OPERATIONS ====================

  // Search for user by complete email address (privacy-focused)
  async searchUserByEmail(email: string): Promise<User | null> {
    await this.delay(500); // Simulate network delay

    // Only return results for complete, valid email addresses
    if (!this.isValidEmail(email)) {
      return null;
    }

    const user = this.users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.id !== this.currentUserId
    );

    return user || null;
  }

  // Get current user info
  async getCurrentUser(): Promise<User | null> {
    await this.delay();
    return this.users.find(u => u.id === this.currentUserId) || null;
  }

  // ==================== FRIENDS OPERATIONS ====================

  // Get all friends of current user
  async getFriends(): Promise<Friend[]> {
    await this.delay();
    const friends = this.friends
      .filter(f => f.userId === this.currentUserId && f.status === 'accepted')
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    
    console.log(`getFriends called for user ${this.currentUserId} - returning ${friends.length} friends`);
    friends.forEach(friend => {
      console.log(`  Friend: ${friend.name} (${friend.email}) - Avatar: ${friend.avatar}`);
    });
    
    return friends;
  }

  // Get friend by ID
  async getFriendById(friendId: string): Promise<Friend | null> {
    await this.delay();
    return this.friends.find(f => f.id === friendId) || null;
  }

  // Remove/unfriend a user
  async removeFriend(friendId: string): Promise<boolean> {
    await this.delay();
    const initialLength = this.friends.length;
    this.friends = this.friends.filter(f => f.id !== friendId);
    return this.friends.length < initialLength;
  }

  // Block a friend
  async blockFriend(friendId: string): Promise<Friend | null> {
    await this.delay();
    const friend = this.friends.find(f => f.id === friendId);
    if (friend) {
      friend.status = 'blocked';
      return friend;
    }
    return null;
  }

  // ==================== FRIEND REQUESTS OPERATIONS ====================

  // Get all pending friend requests (incoming)
  async getFriendRequests(): Promise<FriendRequest[]> {
    await this.delay();
    return this.friendRequests.filter(r => 
      r.toUserId === this.currentUserId && r.status === 'pending'
    ).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  // Get sent friend requests (outgoing)
  async getSentFriendRequests(): Promise<FriendRequest[]> {
    await this.delay();
    console.log('getSentFriendRequests - currentUserId:', this.currentUserId);
    console.log('getSentFriendRequests - all requests:', this.friendRequests.map(r => ({ fromUserId: r.fromUserId, toUserId: r.toUserId, status: r.status })));
    const sentRequests = this.friendRequests.filter(r => 
      r.fromUserId === this.currentUserId && r.status === 'pending'
    );
    console.log('getSentFriendRequests - sent requests count:', sentRequests.length);
    return sentRequests.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  // Send friend request to a user
  async sendFriendRequest(toUserId: string): Promise<FriendRequest> {
    await this.delay();

    const toUser = this.users.find(u => u.id === toUserId);
    const fromUser = this.users.find(u => u.id === this.currentUserId);

    if (!toUser || !fromUser) {
      throw new Error('User not found');
    }

    // Check if request already exists (in either direction)
    const existingRequest = this.friendRequests.find(r => 
      ((r.fromUserId === this.currentUserId && r.toUserId === toUserId) ||
       (r.fromUserId === toUserId && r.toUserId === this.currentUserId)) &&
      r.status === 'pending'
    );

    if (existingRequest) {
      if (existingRequest.fromUserId === this.currentUserId) {
        throw new Error('You have already sent a friend request to this user');
      } else {
        throw new Error('This user has already sent you a friend request');
      }
    }

    // Check if already friends by using the areFriends utility method
    const alreadyFriends = await this.areFriends(toUser.email);
    if (alreadyFriends) {
      throw new Error('Already friends with this user');
    }

    const newRequest: FriendRequest = {
      id: `request_${this.nextId++}`,
      fromUserId: this.currentUserId,
      toUserId: toUserId,
      fromUser: {
        id: fromUser.id,
        name: fromUser.name,
        email: fromUser.email,
        avatar: fromUser.avatar,
      },
      toUser: {
        id: toUser.id,
        name: toUser.name,
        email: toUser.email,
        avatar: toUser.avatar,
      },
      status: 'pending',
      sentAt: new Date().toISOString(),
    };

    this.friendRequests.push(newRequest);
    return newRequest;
  }

  // Accept a friend request
  async acceptFriendRequest(requestId: string): Promise<Friend> {
    await this.delay();

    const request = this.friendRequests.find(r => r.id === requestId);
    if (!request || request.toUserId !== this.currentUserId) {
      throw new Error('Friend request not found');
    }

    // Update request status
    request.status = 'accepted';
    request.respondedAt = new Date().toISOString();

    // Create friend relationship for the receiver (current user)
    const newFriendForReceiver: Friend = {
      id: `friend_${this.nextId++}`,
      name: request.fromUser.name,
      email: request.fromUser.email,
      avatar: request.fromUser.avatar,
      status: 'accepted',
      addedAt: new Date().toISOString(),
      mutualLists: 0,
      lastActiveAt: request.fromUser.id ? 
        this.users.find(u => u.id === request.fromUser.id)?.lastActiveAt : 
        new Date().toISOString(),
      userId: request.toUserId, // This friend belongs to the receiver
    };

    // Create friend relationship for the sender (request sender)
    const newFriendForSender: Friend = {
      id: `friend_${this.nextId++}`,
      name: request.toUser.name,
      email: request.toUser.email,
      avatar: request.toUser.avatar,
      status: 'accepted',
      addedAt: new Date().toISOString(),
      mutualLists: 0,
      lastActiveAt: request.toUser.id ? 
        this.users.find(u => u.id === request.toUser.id)?.lastActiveAt : 
        new Date().toISOString(),
      userId: request.fromUserId, // This friend belongs to the sender
    };

    // Add both friendships
    this.friends.push(newFriendForReceiver, newFriendForSender);

    // Remove from pending requests
    this.friendRequests = this.friendRequests.filter(r => r.id !== requestId);

    return newFriendForReceiver;
  }

  // Decline a friend request
  async declineFriendRequest(requestId: string): Promise<boolean> {
    await this.delay();

    const request = this.friendRequests.find(r => r.id === requestId);
    if (!request || request.toUserId !== this.currentUserId) {
      return false;
    }

    // Update request status
    request.status = 'declined';
    request.respondedAt = new Date().toISOString();

    // Remove from pending requests
    this.friendRequests = this.friendRequests.filter(r => r.id !== requestId);
    return true;
  }

  // ==================== SENT INVITES OPERATIONS ====================

  // Get all sent invites
  async getSentInvites(): Promise<SentInvite[]> {
    await this.delay();
    console.log('getSentInvites - currentUserId:', this.currentUserId);
    console.log('getSentInvites - all invites:', this.sentInvites.map(i => ({ email: i.email, invitedByUserId: i.invitedByUserId })));
    const filteredInvites = this.sentInvites.filter(i => i.invitedByUserId === this.currentUserId);
    console.log('getSentInvites - filtered invites for current user:', filteredInvites.length);
    return filteredInvites.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  // Send email invite to non-user
  async sendEmailInvite(email: string): Promise<SentInvite> {
    await this.delay();

    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email address');
    }

    // Check if user already exists
    const existingUser = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('User already exists. Send friend request instead.');
    }

    // Check if invite already sent
    const existingInvite = this.sentInvites.find(i => 
      i.email.toLowerCase() === email.toLowerCase() && 
      i.invitedByUserId === this.currentUserId &&
      i.status === 'pending'
    );

    if (existingInvite) {
      throw new Error('Invite already sent to this email');
    }

    const newInvite: SentInvite = {
      id: `invite_${this.nextId++}`,
      email: email.toLowerCase(),
      invitedByUserId: this.currentUserId,
      status: 'pending',
      sentAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days
    };

    console.log('sendEmailInvite - creating invite with currentUserId:', this.currentUserId);
    console.log('sendEmailInvite - new invite:', { email: newInvite.email, invitedByUserId: newInvite.invitedByUserId });
    this.sentInvites.push(newInvite);
    console.log('sendEmailInvite - total invites after push:', this.sentInvites.length);
    return newInvite;
  }

  // Cancel a sent invite
  async cancelInvite(inviteId: string): Promise<boolean> {
    await this.delay();
    const initialLength = this.sentInvites.length;
    this.sentInvites = this.sentInvites.filter(i => 
      !(i.id === inviteId && i.invitedByUserId === this.currentUserId)
    );
    return this.sentInvites.length < initialLength;
  }

  // ==================== ANALYTICS & STATS ====================

  // Get social statistics
  async getSocialStats(): Promise<SocialStats> {
    await this.delay();

    const totalFriends = this.friends.filter(f => f.status === 'accepted').length;
    const pendingRequests = this.friendRequests.filter(r => 
      r.toUserId === this.currentUserId && r.status === 'pending'
    ).length;
    const sentInvites = this.sentInvites.filter(i => 
      i.invitedByUserId === this.currentUserId && i.status === 'pending'
    ).length;
    const mutualLists = this.friends.reduce((sum, f) => sum + (f.mutualLists || 0), 0);

    return {
      totalFriends,
      pendingRequests,
      sentInvites,
      mutualLists,
      totalCollaborations: mutualLists, // Could be different metric
    };
  }

  // ==================== UTILITY METHODS ====================

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Check if users are friends
  async areFriends(userEmail: string): Promise<boolean> {
    await this.delay();
    return this.friends.some(f => 
      f.userId === this.currentUserId &&
      f.email.toLowerCase() === userEmail.toLowerCase() && 
      f.status === 'accepted'
    );
  }

  // Check if friend request exists
  async hasRequestPending(userEmail: string): Promise<boolean> {
    await this.delay();
    const user = this.users.find(u => u.email.toLowerCase() === userEmail.toLowerCase());
    if (!user) return false;

    return this.friendRequests.some(r => 
      ((r.fromUserId === this.currentUserId && r.toUserId === user.id) ||
       (r.fromUserId === user.id && r.toUserId === this.currentUserId)) &&
      r.status === 'pending'
    );
  }

  // Check if invite was sent
  async hasInviteSent(email: string): Promise<boolean> {
    await this.delay();
    return this.sentInvites.some(i => 
      i.email.toLowerCase() === email.toLowerCase() && 
      i.invitedByUserId === this.currentUserId &&
      i.status === 'pending'
    );
  }

  // Add user from auth service
  async addUserFromAuth(authUser: any): Promise<boolean> {
    await this.delay();
    try {
      // Check if user already exists
      const existingUser = this.users.find(u => u.email.toLowerCase() === authUser.email.toLowerCase());
      if (existingUser) {
        return true; // User already exists
      }

      // Create new social user from auth user
      const newSocialUser: User = {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        avatar: authUser.avatar || '👤',
        createdAt: authUser.createdAt || new Date().toISOString(),
        lastActiveAt: authUser.lastActiveAt || new Date().toISOString(),
        isActive: authUser.isActive !== undefined ? authUser.isActive : true,
      };

      this.users.push(newSocialUser);
      console.log('Added user to social service:', newSocialUser.email);
      return true;
    } catch (error) {
      console.error('Error adding user to social service:', error);
      return false;
    }
  }

  // Sync user updates from auth service (for avatar/name changes)
  async syncUserFromAuth(authUser: any): Promise<boolean> {
    await this.delay();
    try {
      const existingUserIndex = this.users.findIndex(u => u.id === authUser.id);
      
      if (existingUserIndex !== -1) {
        // Update existing user with new data from auth service
        this.users[existingUserIndex] = {
          ...this.users[existingUserIndex],
          name: authUser.name,
          avatar: authUser.avatar,
          lastActiveAt: authUser.lastActiveAt || new Date().toISOString(),
          isActive: authUser.isActive !== undefined ? authUser.isActive : true,
        };
        
        // Also update any friend records that reference this user
        let updatedFriendsCount = 0;
        this.friends.forEach(friend => {
          if (friend.email.toLowerCase() === authUser.email.toLowerCase()) {
            console.log(`Updating friend record for ${friend.email} - old avatar: ${friend.avatar} -> new avatar: ${authUser.avatar}`);
            friend.name = authUser.name;
            friend.avatar = authUser.avatar;
            friend.lastActiveAt = authUser.lastActiveAt || new Date().toISOString();
            updatedFriendsCount++;
          }
        });
        
        console.log(`Synced user updates to social service: ${authUser.email} (updated ${updatedFriendsCount} friend records)`);
        return true;
      } else {
        // User doesn't exist, add them
        return await this.addUserFromAuth(authUser);
      }
    } catch (error) {
      console.error('Error syncing user to social service:', error);
      return false;
    }
  }

  // Set current user context
  async setCurrentUser(userId: string): Promise<boolean> {
    await this.delay();
    try {
      let user = this.users.find(u => u.id === userId);
      
      // If user doesn't exist, try to get from AuthService and add them
      if (!user) {
        try {
          // Import AuthService dynamically to avoid circular dependency
          const { AuthService } = await import('./authService');
          const authUser = await AuthService.getUserById(userId);
          
          if (authUser) {
            await this.addUserFromAuth(authUser);
            user = this.users.find(u => u.id === userId);
            
            // Add some default friends for the new user (existing users from the system)
            // Limit to prevent performance issues with large user bases
            const defaultFriends = this.users.filter(u => u.id !== userId).slice(0, 2);
            for (const friend of defaultFriends) {
              const newFriend: Friend = {
                id: `friend_${this.nextId++}`,
                name: friend.name,
                email: friend.email,
                avatar: friend.avatar,
                status: 'accepted',
                addedAt: new Date().toISOString(),
                mutualLists: 0,
                lastActiveAt: friend.lastActiveAt,
                userId: userId,
              };
              this.friends.push(newFriend);
            }
          }
        } catch (authError) {
          console.error('Error syncing user from auth service:', authError);
        }
      }
      
      if (user) {
        this.currentUserId = userId;
        console.log('Set current user in social service:', user.email);
        return true;
      }
      console.warn('User not found when setting current user:', userId);
      return false;
    } catch (error) {
      console.error('Error setting current user in social service:', error);
      return false;
    }
  }
}

// Singleton instance
const mockSocialDB = new MockSocialDatabase();

// Service interface following industry standards
export const SocialService = {
  // User operations
  searchUserByEmail: (email: string) => mockSocialDB.searchUserByEmail(email),
  getCurrentUser: () => mockSocialDB.getCurrentUser(),

  // Friends management
  getFriends: () => mockSocialDB.getFriends(),
  getFriendById: (friendId: string) => mockSocialDB.getFriendById(friendId),
  removeFriend: (friendId: string) => mockSocialDB.removeFriend(friendId),
  blockFriend: (friendId: string) => mockSocialDB.blockFriend(friendId),

  // Friend requests
  getFriendRequests: () => mockSocialDB.getFriendRequests(),
  getSentFriendRequests: () => mockSocialDB.getSentFriendRequests(),
  sendFriendRequest: (toUserId: string) => mockSocialDB.sendFriendRequest(toUserId),
  acceptFriendRequest: (requestId: string) => mockSocialDB.acceptFriendRequest(requestId),
  declineFriendRequest: (requestId: string) => mockSocialDB.declineFriendRequest(requestId),

  // Email invites
  getSentInvites: () => mockSocialDB.getSentInvites(),
  sendEmailInvite: (email: string) => mockSocialDB.sendEmailInvite(email),
  cancelInvite: (inviteId: string) => mockSocialDB.cancelInvite(inviteId),

  // Utility & analytics
  getSocialStats: () => mockSocialDB.getSocialStats(),
  areFriends: (userEmail: string) => mockSocialDB.areFriends(userEmail),
  hasRequestPending: (userEmail: string) => mockSocialDB.hasRequestPending(userEmail),
  hasInviteSent: (email: string) => mockSocialDB.hasInviteSent(email),
  
  // User synchronization
  addUserFromAuth: (authUser: any) => mockSocialDB.addUserFromAuth(authUser),
  syncUserFromAuth: (authUser: any) => mockSocialDB.syncUserFromAuth(authUser),
  setCurrentUser: (userId: string) => mockSocialDB.setCurrentUser(userId),
  resetAllData: () => mockSocialDB.resetAllData(),
};

export default SocialService;

// Set up global reference for avatar sync to avoid circular import issues
if (typeof global !== 'undefined') {
  global.SocialServiceSync = SocialService.syncUserFromAuth;
}
