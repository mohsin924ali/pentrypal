/**
 * Global Notification Service
 * Handles all types of notifications across the entire application
 */

// Notification types
export interface Notification {
  id: string;
  type: 'friend_request' | 'list_shared' | 'list_activity' | 'general' | 'system' | 'social' | 'auth';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  userId?: string; // To filter notifications by user
}

// Global Notification Service - Singleton Pattern
class GlobalNotificationService {
  private static instance: GlobalNotificationService;
  private notifications: Notification[] = [];
  private nextId: number = 1;
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private currentUserId: string | null = null;

  static getInstance(): GlobalNotificationService {
    if (!GlobalNotificationService.instance) {
      GlobalNotificationService.instance = new GlobalNotificationService();
    }
    return GlobalNotificationService.instance;
  }

  // Set current user for filtering notifications
  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  // Add a new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'userId'>): void {
    const newNotification: Notification = {
      ...notification,
      id: `notification_${this.nextId++}`,
      timestamp: new Date().toISOString(),
      isRead: false,
      userId: this.currentUserId || 'default',
    };

    this.notifications.unshift(newNotification);
    
    // Keep only last 100 notifications per user
    const userNotifications = this.notifications.filter(n => n.userId === newNotification.userId);
    if (userNotifications.length > 100) {
      const toRemove = userNotifications.slice(100);
      this.notifications = this.notifications.filter(n => !toRemove.includes(n));
    }

    console.log('🔔 New notification added:', notification.title);
    this.notifyListeners();
  }

  // Get all notifications for current user
  getNotifications(): Notification[] {
    return this.notifications
      .filter(n => n.userId === (this.currentUserId || 'default'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Get unread notifications for current user
  getUnreadNotifications(): Notification[] {
    return this.getNotifications().filter(n => !n.isRead);
  }

  // Get unread count for current user
  getUnreadCount(): number {
    return this.getUnreadNotifications().length;
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.notifyListeners();
    }
  }

  // Mark all notifications as read for current user
  markAllAsRead(): void {
    this.notifications
      .filter(n => n.userId === (this.currentUserId || 'default'))
      .forEach(n => n.isRead = true);
    this.notifyListeners();
  }

  // Delete notification
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.notifyListeners();
  }

  // Clear all notifications for current user
  clearAll(): void {
    this.notifications = this.notifications.filter(n => n.userId !== (this.currentUserId || 'default'));
    this.notifyListeners();
  }

  // Subscribe to notification updates
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    // Immediately call with current notifications
    listener(this.getNotifications());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    const userNotifications = this.getNotifications();
    this.listeners.forEach(listener => listener(userNotifications));
  }

  // =========================== SPECIFIC NOTIFICATION TYPES ===========================

  // Friend & Social Notifications
  notifyFriendRequest(fromUserName: string, fromUserEmail: string): void {
    this.addNotification({
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${fromUserName} (${fromUserEmail}) sent you a friend request`,
      priority: 'high',
      data: { fromUserName, fromUserEmail, type: 'friend_request' }
    });
  }

  notifyFriendRequestAccepted(friendName: string): void {
    this.addNotification({
      type: 'social',
      title: 'Friend Request Accepted',
      message: `${friendName} accepted your friend request`,
      priority: 'medium',
      data: { friendName, type: 'friend_accepted' }
    });
  }

  // List Sharing Notifications
  notifyListShared(listName: string, sharedByName: string): void {
    this.addNotification({
      type: 'list_shared',
      title: 'List Shared With You',
      message: `${sharedByName} shared "${listName}" list with you`,
      priority: 'high',
      data: { listName, sharedByName, type: 'list_shared' }
    });
  }

  notifyContributorAdded(listName: string, contributorName: string): void {
    this.addNotification({
      type: 'list_activity',
      title: 'Contributor Added',
      message: `${contributorName} was added as a contributor to "${listName}"`,
      priority: 'medium',
      data: { listName, contributorName, type: 'contributor_added' }
    });
  }

  // List Activity Notifications
  notifyListItemAdded(listName: string, itemName: string, addedByName: string): void {
    this.addNotification({
      type: 'list_activity',
      title: 'Item Added to List',
      message: `${addedByName} added "${itemName}" to "${listName}"`,
      priority: 'low',
      data: { listName, itemName, addedByName, type: 'item_added' }
    });
  }

  notifyListItemCompleted(listName: string, itemName: string, completedByName: string): void {
    this.addNotification({
      type: 'list_activity',
      title: 'Item Completed',
      message: `${completedByName} completed "${itemName}" in "${listName}"`,
      priority: 'low',
      data: { listName, itemName, completedByName, type: 'item_completed' }
    });
  }

  notifyListCompleted(listName: string): void {
    this.addNotification({
      type: 'list_activity',
      title: 'List Completed! 🎉',
      message: `All items in "${listName}" have been completed`,
      priority: 'medium',
      data: { listName, type: 'list_completed' }
    });
  }

  notifyListDeleted(listName: string, deletedByName: string): void {
    this.addNotification({
      type: 'list_activity',
      title: 'List Deleted',
      message: `${deletedByName} deleted the list "${listName}"`,
      priority: 'medium',
      data: { listName, deletedByName, type: 'list_deleted' }
    });
  }

  // Authentication Notifications
  notifySuccessfulLogin(deviceInfo?: string): void {
    this.addNotification({
      type: 'auth',
      title: 'Successful Login',
      message: `You successfully logged in${deviceInfo ? ` from ${deviceInfo}` : ''}`,
      priority: 'low',
      data: { deviceInfo, type: 'login_success' }
    });
  }

  notifyAccountCreated(): void {
    this.addNotification({
      type: 'auth',
      title: 'Welcome to PantryPal! 🎉',
      message: 'Your account has been created successfully. Start creating lists and collaborating with friends!',
      priority: 'high',
      data: { type: 'account_created' }
    });
  }

  notifyPasswordChanged(): void {
    this.addNotification({
      type: 'auth',
      title: 'Password Changed',
      message: 'Your password has been successfully updated',
      priority: 'medium',
      data: { type: 'password_changed' }
    });
  }

  // System Notifications
  notifySystemMaintenance(maintenanceDate: string): void {
    this.addNotification({
      type: 'system',
      title: 'Scheduled Maintenance',
      message: `System maintenance is scheduled for ${maintenanceDate}. The app may be temporarily unavailable.`,
      priority: 'high',
      data: { maintenanceDate, type: 'system_maintenance' }
    });
  }

  notifyAppUpdate(version: string): void {
    this.addNotification({
      type: 'system',
      title: 'App Update Available',
      message: `Version ${version} is now available with new features and improvements!`,
      priority: 'medium',
      data: { version, type: 'app_update' }
    });
  }

  // General Notifications
  notifyGeneral(title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium', data?: any): void {
    this.addNotification({
      type: 'general',
      title,
      message,
      priority,
      data: { ...data, type: 'general' }
    });
  }

  // Utility method to simulate some initial notifications for testing
  addTestNotifications(): void {
    if (this.notifications.length === 0) {
      this.notifyAccountCreated();
      setTimeout(() => {
        this.notifyFriendRequest('John Doe', 'john@example.com');
      }, 1000);
      setTimeout(() => {
        this.notifyListShared('Weekly Groceries', 'Jane Smith');
      }, 2000);
    }
  }
}

// Export singleton instance
export const NotificationService = GlobalNotificationService.getInstance();
export default NotificationService;
