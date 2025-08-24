// ========================================
// WebSocket Integration Service - Redux Integration
// ========================================

import { store } from '../../application/store';
import { webSocketService, type WebSocketEvent } from '../api';
import {
  updateListFromWebSocket,
  updateItemFromWebSocket,
  addItemFromWebSocket,
  loadShoppingLists,
} from '../../application/store/slices/shoppingListSlice';
import {
  addReceivedFriendRequest,
  removeFriendRequest,
  addFriendship,
} from '../../application/store/slices/socialSlice';

// ========================================
// WebSocket Integration Class
// ========================================

export class WebSocketIntegration {
  private isInitialized = false;

  /**
   * Initialize WebSocket integration with Redux
   */
  public initialize(): void {
    if (this.isInitialized) {
      console.log('🔌 WebSocket integration already initialized');
      return;
    }

    console.log('🔌 Initializing WebSocket integration with Redux');

    // Set up event listeners
    this.setupEventListeners();

    this.isInitialized = true;
    console.log('✅ WebSocket integration initialized successfully');
  }

  /**
   * Cleanup WebSocket integration
   */
  public cleanup(): void {
    if (!this.isInitialized) {
      return;
    }

    console.log('🧹 Cleaning up WebSocket integration');

    // Remove all event listeners
    webSocketService.removeAllEventListeners();

    this.isInitialized = false;
    console.log('✅ WebSocket integration cleaned up');
  }

  /**
   * Connect to WebSocket with current auth token
   */
  public async connect(): Promise<void> {
    const authState = store.getState().auth;

    if (!authState.isAuthenticated || !authState.tokens?.accessToken) {
      console.warn('⚠️ Cannot connect WebSocket: User not authenticated');
      return;
    }

    console.log('🔌 Connecting WebSocket with auth token');
    webSocketService.setAccessToken(authState.tokens.accessToken);
    await webSocketService.connect();
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    console.log('🔌 Disconnecting WebSocket');
    webSocketService.disconnect();
  }

  /**
   * Join a shopping list room for real-time updates
   */
  public joinListRoom(listId: string): void {
    console.log('🏠 Joining list room:', listId);
    webSocketService.joinRoom(listId);
  }

  /**
   * Leave a shopping list room
   */
  public leaveListRoom(listId: string): void {
    console.log('🏠 Leaving list room:', listId);
    webSocketService.leaveRoom(listId);
  }

  /**
   * Send typing indicator for a list
   */
  public sendTypingIndicator(listId: string, isTyping: boolean): void {
    webSocketService.sendTypingIndicator(listId, isTyping);
  }

  /**
   * Request online status for friends
   */
  public requestOnlineStatus(friendIds: string[]): void {
    webSocketService.requestOnlineStatus(friendIds);
  }

  // ========================================
  // Private Methods
  // ========================================

  private setupEventListeners(): void {
    // Connection events
    webSocketService.addEventListener('connected', this.handleConnected.bind(this));
    webSocketService.addEventListener('disconnected', this.handleDisconnected.bind(this));
    webSocketService.addEventListener('reconnecting', this.handleReconnecting.bind(this));
    webSocketService.addEventListener('error', this.handleError.bind(this));

    // Shopping list events
    webSocketService.addEventListener('list_update', this.handleListUpdate.bind(this));
    webSocketService.addEventListener('item_update', this.handleItemUpdate.bind(this));

    // Social events
    webSocketService.addEventListener('friend_request', this.handleFriendRequest.bind(this));
    webSocketService.addEventListener(
      'friend_status_update',
      this.handleFriendStatusUpdate.bind(this)
    );

    // Other events
    webSocketService.addEventListener('notification', this.handleNotification.bind(this));
    webSocketService.addEventListener('typing_indicator', this.handleTypingIndicator.bind(this));
    webSocketService.addEventListener(
      'online_status_update',
      this.handleOnlineStatusUpdate.bind(this)
    );
  }

  private handleConnected(event: WebSocketEvent): void {
    console.log('✅ WebSocket connected:', event.data);

    // Auto-join rooms for current shopping lists
    const shoppingListState = store.getState().shoppingList;
    if (shoppingListState.currentList) {
      this.joinListRoom(shoppingListState.currentList.id);
    }
  }

  private handleDisconnected(event: WebSocketEvent): void {
    console.log('❌ WebSocket disconnected:', event.data);
  }

  private handleReconnecting(event: WebSocketEvent): void {
    console.log('🔄 WebSocket reconnecting:', event.data);
  }

  private handleError(event: WebSocketEvent): void {
    console.error('❌ WebSocket error:', event.data);
  }

  private handleListUpdate(event: WebSocketEvent): void {
    console.log('📝 List update received:', event.data);

    try {
      const listData = event.data?.data;
      if (!listData?.id) {
        console.warn('Invalid list update data:', event.data);
        return;
      }

      // Convert backend data to frontend format and dispatch to Redux
      const listUpdate = {
        id: listData.id,
        name: listData.name,
        status: listData.status,
        updatedAt: new Date().toISOString(),
      };

      store.dispatch(updateListFromWebSocket(listUpdate));

      console.log('✅ List update applied to Redux store');
    } catch (error) {
      console.error('Failed to handle list update:', error);
    }
  }

