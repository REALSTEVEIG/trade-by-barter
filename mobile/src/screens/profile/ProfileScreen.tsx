import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Star,
  Settings,
  RotateCw,
  Camera,
  CheckCircle,
  Eye
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import { COLORS, TYPOGRAPHY, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants';
import { authApi, listingsApi } from '@/lib/api';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
}

interface UserListing {
  id: string;
  title: string;
  category: string;
  price: number;
  images: string[];
  status: string;
  createdAt: string;
  isSwapOnly: boolean;
  isCashOnly: boolean;
}

type TabType = 'listings' | 'trades' | 'reviews';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('listings');
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<UserListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingListings, setIsLoadingListings] = useState(false);

  useEffect(() => {
    loadProfile();
    loadListings();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authApi.getProfile();
      setProfile(response.data as UserProfile);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load profile data',
        duration: 3000,
      });
    }
  };

  const loadListings = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoadingListings(true);
      const response = await listingsApi.getListings({
        page: 1,
        limit: 50,
        userId: user.id
      });
      
      let listingsData = [];
      const responseData = response.data as any;
      if (responseData?.listings) {
        listingsData = responseData.listings;
      } else if (Array.isArray(responseData)) {
        listingsData = responseData;
      } else if (Array.isArray(response)) {
        listingsData = response as any;
      }
      
      setListings(listingsData || []);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load your listings',
        duration: 3000,
      });
      setListings([]);
    } finally {
      setIsLoading(false);
      setIsLoadingListings(false);
    }
  };


  const handleAvatarPress = () => {
    showToast({
      type: 'info',
      title: 'Update Profile Picture',
      message: 'Choose how you want to update your profile picture',
      duration: 0,
      action: {
        label: 'Take Photo',
        onPress: () => openImagePicker('camera'),
      },
    });
    
    // Also show gallery option
    setTimeout(() => {
      showToast({
        type: 'info',
        title: 'Or Choose from Gallery',
        message: 'Select an existing photo',
        duration: 4000,
        action: {
          label: 'Gallery',
          onPress: () => openImagePicker('library'),
        },
      });
    }, 100);
  };

  const openImagePicker = async (source: 'camera' | 'library') => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        await updateProfilePicture(result.assets[0]);
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Image picker error',
        message: 'Failed to open image picker',
        duration: 3000,
      });
    }
  };

  const updateProfilePicture = async (asset: ImagePicker.ImagePickerAsset) => {
    setIsUpdatingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: `profile_${Date.now()}.jpg`
      } as any);

      await authApi.updateProfile(formData);
      await refreshUser();
      
      showToast({
        type: 'success',
        title: 'Profile updated',
        message: SUCCESS_MESSAGES.PROFILE_UPDATED,
        duration: 3000,
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Profile update failed',
        message: error.response?.data?.message || ERROR_MESSAGES.SERVER_ERROR,
        duration: 4000,
      });
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login' as any);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to logout. Please try again.',
        duration: 3000,
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        color={i < Math.floor(rating) ? '#FCD34D' : '#E5E7EB'}
        fill={i < Math.floor(rating) ? '#FCD34D' : '#E5E7EB'}
      />
    ));
  };

  const formatNaira = (amount: number) => {
    return `₦${(amount / 100).toLocaleString()}`;
  };

  const displayListings = listings || [];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <TouchableOpacity
              onPress={handleAvatarPress}
              style={styles.avatarContainer}
              disabled={isUpdatingAvatar}
            >
              <Avatar
                source={user?.avatar ? { uri: user.avatar } : undefined}
                name={user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
                size="xl"
                style={styles.avatar}
              />
              <View style={styles.cameraIcon}>
                {isUpdatingAvatar ? (
                  <RotateCw size={16} color="white" />
                ) : (
                  <Camera size={16} color="white" />
                )}
              </View>
              {(profile?.isVerified || user?.isVerified) && (
                <View style={styles.verifiedBadge}>
                  <CheckCircle size={20} color={COLORS.primary.DEFAULT} />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.name}>
              {profile?.firstName || user?.firstName} {profile?.lastName || user?.lastName}
            </Text>
            
            <Text style={styles.location}>
              {(() => {
                const location = profile?.location || user?.location;
                if (typeof location === 'string') {
                  return location;
                } else if (location && typeof location === 'object' && 'state' in location) {
                  return `${location.city}, ${location.state}`;
                }
                return 'Lagos, Nigeria';
              })()}
            </Text>

            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(profile?.rating || 4.8)}
              </View>
              <Text style={styles.ratingText}>
                {profile?.rating || 4.8} ({profile?.reviewCount || 125} reviews)
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <Button
                title="Edit profile"
                onPress={() => showToast({
                  type: 'info',
                  title: 'Coming Soon',
                  message: 'Profile editing will be available soon!',
                  duration: 3000,
                })}
                variant="outline"
                size="sm"
                style={styles.actionButton}
              />
              <Button
                title="Request verification"
                onPress={() => showToast({
                  type: 'info',
                  title: 'Coming Soon',
                  message: 'Account verification will be available soon!',
                  duration: 3000,
                })}
                variant="outline"
                size="sm"
                style={styles.actionButton}
              />
            </View>

            <View style={styles.logoutButtonContainer}>
              <Button
                title="Logout"
                onPress={handleLogout}
                variant="outline"
                size="sm"
                style={styles.logoutButton}
              />
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('listings')}
            style={[
              styles.tab,
              activeTab === 'listings' && styles.activeTab
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'listings' && styles.activeTabText
              ]}
            >
              Active Listings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('trades')}
            style={[
              styles.tab,
              activeTab === 'trades' && styles.activeTab
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'trades' && styles.activeTabText
              ]}
            >
              Completed Trades
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('reviews')}
            style={[
              styles.tab,
              activeTab === 'reviews' && styles.activeTab
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'reviews' && styles.activeTabText
              ]}
            >
              Reviews
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {activeTab === 'listings' && (
            <View style={styles.listingsContainer}>
              {isLoadingListings ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading your listings...</Text>
                </View>
              ) : displayListings.length > 0 ? (
                displayListings.map((listing) => (
                  <Card key={listing.id} style={styles.listingCard}>
                    <View style={styles.listingContent}>
                      <View style={styles.listingImageContainer}>
                        <Image
                          source={{ uri: listing.images[0] || 'https://via.placeholder.com/120x120' }}
                          style={styles.listingImage}
                        />
                      </View>
                      <View style={styles.listingDetails}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>{listing.category}</Text>
                        </View>
                        <Text style={styles.listingTitle} numberOfLines={2}>
                          {listing.title}
                        </Text>
                        <Text style={styles.listingPrice}>
                          {formatNaira(listing.price)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => navigation.navigate('ListingDetail' as any, { id: listing.id })}
                      >
                        <Eye size={16} color={COLORS.primary.DEFAULT} />
                        <Text style={styles.viewButtonText}>View</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Settings size={32} color={COLORS.neutral.gray} />
                  </View>
                  <Text style={styles.emptyTitle}>No active listings</Text>
                  <Text style={styles.emptySubtitle}>You haven't posted any items yet.</Text>
                  <Button
                    title="Post your first item"
                    onPress={() => navigation.navigate('CreateListing' as any)}
                    variant="primary"
                    size="sm"
                    style={styles.createButton}
                  />
                </View>
              )}
            </View>
          )}

          {activeTab === 'trades' && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <CheckCircle size={32} color={COLORS.neutral.gray} />
              </View>
              <Text style={styles.emptyTitle}>No completed trades</Text>
              <Text style={styles.emptySubtitle}>Your completed trades will appear here.</Text>
            </View>
          )}

          {activeTab === 'reviews' && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Star size={32} color={COLORS.neutral.gray} />
              </View>
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptySubtitle}>Reviews from other users will appear here.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    marginBottom: 0,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.primary.DEFAULT,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    left: -4,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
    marginBottom: 4,
    textAlign: 'center',
  },
  location: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginBottom: 12,
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    maxWidth: 120,
  },
  logoutButtonContainer: {
    marginTop: 8,
  },
  logoutButton: {
    borderColor: '#EF4444',
    minWidth: 100,
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary.DEFAULT,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.primary.DEFAULT,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  listingsContainer: {
    gap: 16,
  },
  listingCard: {
    padding: 0,
    overflow: 'hidden',
  },
  listingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingImageContainer: {
    width: 96,
    height: 96,
    backgroundColor: COLORS.neutral.light,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  listingDetails: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryBadge: {
    backgroundColor: COLORS.neutral.light,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  listingTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.primary.DEFAULT,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.primary.DEFAULT,
    borderRadius: 6,
    marginRight: 16,
    gap: 4,
  },
  viewButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary.DEFAULT,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    backgroundColor: COLORS.neutral.light,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    textAlign: 'center',
    marginBottom: 16,
  },
  createButton: {
    minWidth: 150,
  },
});

export default ProfileScreen;