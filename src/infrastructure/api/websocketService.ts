// ========================================
// WebSocket Service - Real-time Communication
// ========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../../shared/constants';
import type {
  BackendWebSocketMessage,
  BackendListUpdateMessage,
  BackendItemUpdateMessage,
  BackendFriendRequestMessage,
  BackendTokens,
} from '../../shared/types/backend';

// ========================================
// WebSocket Event Types
// ========================================

export type WebSocketEventType =
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'message'
  | 'error'
  | 'list_update'
  | 'item_update'
  | 'friend_request'
  | 'friend_status_update'
  | 'notification'
  | 'typing_indicator'
  | 'online_status_update';

export interface WebSocketEvent<T = any> {
  readonly type: WebSocketEventType;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp: Date;
}

export type WebSocketEventHandler<T = any> = (event: WebSocketEvent<T>) => void;

// ========================================
// WebSocket Configuration
// ========================================

interface WebSocketConfig {
  readonly url: string;
  readonly reconnectInterval: number;
  readonly maxReconnectAttempts: number;
  readonly heartbeatInterval: number;
  readonly connectionTimeout: number;
}

const DEFAULT_CONFIG: WebSocketConfig = {
  url: API_CONFIG.websocketUrl,
  reconnectInterval: 3000, // 3 seconds
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000, // 30 seconds
  connectionTimeout: 10000, // 10 seconds
};

// ========================================
// WebSocket Service Class
// ========================================

