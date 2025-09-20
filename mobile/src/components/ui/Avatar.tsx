import React from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { User } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '@/constants';

export interface AvatarProps {
  source?: { uri: string } | number;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  badgeColor?: string;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  showBadge = false,
  badgeColor = COLORS.secondary.DEFAULT,
  style,
}) => {
  const getSizeStyle = () => {
    const sizes = {
      xs: { width: 24, height: 24, borderRadius: 12 },
      sm: { width: 32, height: 32, borderRadius: 16 },
      md: { width: 40, height: 40, borderRadius: 20 },
      lg: { width: 56, height: 56, borderRadius: 28 },
      xl: { width: 80, height: 80, borderRadius: 40 },
    };
    return sizes[size];
  };

  const getFontSize = () => {
    const fontSizes = {
      xs: 10,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 28,
    };
    return fontSizes[size];
  };

  const getBadgeSize = () => {
    const badgeSizes = {
      xs: { width: 8, height: 8, borderRadius: 4 },
      sm: { width: 10, height: 10, borderRadius: 5 },
      md: { width: 12, height: 12, borderRadius: 6 },
      lg: { width: 16, height: 16, borderRadius: 8 },
      xl: { width: 20, height: 20, borderRadius: 10 },
    };
    return badgeSizes[size];
  };

  const getInitials = () => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const containerStyle = [
    styles.container,
    getSizeStyle(),
    style,
  ];

  const imageStyle: ImageStyle = {
    ...getSizeStyle(),
    ...styles.image,
  };

  const placeholderStyle = [
    styles.placeholder,
    getSizeStyle(),
  ];

  const textStyle = [
    styles.placeholderText,
    { fontSize: getFontSize() },
  ];

  const badgeStyle = [
    styles.badge,
    getBadgeSize(),
    { backgroundColor: badgeColor },
  ];

  return (
    <View style={containerStyle}>
      {source ? (
        <Image
          source={source}
          style={imageStyle}
          resizeMode="cover"
        />
      ) : (
        <View style={placeholderStyle}>
          {name ? (
            <Text style={textStyle}>{getInitials()}</Text>
          ) : (
            <User
              size={getFontSize()}
              color={COLORS.neutral.gray}
            />
          )}
        </View>
      )}
      
      {showBadge && (
        <View style={badgeStyle} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: '#F3F4F6',
  },
  placeholder: {
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    fontWeight: '600',
    color: COLORS.neutral.dark,
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});

export default Avatar;