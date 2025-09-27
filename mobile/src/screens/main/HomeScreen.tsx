import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Bell, User, Plus, Grid3X3 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY } from '@/constants';
import { useToast } from '@/hooks/useToast';
import { Listing } from '@/types';
import { ProductCard, SearchBar, CategoryFilter } from '@/components/common';
import { Button, Loading } from '@/components/ui';
import { listingsApi } from '@/lib/api';


export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadFeaturedListings();
  }, []);

  const loadFeaturedListings = async () => {
    setIsLoading(true);
    
    try {            
      // Make actual API call to get listings
      const response = await listingsApi.getListings({
        page: 1,
        limit: 20,
        sortBy: 'newest'
      });

      // Handle the response structure from backend
      const responseData = response.data || response;
      const listings = (responseData as any).listings || [];
      
      setListings(listings);      
    } catch (error: any) {
      // Try to show a user-friendly error
      const errorMessage = error.response?.data?.message || error.message || 'Network connection failed';
      toast.error('Failed to load listings', errorMessage);
      setListings([]);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadFeaturedListings();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic
    console.log('Search:', query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // Implement category filtering
    console.log('Category:', category);
  };

  const handleListingPress = (listing: Listing) => {
    // Navigate to listing detail
    console.log('Navigate to listing:', listing.id);
  };

  const handleFavoritePress = (listing: Listing) => {
    // Toggle favorite
    console.log('Toggle favorite:', listing.id);
  };

  const renderListingItem = ({ item, index }: { item: Listing; index: number }) => (
    <ProductCard
      listing={item}
      onPress={() => handleListingPress(item)}
      onFavorite={() => handleFavoritePress(item)}
      variant="grid"
      style={index % 2 === 0 ? { marginRight: 8 } : { marginLeft: 8 }}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.appName}>TradeByBarter</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Notifications' as any)}
          >
            <Bell size={24} color={COLORS.neutral.dark} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Profile' as any)}
          >
            <User size={24} color={COLORS.neutral.dark} />
          </TouchableOpacity>
        </View>
      </View>

      <SearchBar
        placeholder="Search for items"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearch}
        showFilterButton={true}
        style={styles.searchBar}
      />

      <CategoryFilter
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        style={styles.categoryFilter}
      />
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionButtons}>
        <Button
          title="Post Item"
          onPress={() => console.log('Navigate to create listing')}
          variant="primary"
          style={styles.actionButton}
          icon={<Plus size={20} color="#FFFFFF" />}
        />
        <Button
          title="Browse All"
          onPress={() => console.log('Navigate to feed')}
          variant="outline"
          style={styles.actionButton}
          icon={<Grid3X3 size={20} color={COLORS.primary.DEFAULT} />}
        />
      </View>
    </View>
  );

  if (isLoading && listings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading text="Loading featured items..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={false}
      />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary.DEFAULT]}
            tintColor={COLORS.primary.DEFAULT}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderQuickActions()}

        {/* Featured Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Items</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={listings}
            renderItem={renderListingItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.listingsGrid}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  appName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.neutral.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryFilter: {
    marginBottom: 8,
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.neutral.light,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
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
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.primary.DEFAULT,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
    fontWeight: '500',
  },
  listingsGrid: {
    gap: 16,
  },
});

export default HomeScreen;