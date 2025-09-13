import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { listingsApi } from '@/lib/api';
import { AppStackParamList } from '@/navigation';
import { Listing } from '@/types';
import { COLORS, TYPOGRAPHY, ERROR_MESSAGES } from '@/constants';
import ProductCard from '@/components/common/ProductCard';
import SearchBar from '@/components/common/SearchBar';
import CategoryFilter from '@/components/common/CategoryFilter';
import Loading from '@/components/ui/Loading';

type SearchScreenNavigationProp = NativeStackNavigationProp<AppStackParamList>;

const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (query: string, category: string = selectedCategory) => {
    if (!query.trim() && !category) {
      setListings([]);
      setHasSearched(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasSearched(true);

      const params: Record<string, any> = {
        page: 1,
        limit: 50,
      };

      if (query.trim()) {
        params.q = query.trim();
      }

      if (category) {
        params.category = category;
      }

      const response = await listingsApi.searchListings(params);
      setListings(response.data as Listing[]);
    } catch (error: any) {
      console.error('Error searching listings:', error);
      Alert.alert(
        'Search Error',
        error.response?.data?.message || ERROR_MESSAGES.NETWORK
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    performSearch(searchQuery, category);
  };

  const handleListingPress = (listing: Listing) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  const handleFavoriteToggle = async (listing: Listing) => {
    try {
      await listingsApi.toggleFavorite(listing.id);
      
      setListings(prev =>
        prev.map(item =>
          item.id === listing.id
            ? { ...item, isFavorited: !item.isFavorited }
            : item
        )
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to update favorite'
      );
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

  const renderEmptyState = () => {
    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={COLORS.neutral.gray} />
          <Text style={styles.emptyTitle}>Search TradeByBarter</Text>
          <Text style={styles.emptySubtitle}>
            Find amazing items to trade or buy
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons name="sad-outline" size={64} color={COLORS.neutral.gray} />
        <Text style={styles.emptyTitle}>No results found</Text>
        <Text style={styles.emptySubtitle}>
          Try different keywords or browse categories
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Search</Text>
        
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmit={handleSearch}
          placeholder="Search for items, brands, or users..."
          showFilterButton
          style={styles.searchBar}
        />

        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          style={styles.categoryFilter}
        />

        {hasSearched && (
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsText}>
              {isLoading ? 'Searching...' : `${listings.length} result${listings.length !== 1 ? 's' : ''} found`}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Loading />
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={listings.length > 0 ? styles.row : undefined}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.neutral.dark,
    fontFamily: TYPOGRAPHY.fontFamily.poppins,
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  categoryFilter: {
    marginBottom: 16,
  },
  resultsHeader: {
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.neutral.gray,
    fontFamily: TYPOGRAPHY.fontFamily.inter,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
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
});

export default SearchScreen;