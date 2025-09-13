import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, TYPOGRAPHY } from '@/constants';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 32 },
      md: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
      lg: { paddingHorizontal: 20, paddingVertical: 16, minHeight: 52 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? '#9CA3AF' : COLORS.primary.DEFAULT,
      },
      secondary: {
        backgroundColor: disabled ? '#9CA3AF' : COLORS.secondary.DEFAULT,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: disabled ? '#9CA3AF' : COLORS.primary.DEFAULT,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
      danger: {
        backgroundColor: disabled ? '#9CA3AF' : '#EF4444',
      },
      success: {
        backgroundColor: disabled ? '#9CA3AF' : COLORS.secondary.DEFAULT,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.6 }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontFamily: TYPOGRAPHY.fontFamily.inter,
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size styles
    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: TYPOGRAPHY.fontSize.sm },
      md: { fontSize: TYPOGRAPHY.fontSize.base },
      lg: { fontSize: TYPOGRAPHY.fontSize.lg },
    };

    // Variant text colors
    const variantTextColors: Record<string, string> = {
      primary: '#FFFFFF',
      secondary: '#FFFFFF',
      outline: disabled ? '#9CA3AF' : COLORS.primary.DEFAULT,
      ghost: disabled ? '#9CA3AF' : COLORS.primary.DEFAULT,
      danger: '#FFFFFF',
      success: '#FFFFFF',
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      color: variantTextColors[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary.DEFAULT : '#FFFFFF'}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), textStyle, ...(icon ? [{ marginLeft: 8 }] : [])]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};


export default Button;