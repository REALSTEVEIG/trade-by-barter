import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Wallet, List, User, Grid } from 'lucide-react-native';
import { listingsApi } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import { AppStackParamList } from '@/navigation';
import { Listing } from '@/types';
import { COLORS, TYPOGRAPHY, ERROR_MESSAGES } from '@/constants';
import ProductCard from '@/components/common/ProductCard';
import SearchBar from '@/components/common/SearchBar';
import CategoryFilter from '@/components/common/CategoryFilter';
import Loading from '@/components/ui/Loading';

type FeedScreenNavigationProp = NativeStackNavigationProp<AppStackParamList>;

const FeedScreen: React.FC = () => {
  const navigation = useNavigation<FeedScreenNavigationProp>();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyListings, setShowMyListings] = useState(false);

  const fetchListings = useCallback(async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params: Record<string, any> = {
        page,
        limit: 20,
      };

      // Only apply category filter when not showing "My Listings"
      if (selectedCategory && !showMyListings) {
        params.category = selectedCategory;
      }

      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }

      if (showMyListings && user?.id) {
        params.userId = user.id;
      } else if (!showMyListings && user?.id) {
        // For "All Listings", exclude user's own listings
        params.excludeUserId = user.id;
      }

      const response = await listingsApi.getListings(params);
      
      // Mobile API client returns paginated response directly
      const responseData = response as any;
      let newListings: Listing[] = [];
      
      if (Array.isArray(responseData.data)) {
        newListings = responseData.data as Listing[];
      } else if (Array.isArray(responseData)) {
        newListings = responseData as Listing[];
      }

      if (page === 1) {
        setListings(newListings || []);
      } else {
        setListings(prev => [...(prev || []), ...(newListings || [])]);
      }

      setHasNextPage((newListings || []).length === 20);
      setCurrentPage(page);
    } catch (error: any) {
      // Ensure listings is always an array even on error
      if (page === 1) {
        setListings([]);
      }
      showToast({
        type: 'error',
        title: 'Failed to load listings',
        message: error.response?.data?.message || ERROR_MESSAGES.NETWORK,
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [selectedCategory, searchQuery, showMyListings, user?.id]);

  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  // Refresh listings when screen comes into focus (e.g., after creating a new listing)
  useFocusEffect(
    useCallback(() => {
      // Only refresh if we're not currently loading and not on the first mount
      if (!isLoading && listings.length > 0) {
        fetchListings(1, true);
      }
    }, [fetchListings, isLoading, listings.length])
  );

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchListings(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasNextPage) {
      fetchListings(currentPage + 1);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleToggleMyListings = () => {
    setShowMyListings(!showMyListings);
    setCurrentPage(1);
  };

  const handleListingPress = (listing: Listing) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  const handleFavoriteToggle = async (listing: Listing) => {
    try {
      await listingsApi.toggleFavorite(listing.id);
      
      // Update local state
      setListings(prev =>
        (prev || []).map(item =>
          item.id === listing.id
            ? { ...item, isFavorited: !item.isFavorited }
            : item
        )
      );
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Failed to update favorite',
        message: error.response?.data?.message || 'Unable to update favorite status',
        duration: 4000,
      });
    }
  };

  const renderListingItem = ({ item }: { item: Listing }) => (
    <ProductCard
      listing={item}
      onPress={() => handleListingPress(item)}
      onFavorite={() => handleFavoriteToggle(item)}
      variant="grid"
    />
  );

  const renderListHeader = () => (
    <View style={styles.header}>
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greeting}>
            Good {getTimeOfDay()}, {user?.firstName || 'Trader'}!
          </Text>
          <Text style={styles.subtitle}>Find amazing items to trade</Text>
        </View>
        
        <TouchableOpacity
          style={styles.walletButton}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Wallet size={24} color={COLORS.primary.DEFAULT} />
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearch}
        placeholder="Search for items..."
        style={styles.searchBar}
      />

      {!showMyListings && (
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          style={styles.categoryFilter}
        />
      )}

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, showMyListings && styles.filterButtonActive]}
          onPress={handleToggleMyListings}
        >
          <User size={16} color={showMyListings ? 'white' : COLORS.primary.DEFAULT} />
          <Text style={[
            styles.filterButtonText,
            showMyListings && styles.filterButtonTextActive
          ]}>
            My Listings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, !showMyListings && styles.filterButtonActive]}
          onPress={() => setShowMyListings(false)}
        >
          <Grid size={16} color={!showMyListings ? 'white' : COLORS.primary.DEFAULT} />
          <Text style={[
            styles.filterButtonText,
            !showMyListings && styles.filterButtonTextActive
          ]}>
            All Listings
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {showMyListings
            ? 'My Listings'
            : searchQuery
              ? `Search results for "${searchQuery}"`
              : 'Latest Listings'
          }
        </Text>
        <Text style={styles.listingCount}>
          {(listings || []).length} item{(listings || []).length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  const renderListFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.loadingMore}>
        <Loading />
        <Text style={styles.loadingMoreText}>Loading more listings...</Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <List size={64} color={COLORS.neutral.gray} />
      <Text style={styles.emptyTitle}>No listings found</Text>
      <Text style={styles.emptySubtitle}>
        {showMyListings
          ? 'You haven\'t posted any listings yet. Create your first listing to get started!'
          : searchQuery || selectedCategory
            ? 'Try adjusting your search criteria'
            : 'Be the first to post an item!'}
      </Text>
    </View>
  );

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading />
        <Text style={styles.loadingText}>Loading listings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={listings}
        renderItem={renderListingItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary.DEFAULT]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={listings && listings.length > 0 ? styles.row : undefined}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 16,
  },
  greeting: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    marginTop: 4,
  },
  walletButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primary[50],
  },
  searchBar: {
    marginBottom: 16,
  },
  categoryFilter: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
  },
  listingCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  row: {
    justifyContent: 'space-between',
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    textAlign: 'center',
    lineHeight: 24,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.gray[100],
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary.DEFAULT,
  },
  filterButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
    color: COLORS.primary.DEFAULT,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  filterButtonTextActive: {
    color: 'white',
  },
});

export default FeedScreen;