  private handleItemUpdate(event: WebSocketEvent): void {
    console.log('📦 Item update received:', event.data);

    try {
      const itemData = event.data?.data;
      const listId = event.data?.list_id;

      if (!itemData?.id || !listId) {
        console.warn('Invalid item update data:', event.data);
        return;
      }

      // Convert backend data to frontend format
      const item = {
        id: itemData.id,
        name: itemData.name,
        quantity: itemData.quantity || 1,
        unit: itemData.unit || 'pcs',
        completed: itemData.completed,
        assignedTo: itemData.assigned_to,
        price: itemData.estimated_price,
        purchasedAmount: itemData.actual_price,
        notes: itemData.notes,
        category: {
          id: 'other',
          name: 'Other',
          color: '#636e72',
        },
        description: undefined,
        barcode: undefined,
        icon: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Dispatch based on action type
      if (itemData.action === 'created') {
        store.dispatch(addItemFromWebSocket({ listId, item }));
      } else {
        store.dispatch(updateItemFromWebSocket({ listId, item }));
      }

      console.log('✅ Item update applied to Redux store');
    } catch (error) {
      console.error('Failed to handle item update:', error);
    }
  }

  private handleFriendRequest(event: WebSocketEvent): void {
    console.log('👥 Friend request received:', event.data);

    try {
      const requestData = event.data?.data;
      if (!requestData?.id) {
        console.warn('Invalid friend request data:', event.data);
        return;
      }

      // Convert backend data to frontend format
      const friendRequest = {
        id: requestData.id,
        fromUserId: requestData.from_user_id,
        toUserId: requestData.to_user_id,
        fromUser: {
          id: requestData.from_user_id,
          name: 'Friend',
          email: '',
        } as any,
        toUser: {
          id: requestData.to_user_id,
          name: 'You',
          email: '',
        } as any,
        status: requestData.status as any,
        message: requestData.message,
        createdAt: new Date(requestData.created_at || Date.now()),
        updatedAt: new Date(requestData.created_at || Date.now()),
        respondedAt: undefined,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      // Handle different friend request actions
      if (requestData.action === 'sent') {
        store.dispatch(addReceivedFriendRequest(friendRequest));
      } else if (requestData.action === 'accepted') {
        // Remove from requests and add to friends
        store.dispatch(removeFriendRequest(requestData.id));

        // Create friendship object (simplified)
        const friendship = {
          id: `friendship_${Date.now()}`,
          user1Id: requestData.from_user_id,
          user2Id: requestData.to_user_id,
          user1: { id: requestData.from_user_id, name: 'Friend', email: '' } as any,
          user2: { id: requestData.to_user_id, name: 'You', email: '' } as any,
          status: 'active' as any,
          initiatedBy: requestData.from_user_id,
          sharedListsCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastInteractionAt: undefined,
          mutedUntil: undefined,
        };

        store.dispatch(addFriendship(friendship));
      } else if (requestData.action === 'declined') {
        store.dispatch(removeFriendRequest(requestData.id));
      }

      console.log('✅ Friend request applied to Redux store');
    } catch (error) {
      console.error('Failed to handle friend request:', error);
    }
  }

  private handleFriendStatusUpdate(event: WebSocketEvent): void {
    console.log('👥 Friend status update received:', event.data);
    // TODO: Implement friend status updates (online/offline)
  }

  private handleNotification(event: WebSocketEvent): void {
    console.log('🔔 Notification received:', event.data);

    try {
      const notificationData = event.data?.data;
      if (!notificationData) {
        console.warn('Invalid notification data:', event.data);
        return;
      }

      // Import notification service
      import('../../../infrastructure/services/notificationService').then(({ notificationService }) => {
        // Handle different notification types
        switch (notificationData.type) {
          case 'list_shared':
            notificationService.notifyListShared(
              notificationData.list_name || 'Unknown List',
              notificationData.inviter_name || 'Someone'
            );
            
            // Refresh shopping lists to show the new shared list
            store.dispatch(loadShoppingLists({ status: 'active', limit: 50 }));
            break;

          case 'friend_request':
            // Already handled in handleFriendRequest
            break;

          default:
            // Generic notification
            notificationService.addNotification({
              type: notificationData.type || 'general',
              title: notificationData.title || 'Notification',
              message: notificationData.message || 'You have a new notification',
              priority: 'medium',
              data: notificationData,
            });
            break;
        }

        console.log('✅ Notification processed:', notificationData.type);
      }).catch(error => {
        console.error('Failed to import notification service:', error);
      });
    } catch (error) {
      console.error('Failed to handle notification:', error);
    }
  }

  private handleTypingIndicator(event: WebSocketEvent): void {
    console.log('⌨️ Typing indicator received:', event.data);
    // TODO: Implement typing indicator UI updates
  }

  private handleOnlineStatusUpdate(event: WebSocketEvent): void {
    console.log('🟢 Online status update received:', event.data);
    // TODO: Update friend online status in Redux
  }

  // ========================================
  // Utility Methods
  // ========================================

  /**
   * Get WebSocket connection status
   */
  public getConnectionStatus() {
    return webSocketService.getConnectionStatus();
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return webSocketService.getConnectionStatus().isConnected;
  }

  /**
   * Get joined rooms
   */
  public getJoinedRooms(): string[] {
    return webSocketService.getConnectionStatus().joinedRooms;
  }
}

// ========================================
// Default Export
// ========================================

export const webSocketIntegration = new WebSocketIntegration();

// ========================================
// Convenience Functions
// ========================================

export const initializeWebSocket = () => webSocketIntegration.initialize();
export const connectWebSocket = () => webSocketIntegration.connect();
export const disconnectWebSocket = () => webSocketIntegration.disconnect();
export const joinListRoom = (listId: string) => webSocketIntegration.joinListRoom(listId);
export const leaveListRoom = (listId: string) => webSocketIntegration.leaveListRoom(listId);
export const sendTypingIndicator = (listId: string, isTyping: boolean) =>
  webSocketIntegration.sendTypingIndicator(listId, isTyping);
export const requestOnlineStatus = (friendIds: string[]) =>
  webSocketIntegration.requestOnlineStatus(friendIds);
export const cleanupWebSocket = () => webSocketIntegration.cleanup();
