'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Bell, 
  MessageCircle, 
  Users,
  Info,
  X,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth, withAuth } from '@/contexts/auth-context';
import { notificationsApi } from '@/lib/api';

interface Notification {
  id: string;
  userId: string;
  type: 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'message' | 'trade_completed' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

function NotificationsPageComponent(): React.ReactElement {
  const router = useRouter();
  const { user: _user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await notificationsApi.getNotifications();
      setNotifications(response.data as Notification[]);
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      setError(error.response?.data?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      alert('Failed to mark notifications as read');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate based on notification data
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else if (notification.metadata?.listingId) {
      router.push(`/listings/${notification.metadata.listingId}`);
    } else if (notification.metadata?.chatId) {
      router.push(`/chat`);
    } else if (notification.metadata?.offerId) {
      router.push(`/offers`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'offer_received':
      case 'offer_accepted':
      case 'offer_rejected':
        return Users;
      case 'message':
        return MessageCircle;
      case 'trade_completed':
        return CheckCircle2;
      case 'system':
        return Info;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'offer_received':
        return 'bg-blue-100 text-blue-600';
      case 'offer_accepted':
      case 'trade_completed':
        return 'bg-green-100 text-green-600';
      case 'offer_rejected':
        return 'bg-red-100 text-red-600';
      case 'message':
        return 'bg-purple-100 text-purple-600';
      case 'system':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} unread</p>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <Button variant="outline" onClick={loadNotifications} className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-600">
                You'll see notifications for messages, trades, and updates here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              
              return (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                    !notification.isRead ? 'border-l-4 border-l-primary-500 bg-primary-50' : ''
                  }`}
                >
                  <CardContent 
                    className="p-4" 
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium text-gray-900 ${!notification.isRead ? 'font-semibold' : ''}`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              {!notification.isRead && (
                                <Badge variant="secondary" className="text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const NotificationsPage = withAuth(NotificationsPageComponent);
export default NotificationsPage;