import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Notification } from '@/types/notification';

interface ToastContextType {
  notifications: Notification[];
  showToast: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showToast = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 4000,
      createdAt: new Date(),
    };

    setNotifications(prev => [...prev, newNotification]);

    if (!notification.persistent && newNotification.duration) {
      setTimeout(() => {
        hideToast(id);
      }, newNotification.duration);
    }
  };

  const hideToast = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllToasts = () => {
    setNotifications([]);
  };

  const value: ToastContextType = {
    notifications,
    showToast,
    hideToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};