export class WebSocketService {
  private config: WebSocketConfig;
  private ws: WebSocket | null = null;
  private accessToken: string | null = null;
  private isConnected = false;
  private isReconnecting = false;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private connectionTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map();
  private messageQueue: BackendWebSocketMessage[] = [];
  private joinedRooms: Set<string> = new Set();

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeToken();
  }

  // ========================================
  // Initialization and Token Management
  // ========================================

  private async initializeToken(): Promise<void> {
    try {
      const tokens = await AsyncStorage.getItem(STORAGE_KEYS.authTokens);
      if (tokens) {
        console.log('🔍 DEBUG: WebSocket raw tokens from storage:', tokens);

        // Check if tokens look like valid JSON
        if (!tokens.startsWith('{') || !tokens.endsWith('}')) {
          console.warn(
            '🚨 DEBUG: WebSocket tokens appear to be corrupted (not JSON format), clearing...'
          );
          await AsyncStorage.removeItem(STORAGE_KEYS.authTokens);
          return;
        }

        const parsedTokens: BackendTokens = JSON.parse(tokens);

        // Validate token structure
        if (!parsedTokens.access_token) {
          console.warn('🚨 DEBUG: WebSocket tokens missing access_token, clearing...');
          await AsyncStorage.removeItem(STORAGE_KEYS.authTokens);
          return;
        }

        this.accessToken = parsedTokens.access_token;
        console.log('🔍 DEBUG: Successfully initialized WebSocket token from storage');
      }
    } catch (error) {
      console.error('Failed to initialize WebSocket token:', error);
      // Clear corrupted tokens
      await AsyncStorage.removeItem(STORAGE_KEYS.authTokens);
    }
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;

    // Reconnect with new token if currently connected
    if (this.isConnected) {
      this.disconnect();
      this.connect();
    }
  }

  public clearAccessToken(): void {
    this.accessToken = null;
    this.disconnect();
  }

  // ========================================
  // Connection Management
  // ========================================

  public async connect(): Promise<void> {
    if (this.isConnected || this.isReconnecting) {
      return;
    }

    if (!this.accessToken) {
      await this.initializeToken();
      if (!this.accessToken) {
        console.error('No access token available for WebSocket connection');
        return;
      }
    }

    try {
      const wsUrl = `${this.config.url}/${this.accessToken}`;
      this.ws = new WebSocket(wsUrl);

      // Set connection timeout
      this.connectionTimer = setTimeout(() => {
        if (!this.isConnected) {
          console.error('WebSocket connection timeout');
          this.handleConnectionError(new Error('Connection timeout'));
        }
      }, this.config.connectionTimeout);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

      console.log('🔌 Attempting WebSocket connection...');
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleConnectionError(error as Error);
    }
  }

  public disconnect(): void {
    this.isConnected = false;
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    this.joinedRooms.clear();

    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }

    // Close WebSocket connection
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Client disconnect');
      }
      this.ws = null;
    }

    this.emitEvent('disconnected', {});
    console.log('🔌 WebSocket disconnected');
  }

  private attemptReconnect(): void {
    if (this.isReconnecting || this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    console.log(
      `🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`
    );
    this.emitEvent('reconnecting', { attempt: this.reconnectAttempts });

    this.reconnectTimer = setTimeout(
      () => {
        this.isReconnecting = false;
        this.connect();
      },
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1)
    ); // Exponential backoff
  }

  // ========================================
  // WebSocket Event Handlers
  // ========================================

  private handleOpen(): void {
    console.log('✅ WebSocket connected successfully');

    this.isConnected = true;
    this.isReconnecting = false;
    this.reconnectAttempts = 0;

    // Clear connection timeout
    if (this.connectionTimer) {
      clearTimeout(this.connectionTimer);
      this.connectionTimer = null;
    }

    // Start heartbeat
    this.startHeartbeat();

    // Process queued messages
    this.processMessageQueue();

    // Rejoin rooms
    this.rejoinRooms();

    this.emitEvent('connected', {});
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: BackendWebSocketMessage = JSON.parse(event.data);
      console.log('📨 WebSocket message received:', message.type);

      // Handle different message types
      switch (message.type) {
        case 'list_update':
          this.emitEvent('list_update', message as BackendListUpdateMessage);
          break;
        case 'item_update':
          this.emitEvent('item_update', message as BackendItemUpdateMessage);
          break;
        case 'friend_request':
          this.emitEvent('friend_request', message as BackendFriendRequestMessage);
          break;
        case 'friend_status_update':
          this.emitEvent('friend_status_update', message);
          break;
        case 'notification':
          this.emitEvent('notification', message);
          break;
        case 'typing_indicator':
          this.emitEvent('typing_indicator', message);
          break;
        case 'online_status_update':
          this.emitEvent('online_status_update', message);
          break;
        case 'pong':
          // Heartbeat response - no action needed
          break;
        case 'room_joined':
        case 'room_left':
        case 'connection_established':
          // Connection management messages
          console.log(`🔔 ${message.type}:`, message.data);
          break;
        default:
          console.log('📨 Unknown message type:', message.type);
          this.emitEvent('message', message);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('🔌 WebSocket connection closed:', event.code, event.reason);

    this.isConnected = false;
    this.stopHeartbeat();

    // Don't attempt to reconnect if it was a clean close
    if (event.code !== 1000 && event.code !== 1001) {
      this.attemptReconnect();
    }

    this.emitEvent('disconnected', { code: event.code, reason: event.reason });
  }

  private handleError(event: Event): void {
    console.error('❌ WebSocket error:', event);
    this.handleConnectionError(new Error('WebSocket error'));
  }

  private handleConnectionError(error: Error): void {
    this.emitEvent('error', { error: error.message });

    if (this.isConnected) {
      this.isConnected = false;
      this.attemptReconnect();
    }
  }

  // ========================================
  // Message Sending
  // ========================================

  public sendMessage(message: Partial<BackendWebSocketMessage>): void {
    const fullMessage: BackendWebSocketMessage = {
      type: message.type || 'message',
      data: message.data,
      timestamp: new Date().toISOString(),
      ...message,
    };

    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(fullMessage));
        console.log('📤 WebSocket message sent:', fullMessage.type);
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        this.queueMessage(fullMessage);
      }
    } else {
      console.log('📦 Queueing message (not connected):', fullMessage.type);
      this.queueMessage(fullMessage);
    }
  }

  private queueMessage(message: BackendWebSocketMessage): void {
    this.messageQueue.push(message);

    // Limit queue size
    if (this.messageQueue.length > 100) {
      this.messageQueue.shift();
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  // ========================================
  // Room Management
  // ========================================

  public joinRoom(roomId: string): void {
    this.joinedRooms.add(roomId);
    this.sendMessage({
      type: 'join_list_room',
      data: { list_id: roomId },
    });
  }

  public leaveRoom(roomId: string): void {
    this.joinedRooms.delete(roomId);
    this.sendMessage({
      type: 'leave_list_room',
      data: { list_id: roomId },
    });
  }

  private rejoinRooms(): void {
    this.joinedRooms.forEach(roomId => {
      this.sendMessage({
        type: 'join_list_room',
        data: { list_id: roomId },
      });
    });
  }

  // ========================================
  // Typing Indicators
  // ========================================

  public sendTypingIndicator(listId: string, isTyping: boolean): void {
    this.sendMessage({
      type: 'typing_indicator',
      data: {
        list_id: listId,
        is_typing: isTyping,
      },
    });
  }

  // ========================================
  // Online Status
  // ========================================

  public requestOnlineStatus(friendIds: string[]): void {
    this.sendMessage({
      type: 'get_online_status',
      data: { friend_ids: friendIds },
    });
  }

  // ========================================
  // Heartbeat Management
  // ========================================

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected) {
        this.sendMessage({
          type: 'ping',
          data: { timestamp: new Date().toISOString() },
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  // ========================================
  // Event Management
  // ========================================

  public addEventListener<T = any>(
    eventType: WebSocketEventType,
    handler: WebSocketEventHandler<T>
  ): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  public removeEventListener<T = any>(
    eventType: WebSocketEventType,
    handler: WebSocketEventHandler<T>
  ): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    }
  }

  public removeAllEventListeners(eventType?: WebSocketEventType): void {
    if (eventType) {
      this.eventHandlers.delete(eventType);
    } else {
      this.eventHandlers.clear();
    }
  }

  private emitEvent<T = any>(eventType: WebSocketEventType, data: T): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const event: WebSocketEvent<T> = {
        type: eventType,
        data,
        timestamp: new Date(),
      };

      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in WebSocket event handler for ${eventType}:`, error);
        }
      });
    }
  }

  // ========================================
  // Status and Utility Methods
  // ========================================

  public getConnectionStatus(): {
    isConnected: boolean;
    isReconnecting: boolean;
    reconnectAttempts: number;
    joinedRooms: string[];
    queuedMessages: number;
  } {
    return {
      isConnected: this.isConnected,
      isReconnecting: this.isReconnecting,
      reconnectAttempts: this.reconnectAttempts,
      joinedRooms: Array.from(this.joinedRooms),
      queuedMessages: this.messageQueue.length,
    };
  }

  public clearMessageQueue(): void {
    this.messageQueue = [];
  }

  public getQueuedMessages(): BackendWebSocketMessage[] {
    return [...this.messageQueue];
  }

  // ========================================
  // Cleanup
  // ========================================

  public destroy(): void {
    this.disconnect();
    this.removeAllEventListeners();
    this.messageQueue = [];
  }
}

// ========================================
// Default Export
// ========================================

export const webSocketService = new WebSocketService();

// ========================================
// Convenience Functions
// ========================================

export const connectWebSocket = () => webSocketService.connect();
export const disconnectWebSocket = () => webSocketService.disconnect();
export const joinListRoom = (listId: string) => webSocketService.joinRoom(listId);
export const leaveListRoom = (listId: string) => webSocketService.leaveRoom(listId);
export const sendTypingIndicator = (listId: string, isTyping: boolean) =>
  webSocketService.sendTypingIndicator(listId, isTyping);
export const requestOnlineStatus = (friendIds: string[]) =>
  webSocketService.requestOnlineStatus(friendIds);
