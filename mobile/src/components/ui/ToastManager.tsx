import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotification } from '@/contexts/notification-context';
import Toast from './Toast';
import { SPACING } from '@/constants';

const ToastManager: React.FC = () => {
  const { notifications, removeNotification } = useNotification();
  const insets = useSafeAreaInsets();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { top: insets.top + SPACING.sm }]}>
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
  },
});

export default ToastManager;