'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Notification } from '@/types/notification';
import { Button } from './button';

interface NotificationToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const notificationStyles = {
  success: {
    container: 'bg-white/90 backdrop-blur-lg border border-secondary/20 shadow-xl',
    accent: 'bg-gradient-to-r from-secondary to-secondary/80',
    icon: 'text-white',
    title: 'text-neutral-dark',
    message: 'text-neutral-gray',
    glow: 'shadow-secondary/25',
  },
  error: {
    container: 'bg-white/90 backdrop-blur-lg border border-red-500/20 shadow-xl',
    accent: 'bg-gradient-to-r from-red-500 to-red-600',
    icon: 'text-white',
    title: 'text-neutral-dark',
    message: 'text-neutral-gray',
    glow: 'shadow-red-500/25',
  },
  warning: {
    container: 'bg-white/90 backdrop-blur-lg border border-accent/20 shadow-xl',
    accent: 'bg-gradient-to-r from-accent to-orange-500',
    icon: 'text-white',
    title: 'text-neutral-dark',
    message: 'text-neutral-gray',
    glow: 'shadow-accent/25',
  },
  info: {
    container: 'bg-white/90 backdrop-blur-lg border border-primary/20 shadow-xl',
    accent: 'bg-gradient-to-r from-primary to-blue-600',
    icon: 'text-white',
    title: 'text-neutral-dark',
    message: 'text-neutral-gray',
    glow: 'shadow-primary/25',
  },
};

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const styles = notificationStyles[notification.type];
  const IconComponent = iconMap[notification.type];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl animate-slide-in transition-all duration-500 hover:scale-[1.02] group',
        styles.container,
        styles.glow
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Glassmorphism effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* Accent bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-1', styles.accent)} />
      
      <div className="relative flex items-start p-5">
        {/* Icon with modern gradient background */}
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
          styles.accent
        )}>
          <IconComponent className={cn('h-5 w-5', styles.icon)} />
        </div>
        
        <div className="ml-4 flex-1 min-w-0">
          <h4 className={cn('text-sm font-semibold leading-5', styles.title)}>
            {notification.title}
          </h4>
          {notification.message && (
            <p className={cn('mt-1 text-sm leading-5', styles.message)}>
              {notification.message}
            </p>
          )}
          {notification.action && (
            <div className="mt-3 flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={notification.action.onClick}
                className="text-xs font-medium border-neutral-gray/20 hover:border-neutral-gray/40 hover:bg-neutral-gray/5"
              >
                {notification.action.label}
              </Button>
            </div>
          )}
        </div>
        
        {/* Enhanced close button */}
        <div className="ml-4 flex-shrink-0">
          <button
            className="group/close inline-flex rounded-lg p-2 text-neutral-gray/60 hover:text-neutral-dark hover:bg-neutral-gray/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            onClick={() => onClose(notification.id)}
            aria-label="Close notification"
          >
            <X className="h-4 w-4 group-hover/close:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>
      
      {/* Progress bar for auto-dismiss notifications */}
      {!notification.persistent && notification.duration && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-gray/20">
          <div
            className={cn('h-full', styles.accent, 'animate-pulse')}
            style={{
              animation: `shrink ${notification.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
}

export function NotificationContainer() {
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full"
      aria-live="polite"
      aria-label="Notifications"
    >
      <div id="notification-portal" />
    </div>
  );
}