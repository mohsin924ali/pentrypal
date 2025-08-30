// ========================================
// Global Notification Service - Enhanced Implementation
// ========================================

import type { Notification } from '../../shared/types/lists';

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
    console.log(`📱 Notification service set to user: ${userId}`);
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  // Add a new notification
  addNotification(
    notification: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'userId'>
  ): void {
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
      console.log(`📖 Marked notification as read: ${notification.title}`);
      this.notifyListeners();
    }
  }

  // Mark all notifications as read for current user
  markAllAsRead(): void {
    const updated = this.notifications.filter(
      n => n.userId === (this.currentUserId || 'default') && !n.isRead
    );

    updated.forEach(n => (n.isRead = true));

    if (updated.length > 0) {
      console.log(`📖 Marked ${updated.length} notifications as read`);
      this.notifyListeners();
    }
  }

  // Delete a specific notification
  deleteNotification(notificationId: string): void {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const deleted = this.notifications.splice(index, 1)[0];
      this.notifyListeners();
    }
  }

  // Clear all notifications for current user
  clearAll(): void {
    const beforeCount = this.notifications.length;
    this.notifications = this.notifications.filter(
      n => n.userId !== (this.currentUserId || 'default')
    );
    const deletedCount = beforeCount - this.notifications.length;

    if (deletedCount > 0) {
      console.log(`🗑️ Cleared ${deletedCount} notifications`);
      this.notifyListeners();
    }
  }

  // Subscribe to notification updates
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);

    // Immediately call with current notifications
    listener(this.getNotifications());

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index !== -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    const currentNotifications = this.getNotifications();
    this.listeners.forEach(listener => {
      try {
        listener(currentNotifications);
      } catch (error) {
        console.error('Error notifying notification listener:', error);
      }
    });
  }

  // Predefined notification methods for common scenarios

  // Friend request notifications
  notifyFriendRequest(fromUserName: string, fromUserId: string): void {
    this.addNotification({
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${fromUserName} sent you a friend request`,
      priority: 'medium',
      data: { fromUserId, fromUserName },
    });
  }

  notifyFriendRequestAccepted(userName: string): void {
    this.addNotification({
      type: 'social',
      title: 'Friend Request Accepted',
      message: `${userName} accepted your friend request`,
      priority: 'medium',
      data: { userName },
    });
  }

  // List sharing notifications
  notifyListShared(listName: string, sharedByName: string): void {
    this.addNotification({
      type: 'list_shared',
      title: 'List Shared With You',
      message: `${sharedByName} shared "${listName}" with you`,
      priority: 'high',
      data: { listName, sharedByName },
    });
  }

  notifyContributorAdded(listName: string, contributorName: string): void {
    this.addNotification({
      type: 'list_activity',
      title: 'Contributor Added',
      message: `${contributorName} was added to "${listName}"`,
      priority: 'low',
      data: { listName, contributorName },
    });
  }

  notifyContributorRemoved(listName: string, contributorName: string): void {
    this.addNotification({
      type: 'list_activity',
      title: 'Contributor Removed',
      message: `${contributorName} was removed from "${listName}"`,
      priority: 'low',
      data: { listName, contributorName },
    });
  }

  // List activity notifications
  notifyItemAdded(listName: string, itemName: string, addedByName: string): void {
    this.addNotification({
      type: 'list_activity',
      title: 'Item Added',
      message: `${addedByName} added "${itemName}" to "${listName}"`,
      priority: 'low',
      data: { listName, itemName, addedByName },
    });
  }

  notifyItemCompleted(listName: string, itemName: string, completedByName: string): void {
    this.addNotification({
      type: 'list_activity',
      title: 'Item Completed',
      message: `${completedByName} completed "${itemName}" in "${listName}"`,
      priority: 'low',
      data: { listName, itemName, completedByName },
    });
  }

  notifyItemAssigned(
    listName: string,
    itemName: string,
    assignedToName: string,
    assignedByName: string
  ): void {
    this.addNotification({
      type: 'list_activity',
      title: 'Item Assigned',
      message: `${assignedByName} assigned "${itemName}" to ${assignedToName} in "${listName}"`,
      priority: 'medium',
      data: { listName, itemName, assignedToName, assignedByName },
    });
  }

  notifyListCompleted(listName: string, completedByName: string): void {
    this.addNotification({
      type: 'list_activity',
      title: 'List Completed',
      message: `${completedByName} completed the list "${listName}"`,
      priority: 'high',
      data: { listName, completedByName },
    });
  }

  // System notifications
  notifySystemUpdate(title: string, message: string): void {
    this.addNotification({
      type: 'system',
      title,
      message,
      priority: 'medium',
    });
  }

  notifyError(title: string, message: string): void {
    this.addNotification({
      type: 'system',
      title,
      message,
      priority: 'high',
    });
  }

  // General notifications
  notifyGeneral(
    title: string,
    message: string,
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): void {
    this.addNotification({
      type: 'general',
      title,
      message,
      priority,
    });
  }
}

// Export singleton instance
const NotificationService = GlobalNotificationService.getInstance();
export default NotificationService;
