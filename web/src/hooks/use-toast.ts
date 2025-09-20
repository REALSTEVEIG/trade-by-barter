import { useNotification } from '@/contexts/notification-context';

export function useToast() {
  const { addNotification } = useNotification();

  const toast = {
    success: (title: string, message?: string) => {
      addNotification({
        type: 'success',
        title,
        ...(message && { message }),
      });
    },
    error: (title: string, message?: string) => {
      addNotification({
        type: 'error',
        title,
        ...(message && { message }),
      });
    },
    warning: (title: string, message?: string) => {
      addNotification({
        type: 'warning',
        title,
        ...(message && { message }),
      });
    },
    info: (title: string, message?: string) => {
      addNotification({
        type: 'info',
        title,
        ...(message && { message }),
      });
    },
    custom: (notification: Parameters<typeof addNotification>[0]) => {
      addNotification(notification);
    },
  };

  return { toast };
}