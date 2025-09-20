import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  X,
  Star,
  ShieldCheck,
  MapPin,
  Calendar,
  MessageCircle,
  Phone,
  Video,
  Package
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY } from '@/constants';
import Avatar from '@/components/ui/Avatar';

interface ProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  userId: string;
  onStartCall?: (type: 'audio' | 'video') => void;
  onSendMessage?: () => void;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  location?: string;
  joinedAt: string;
  isVerified: boolean;
  rating: number;
  totalTrades: number;
  bio?: string;
  listings: Array<{
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    createdAt: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    reviewer: {
      name: string;
      avatar?: string;
    };
    createdAt: string;
  }>;
}

export function ProfileModal({ 
  isVisible, 
  onClose, 
  userId, 
  onStartCall, 
  onSendMessage 
}: ProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>('listings');

  useEffect(() => {
    if (isVisible && userId) {
      fetchProfile();
    }
  }, [isVisible, userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock profile data
      const mockProfile: UserProfile = {
        id: userId,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        location: 'Lagos, Nigeria',
        joinedAt: '2023-06-15T10:30:00Z',
        isVerified: true,
        rating: 4.8,
        totalTrades: 47,
        bio: 'Passionate trader with focus on electronics and fashion items. Always looking for fair trades and building lasting connections.',
        listings: [
          {
            id: '1',
            title: 'iPhone 13 Pro - Excellent Condition',
            description: 'Barely used iPhone 13 Pro in pristine condition',
            category: 'ELECTRONICS',
            location: 'Lagos, Nigeria',
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            title: 'Designer Leather Jacket',
            description: 'Authentic designer leather jacket, size M',
            category: 'FASHION',
            location: 'Lagos, Nigeria',
            createdAt: '2024-01-10T14:20:00Z'
          }
        ],
        reviews: [
          {
            id: '1',
            rating: 5,
            comment: 'Excellent trader! Very trustworthy and items exactly as described.',
            reviewer: {
              name: 'Sarah Johnson'
            },
            createdAt: '2024-01-20T16:45:00Z'
          },
          {
            id: '2',
            rating: 4,
            comment: 'Good communication and fair pricing. Would trade again.',
            reviewer: {
              name: 'Mike Chen'
            },
            createdAt: '2024-01-18T09:15:00Z'
          }
        ]
      };

      setProfile(mockProfile);
    } catch (err: any) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        color={i < Math.floor(rating) ? "#F59E0B" : "#D1D5DB"}
        fill={i < Math.floor(rating) ? "#F59E0B" : "transparent"}
      />
    ));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!isVisible) return null;

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={COLORS.neutral.dark} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchProfile} style={styles.retryButton}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : profile ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <Avatar
                source={profile.avatar ? { uri: profile.avatar } : undefined}
                name={`${profile.firstName} ${profile.lastName}`}
                size="xl"
                style={styles.avatar}
              />
              
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.profileName}>
                    {`${profile.firstName} ${profile.lastName}`}
                  </Text>
                  {profile.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <ShieldCheck size={16} color="#10B981" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.profileMeta}>
                  {profile.location && (
                    <View style={styles.metaRow}>
                      <MapPin size={16} color={COLORS.neutral.gray} />
                      <Text style={styles.metaText}>{profile.location}</Text>
                    </View>
                  )}
                  <View style={styles.metaRow}>
                    <Calendar size={16} color={COLORS.neutral.gray} />
                    <Text style={styles.metaText}>Joined {formatTimeAgo(profile.joinedAt)}</Text>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <View style={styles.starsRow}>
                      {renderStars(profile.rating)}
                    </View>
                    <Text style={styles.statLabel}>
                      {profile.rating} ({profile.reviews.length} reviews)
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{profile.totalTrades}</Text>
                    <Text style={styles.statLabel}>trades</Text>
                  </View>
                </View>

                {profile.bio && (
                  <Text style={styles.bio}>{profile.bio}</Text>
                )}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {onSendMessage && (
                <TouchableOpacity onPress={onSendMessage} style={[styles.actionButton, styles.primaryButton]}>
                  <MessageCircle size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Message</Text>
                </TouchableOpacity>
              )}
              {onStartCall && (
                <View style={styles.callButtons}>
                  <TouchableOpacity
                    onPress={() => onStartCall('audio')}
                    style={[styles.actionButton, styles.secondaryButton]}
                  >
                    <Phone size={20} color={COLORS.primary.DEFAULT} />
                    <Text style={styles.secondaryButtonText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onStartCall('video')}
                    style={[styles.actionButton, styles.secondaryButton]}
                  >
                    <Video size={20} color={COLORS.primary.DEFAULT} />
                    <Text style={styles.secondaryButtonText}>Video</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity
                onPress={() => setActiveTab('listings')}
                style={[styles.tab, activeTab === 'listings' && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === 'listings' && styles.activeTabText]}>
                  Listings ({profile.listings.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('reviews')}
                style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
                  Reviews ({profile.reviews.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View style={styles.tabContent}>
              {activeTab === 'listings' ? (
                <View style={styles.listingsTab}>
                  {profile.listings.length > 0 ? (
                    profile.listings.map((listing) => (
                      <View key={listing.id} style={styles.listingCard}>
                        <View style={styles.listingHeader}>
                          <Text style={styles.listingTitle}>{listing.title}</Text>
                          <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{listing.category}</Text>
                          </View>
                        </View>
                        <Text style={styles.listingDescription}>{listing.description}</Text>
                        <View style={styles.listingFooter}>
                          <View style={styles.locationRow}>
                            <MapPin size={12} color={COLORS.neutral.gray} />
                            <Text style={styles.locationText}>{listing.location}</Text>
                          </View>
                          <Text style={styles.dateText}>{formatTimeAgo(listing.createdAt)}</Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Package size={48} color={COLORS.neutral.gray} />
                      <Text style={styles.emptyText}>No listings yet</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.reviewsTab}>
                  {profile.reviews.length > 0 ? (
                    profile.reviews.map((review) => (
                      <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                          <Avatar
                            source={review.reviewer.avatar ? { uri: review.reviewer.avatar } : undefined}
                            name={review.reviewer.name}
                            size="sm"
                          />
                          <View style={styles.reviewerInfo}>
                            <Text style={styles.reviewerName}>{review.reviewer.name}</Text>
                            <Text style={styles.reviewDate}>{formatTimeAgo(review.createdAt)}</Text>
                          </View>
                        </View>
                        <View style={styles.reviewRating}>
                          {renderStars(review.rating)}
                        </View>
                        <Text style={styles.reviewComment}>{review.comment}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Star size={48} color={COLORS.neutral.gray} />
                      <Text style={styles.emptyText}>No reviews yet</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  closeButton: {
    padding: 4,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: '#EF4444',
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary.DEFAULT,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  avatar: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: 'bold',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginRight: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  profileMeta: {
    alignItems: 'center',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    color: COLORS.neutral.gray,
    fontSize: TYPOGRAPHY.fontSize.sm,
    marginLeft: 4,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 4,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: 'bold',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  bio: {
    color: COLORS.neutral.gray,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  callButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: COLORS.primary.DEFAULT,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary.DEFAULT,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  secondaryButtonText: {
    color: COLORS.primary.DEFAULT,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary.DEFAULT,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  activeTabText: {
    color: COLORS.primary.DEFAULT,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
  },
  listingsTab: {
    gap: 12,
  },
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    borderRadius: 8,
    padding: 16,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  listingDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    marginBottom: 8,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    marginLeft: 4,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  reviewsTab: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.neutral.border,
    borderRadius: 8,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reviewerName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  reviewDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    marginTop: 12,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
});