import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/contexts/toast-context';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const { notifications, hideToast } = useToast();
  const insets = useSafeAreaInsets();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { top: insets.top + 10 }]} pointerEvents="box-none">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={hideToast}
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
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
});

export default ToastContainer;