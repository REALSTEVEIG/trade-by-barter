import React from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { COLORS } from '@/constants';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  style,
  disabled = false,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
    };

    // Padding styles
    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      sm: { padding: 8 },
      md: { padding: 16 },
      lg: { padding: 20 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {},
      elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4, // Android shadow
      },
      outlined: {
        borderWidth: 1,
        borderColor: COLORS.neutral.border,
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...variantStyles[variant],
      ...(disabled && { opacity: 0.6 }),
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyle(), style]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.9}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};


export default Card;