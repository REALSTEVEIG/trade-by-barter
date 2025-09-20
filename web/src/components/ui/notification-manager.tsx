'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useNotification } from '@/contexts/notification-context';
import { NotificationToast } from './notification';

export function NotificationManager() {
  const { notifications, removeNotification } = useNotification();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const notificationContainer = document.getElementById('notification-portal');
  if (!notificationContainer) return null;

  return createPortal(
    <>
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </>,
    notificationContainer
  );
}