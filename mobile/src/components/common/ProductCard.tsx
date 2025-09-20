import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { ImageIcon, Heart, MapPin } from 'lucide-react-native';
import { Listing } from '@/types';
import { COLORS, TYPOGRAPHY } from '@/constants';
import Card from '@/components/ui/Card';

export interface ProductCardProps {
  listing: Listing;
  onPress: () => void;
  onFavorite?: () => void;
  variant?: 'grid' | 'list';
  style?: ViewStyle;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  listing,
  onPress,
  onFavorite,
  variant = 'grid',
}) => {
  const formatPrice = (listing: Listing) => {
    // For items that might have estimated values or are for trade
    if (listing.wantedItems && listing.wantedItems.length > 0) {
      return 'Trade';
    }
    // Assuming there's a price field or estimated value
    return `₦${(15000).toLocaleString()}`; // Placeholder - would come from API
  };

  const getImageSource = () => {
    if (listing.images && listing.images.length > 0) {
      return { uri: listing.images[0] };
    }
    // Return null for placeholder - we'll handle this in render
    return null;
  };

  const getCardStyle = (): ViewStyle => {
    if (variant === 'list') {
      return {
        flexDirection: 'row',
        marginBottom: 12,
      };
    }
    return {
      width: '48%',
      marginBottom: 16,
    };
  };

  const getImageStyle = (): ImageStyle => {
    if (variant === 'list') {
      return {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
      };
    }
    return {
      width: '100%',
      height: 120,
      borderRadius: 8,
      backgroundColor: '#F3F4F6',
      marginBottom: 8,
    };
  };

  const getContentStyle = (): ViewStyle => {
    if (variant === 'list') {
      return {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
      };
    }
    return {};
  };

  return (
    <Card
      style={getCardStyle()}
      onPress={onPress}
      variant="elevated"
      padding="sm"
    >
      <View style={variant === 'list' ? { flexDirection: 'row' } : {}}>
        <View style={{ position: 'relative' }}>
          {getImageSource() ? (
            <Image
              source={getImageSource()!}
              style={getImageStyle()}
              resizeMode="cover"
            />
          ) : (
            <View style={[getImageStyle(), styles.placeholderImage]}>
              <ImageIcon
                size={variant === 'list' ? 24 : 32}
                color={COLORS.neutral.light}
              />
            </View>
          )}
          
          {/* Favorite button - positioned on image */}
          {onFavorite && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={onFavorite}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Heart
                size={16}
                color={listing.isFavorited ? '#EF4444' : '#6B7280'}
                fill={listing.isFavorited ? '#EF4444' : 'transparent'}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={getContentStyle()}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>
          
          <Text style={styles.price}>
            {formatPrice(listing)}
          </Text>
          
          <View style={styles.locationContainer}>
            <MapPin
              size={12}
              color={COLORS.neutral.gray}
            />
            <Text style={styles.location} numberOfLines={1}>
              {listing.location.city}, {listing.location.state}
            </Text>
          </View>

          {/* Additional info for list variant */}
          {variant === 'list' && (
            <View style={styles.metaInfo}>
              <Text style={styles.condition}>
                {listing.condition}
              </Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.views}>
                {listing.views} views
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    marginBottom: 4,
    lineHeight: 18,
  },
  price: {
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '700',
    color: COLORS.primary.DEFAULT,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    marginLeft: 2,
    flex: 1,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  condition: {
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    textTransform: 'capitalize',
  },
  separator: {
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    marginHorizontal: 4,
  },
  views: {
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
});

export default ProductCard;