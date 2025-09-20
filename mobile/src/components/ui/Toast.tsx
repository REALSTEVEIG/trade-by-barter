import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Notification } from '@/types/notification';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS } from '@/constants';

interface ToastProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const notificationStyles = {
  success: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: COLORS.secondary.DEFAULT,
    accentColor: COLORS.secondary.DEFAULT,
    iconColor: '#FFFFFF',
  },
  error: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: COLORS.status.error,
    accentColor: COLORS.status.error,
    iconColor: '#FFFFFF',
  },
  warning: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: COLORS.accent.DEFAULT,
    accentColor: COLORS.accent.DEFAULT,
    iconColor: '#FFFFFF',
  },
  info: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: COLORS.primary.DEFAULT,
    accentColor: COLORS.primary.DEFAULT,
    iconColor: '#FFFFFF',
  },
};

const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const slideAnim = new Animated.Value(-screenWidth);
  const style = notificationStyles[notification.type];

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [slideAnim]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -screenWidth,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose(notification.id);
    });
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'i';
      default:
        return 'i';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* Glassmorphism overlay */}
      <View style={styles.overlay} />
      
      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: style.accentColor }]} />
      
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: style.accentColor }]}>
          <Text style={styles.icon}>{getIcon()}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          {notification.message && (
            <Text style={styles.message}>{notification.message}</Text>
          )}
          {notification.action && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: style.borderColor }]}
              onPress={notification.action.onPress}
            >
              <Text style={[styles.actionText, { color: style.accentColor }]}>{notification.action.label}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      
      {/* Progress indicator for auto-dismiss */}
      {!notification.persistent && notification.duration && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: style.accentColor }]} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    paddingLeft: SPACING.lg + 4, // Account for accent bar
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  icon: {
    color: '#FFFFFF',
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold as any,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold as any,
    color: COLORS.neutral.dark,
    marginBottom: 2,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray,
    lineHeight: 18,
  },
  actionButton: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold as any,
  },
  closeButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  closeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.neutral.gray,
    fontWeight: FONT_WEIGHTS.medium as any,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  progressBar: {
    height: '100%',
    width: '100%',
  },
});

export default Toast;