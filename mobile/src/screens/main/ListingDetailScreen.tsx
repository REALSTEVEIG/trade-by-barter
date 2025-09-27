import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import {
  ArrowLeft,
  Heart,
  Share as ShareIcon,
  Edit,
  Trash2,
  Image as ImageIcon,
  X,
  MapPin,
  Clock,
  AlertCircle,
  User,
  MessageCircle,
  Users
} from 'lucide-react-native';
import { AppStackParamList } from '@/navigation';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  formatNaira,
  formatTimeAgo,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '@/constants';
import { useToast } from '@/contexts/toast-context';
import { useAuth } from '@/contexts/auth-context';
import { listingsApi } from '@/lib/api';
import Button from '@/components/ui/Button';

type ListingDetailRouteProp = RouteProp<AppStackParamList, 'ListingDetail'>;

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  priceInKobo: number;
  images: string[];
  state: string;
  city: string;
  specificLocation?: string;
  acceptsCash: boolean;
  acceptsSwap: boolean;
  isSwapOnly: boolean;
  swapPreferences?: string[];
  isActive: boolean;
  createdAt: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    profilePicture?: string;
    verified: boolean;
  };
  isFavorited?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

const ListingDetailScreen: React.FC = () => {
  const route = useRoute<ListingDetailRouteProp>();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { user } = useAuth();
  const { listingId } = route.params;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setIsLoading(true);
      const response = await listingsApi.getListing(listingId);
      setListing(response.data as Listing);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || ERROR_MESSAGES.NOT_FOUND;
      setError(errorMessage);
      showToast({
        type: 'error',
        title: 'Failed to load listing',
        message: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!listing) return;
    
    try {
      await listingsApi.toggleFavorite(listing.id);
      setListing(prev => prev ? { ...prev, isFavorited: !prev.isFavorited } : null);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to update favorite',
        message: 'Please try again later',
        duration: 3000,
      });
    }
  };

  const handleShare = async () => {
    if (!listing) return;
    
    try {
      await Share.share({
        message: `Check out this item: ${listing.title}\n\nPrice: ${formatNaira(listing.priceInKobo / 100)}\nLocation: ${listing.city}, ${listing.state}`,
        title: listing.title,
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Failed to share',
        message: 'Unable to share this listing',
        duration: 3000,
      });
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    
    showToast({
      type: 'warning',
      title: 'Delete Listing',
      message: 'Are you sure you want to delete this listing? This action cannot be undone.',
      duration: 0,
      action: {
        label: 'Delete',
        onPress: async () => {
          try {
            setIsDeleting(true);
            await listingsApi.deleteListing(listing.id);
            showToast({
              type: 'success',
              title: 'Listing deleted',
              message: SUCCESS_MESSAGES.LISTING_DELETED,
              duration: 3000,
            });
            navigation.goBack();
          } catch (error: any) {
            showToast({
              type: 'error',
              title: 'Failed to delete listing',
              message: error.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR,
              duration: 4000,
            });
          } finally {
            setIsDeleting(false);
          }
        }
      }
    });
  };

  const handleEdit = () => {
    if (listing) {
      showToast({
        type: 'info',
        title: 'Coming Soon',
        message: 'Editing functionality will be available soon!',
        duration: 3000,
      });
    }
  };

  const handleMakeOffer = () => {
    if (listing) {
      showToast({
        type: 'info',
        title: 'Coming Soon',
        message: 'Making offers will be available soon!',
        duration: 3000,
      });
    }
  };

  const handleContact = () => {
    if (listing) {
      showToast({
        type: 'info',
        title: 'Coming Soon',
        message: 'Chat functionality will be available soon!',
        duration: 3000,
      });
    }
  };

  const renderImageGallery = () => {
    if (!listing?.images || listing.images.length === 0) {
      return (
        <View style={styles.noImageContainer}>
          <ImageIcon size={48} color={COLORS.neutral.gray} />
          <Text style={styles.noImageText}>No images available</Text>
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={() => setShowImageModal(true)}>
          <Image
            source={{ uri: listing.images[currentImageIndex] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
        
        {listing.images.length > 1 && (
          <>
            <View style={styles.imageIndicator}>
              <Text style={styles.imageIndicatorText}>
                {currentImageIndex + 1} / {listing.images.length}
              </Text>
            </View>
            
            <ScrollView
              horizontal
              style={styles.thumbnailContainer}
              showsHorizontalScrollIndicator={false}
            >
              {listing.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentImageIndex(index)}
                  style={[
                    styles.thumbnail,
                    currentImageIndex === index && styles.thumbnailActive
                  ]}
                >
                  <Image
                    source={{ uri: image }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    );
  };

  const renderImageModal = () => (
    <Modal visible={showImageModal} transparent>
      <View style={styles.imageModalContainer}>
        <View style={styles.imageModalHeader}>
          <Text style={styles.imageModalTitle}>
            {currentImageIndex + 1} / {listing?.images.length || 0}
          </Text>
          <TouchableOpacity onPress={() => setShowImageModal(false)}>
            <X size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={listing?.images || []}
          horizontal
          pagingEnabled
          initialScrollIndex={currentImageIndex}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setCurrentImageIndex(index);
          }}
        />
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading listing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={COLORS.status.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            size="md"
          />
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = user?.id === listing.owner.id;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <ArrowLeft size={24} color={COLORS.neutral.dark} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleFavoriteToggle}
            style={styles.headerButton}
          >
            <Heart
              size={24}
              color={listing.isFavorited ? COLORS.status.error : COLORS.neutral.dark}
              fill={listing.isFavorited ? COLORS.status.error : "transparent"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleShare}
            style={styles.headerButton}
          >
            <ShareIcon size={24} color={COLORS.neutral.dark} />
          </TouchableOpacity>
          
          {isOwner && (
            <>
              <TouchableOpacity 
                onPress={handleEdit}
                style={styles.headerButton}
              >
                <Edit size={24} color={COLORS.neutral.dark} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleDelete}
                style={styles.headerButton}
                disabled={isDeleting}
              >
                <Trash2 size={24} color={COLORS.status.error} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Images */}
        {renderImageGallery()}

        {/* Title and Price */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{listing.title}</Text>
          <Text style={styles.price}>{formatNaira(listing.priceInKobo / 100)}</Text>
          
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{listing.category.replace('_', ' ')}</Text>
            </View>
            <View style={[styles.badge, styles.conditionBadge]}>
              <Text style={styles.badgeText}>{listing.condition.replace('_', ' ')}</Text>
            </View>
          </View>
          
          {/* Trade Options */}
          <View style={styles.tradeOptionsContainer}>
            {listing.acceptsCash && (
              <View style={[styles.tradeBadge, styles.cashBadge]}>
                <Text style={styles.tradeBadgeText}>Cash accepted</Text>
              </View>
            )}
            {listing.acceptsSwap && (
              <View style={[styles.tradeBadge, styles.swapBadge]}>
                <Text style={styles.tradeBadgeText}>
                  {listing.isSwapOnly ? 'Swap only' : 'Swap accepted'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Location and Date */}
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <MapPin size={16} color={COLORS.neutral.gray} />
            <Text style={styles.infoText}>
              {listing.specificLocation ? `${listing.specificLocation}, ` : ''}
              {listing.city}, {listing.state}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Clock size={16} color={COLORS.neutral.gray} />
            <Text style={styles.infoText}>
              Posted {formatTimeAgo(listing.createdAt)}
            </Text>
          </View>
        </View>

        {/* Description */}
        {listing.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </View>
        )}

        {/* Swap Preferences */}
        {listing.swapPreferences && listing.swapPreferences.length > 0 && (
          <View style={styles.swapSection}>
            <Text style={styles.sectionTitle}>Looking for in exchange</Text>
            <View style={styles.swapPreferences}>
              {listing.swapPreferences.map((preference, index) => (
                <View key={index} style={styles.swapPreference}>
                  <Text style={styles.swapPreferenceText}>{preference}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Owner */}
        <View style={styles.ownerSection}>
          <Text style={styles.sectionTitle}>Posted by</Text>
          <View style={styles.ownerInfo}>
            <View style={styles.avatar}>
              {listing.owner.profilePicture ? (
                <Image 
                  source={{ uri: listing.owner.profilePicture }} 
                  style={styles.avatarImage} 
                />
              ) : (
                <User size={24} color={COLORS.primary.DEFAULT} />
              )}
            </View>
            
            <View style={styles.ownerDetails}>
              <Text style={styles.ownerName}>
                {listing.owner.displayName || `${listing.owner.firstName} ${listing.owner.lastName}`}
                {listing.owner.verified && (
                  <Text style={styles.verifiedBadge}> ✓</Text>
                )}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!isOwner && (
        <View style={styles.actionButtons}>
          <Button
            title="Message"
            onPress={handleContact}
            variant="primary"
            size="lg"
            style={styles.actionButton}
            icon={<MessageCircle size={20} color="white" />}
          />
          
          <Button
            title="Make Offer"
            onPress={handleMakeOffer}
            variant="outline"
            size="lg"
            style={styles.actionButton}
            icon={<Users size={20} color={COLORS.primary.DEFAULT} />}
          />
        </View>
      )}

      {renderImageModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    marginTop: SPACING.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.status.error,
    textAlign: 'center',
    marginVertical: SPACING.md,
  },
  imageContainer: {
    backgroundColor: COLORS.neutral.light,
  },
  noImageContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.neutral.light,
  },
  noImageText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    marginTop: SPACING.sm,
  },
  mainImage: {
    width: screenWidth,
    height: 250,
  },
  imageIndicator: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageIndicatorText: {
    color: 'white',
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  thumbnailContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: SPACING.sm,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: COLORS.primary.DEFAULT,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  imageModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: 50,
    paddingBottom: SPACING.sm,
  },
  imageModalTitle: {
    color: 'white',
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  fullScreenImage: {
    width: screenWidth,
    height: '100%',
  },
  titleSection: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
    marginBottom: SPACING.sm,
  },
  price: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.primary.DEFAULT,
    marginBottom: SPACING.md,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  badge: {
    backgroundColor: COLORS.neutral.light,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 16,
  },
  conditionBadge: {
    backgroundColor: COLORS.secondary[100],
  },
  badgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.dark,
    textTransform: 'capitalize',
  },
  tradeOptionsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  tradeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 16,
  },
  cashBadge: {
    backgroundColor: COLORS.status.success + '20',
  },
  swapBadge: {
    backgroundColor: COLORS.primary[100],
  },
  tradeBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.dark,
    fontWeight: '500',
  },
  infoSection: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    marginLeft: SPACING.sm,
  },
  descriptionSection: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.dark,
    lineHeight: 22,
  },
  swapSection: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  swapPreferences: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  swapPreference: {
    backgroundColor: COLORS.primary[100],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 16,
  },
  swapPreferenceText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary.DEFAULT,
  },
  ownerSection: {
    padding: SPACING.md,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: COLORS.neutral.dark,
  },
  verifiedBadge: {
    color: COLORS.status.info,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral.border,
  },
  actionButton: {
    flex: 1,
  },
});

export default ListingDetailScreen;