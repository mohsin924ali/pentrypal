// ========================================
// WebSocket Integration Service - Redux Integration
// ========================================

import { store } from '../../application/store';
import { type WebSocketEvent, webSocketService } from '../api';
import {
  addItemFromWebSocket,
  loadShoppingLists,
  updateItemFromWebSocket,
  updateListFromWebSocket,
} from '../../application/store/slices/shoppingListSlice';
import {
  addFriendship,
  addReceivedFriendRequest,
  removeFriendRequest,
} from '../../application/store/slices/socialSlice';
import { websocketLogger } from '../../shared/utils/logger';

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
      websocketLogger.debug('🔌 WebSocket integration already initialized');
      return;
    }

    websocketLogger.debug('🔌 Initializing WebSocket integration with Redux');

    // Set up event listeners
    this.setupEventListeners();

    this.isInitialized = true;
    websocketLogger.debug('✅ WebSocket integration initialized successfully');
  }

  /**
   * Cleanup WebSocket integration
   */
  public cleanup(): void {
    if (!this.isInitialized) {
      return;
    }

    websocketLogger.debug('🧹 Cleaning up WebSocket integration');

    // Remove all event listeners
    webSocketService.removeAllEventListeners();

    this.isInitialized = false;
    websocketLogger.debug('✅ WebSocket integration cleaned up');
  }

  /**
   * Connect to WebSocket with current auth token
   */
  public async connect(): Promise<void> {
    const authState = store.getState().auth;

    if (!authState.isAuthenticated || !authState.tokens?.accessToken) {
      websocketLogger.warn('⚠️ Cannot connect WebSocket: User not authenticated');
      return;
    }

    websocketLogger.debug('🔌 Connecting WebSocket with auth token');
    websocketLogger.debug(
      `🔐 Using access token: ${authState.tokens.accessToken.substring(0, 50)}...`
    );
    webSocketService.setAccessToken(authState.tokens.accessToken);
    await webSocketService.connect();
  }

  /**
   * Reconnect with fresh tokens after token refresh
   */
  public async reconnectWithFreshTokens(): Promise<void> {
    websocketLogger.debug('🔄 Reconnecting WebSocket with refreshed tokens');
    await this.connect();
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    websocketLogger.debug('🔌 Disconnecting WebSocket');
    webSocketService.disconnect();
  }

  /**
   * Join a shopping list room for real-time updates
   */
  public joinListRoom(listId: string): void {
    websocketLogger.debug('🏠 Joining list room:', listId);
    webSocketService.joinRoom(listId);
  }

  /**
   * Leave a shopping list room
   */
  public leaveListRoom(listId: string): void {
    websocketLogger.debug('🏠 Leaving list room:', listId);
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
    websocketLogger.debug('✅ WebSocket connected:', event.data);

    // Auto-join rooms for current shopping lists
    const shoppingListState = store.getState().shoppingList;
    if (shoppingListState.currentList) {
      this.joinListRoom(shoppingListState.currentList.id);
    }
  }

  private handleDisconnected(event: WebSocketEvent): void {
    websocketLogger.debug('❌ WebSocket disconnected:', event.data);
  }

  private handleReconnecting(event: WebSocketEvent): void {
    websocketLogger.debug('🔄 WebSocket reconnecting:', event.data);
  }

  private handleError(event: WebSocketEvent): void {
    websocketLogger.error('❌ WebSocket error:', event.data);
  }

  private handleListUpdate(event: WebSocketEvent): void {
    websocketLogger.debug('📝 List update received:', event.data);

    try {
      const listData = event.data?.data;
      if (!listData?.id) {
        websocketLogger.warn('Invalid list update data:', event.data);
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

      websocketLogger.debug('✅ List update applied to Redux store');
    } catch (error) {
      websocketLogger.error('Failed to handle list update:', error);
    }
  }

  private handleItemUpdate(event: WebSocketEvent): void {
    websocketLogger.debug('📦 Item update received:', event.data);

    try {
      const itemData = event.data?.data;
      const listId = event.data?.list_id;

      if (!itemData?.id || !listId) {
        websocketLogger.warn('Invalid item update data:', event.data);
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
      } as any;

      // Dispatch based on action type
      if (itemData.action === 'created') {
        store.dispatch(addItemFromWebSocket({ listId, item }));
      } else {
        store.dispatch(updateItemFromWebSocket({ listId, item }));
      }

      websocketLogger.debug('✅ Item update applied to Redux store');
    } catch (error) {
      websocketLogger.error('Failed to handle item update:', error);
    }
  }

  private handleFriendRequest(event: WebSocketEvent): void {
    websocketLogger.debug('👥 Friend request received:', event.data);

    try {
      const requestData = event.data?.data;
      if (!requestData?.id) {
        websocketLogger.warn('Invalid friend request data:', event.data);
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
        status: requestData.status,
        message: requestData.message,
        createdAt: new Date(requestData.created_at || Date.now()).toISOString(),
        updatedAt: new Date(requestData.created_at || Date.now()).toISOString(),
        respondedAt: undefined,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      } as any;

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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastInteractionAt: undefined,
          mutedUntil: undefined,
        } as any;

        store.dispatch(addFriendship(friendship));
      } else if (requestData.action === 'declined') {
        store.dispatch(removeFriendRequest(requestData.id));
      }

      websocketLogger.debug('✅ Friend request applied to Redux store');
    } catch (error) {
      websocketLogger.error('Failed to handle friend request:', error);
    }
  }

  private handleFriendStatusUpdate(event: WebSocketEvent): void {
    websocketLogger.debug('👥 Friend status update received:', event.data);
    // TODO: Implement friend status updates (online/offline)
  }

  private handleNotification(event: WebSocketEvent): void {
    websocketLogger.debug('🔔 Notification received:', event.data);

    try {
      const notificationData = event.data?.data;
      if (!notificationData) {
        websocketLogger.warn('Invalid notification data:', event.data);
        return;
      }

      // Import notification service
      import('./notificationService')
        .then(notificationModule => {
          const notificationService = notificationModule.default;
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

          websocketLogger.debug('✅ Notification processed:', notificationData.type);
        })
        .catch(error => {
          websocketLogger.error('Failed to import notification service:', error);
        });
    } catch (error) {
      websocketLogger.error('Failed to handle notification:', error);
    }
  }

  private handleTypingIndicator(event: WebSocketEvent): void {
    websocketLogger.debug('⌨️ Typing indicator received:', event.data);
    // TODO: Implement typing indicator UI updates
  }

  private handleOnlineStatusUpdate(event: WebSocketEvent): void {
    websocketLogger.debug('🟢 Online status update received:', event.data);
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
export const reconnectWebSocketWithFreshTokens = () =>
  webSocketIntegration.reconnectWithFreshTokens();
export const joinListRoom = (listId: string) => webSocketIntegration.joinListRoom(listId);
export const leaveListRoom = (listId: string) => webSocketIntegration.leaveListRoom(listId);
export const sendTypingIndicator = (listId: string, isTyping: boolean) =>
  webSocketIntegration.sendTypingIndicator(listId, isTyping);
export const requestOnlineStatus = (friendIds: string[]) =>
  webSocketIntegration.requestOnlineStatus(friendIds);
export const cleanupWebSocket = () => webSocketIntegration.cleanup();
