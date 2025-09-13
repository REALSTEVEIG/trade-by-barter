'use client';

import * as React from 'react';
import { Filter, SlidersHorizontal, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loading } from '@/components/ui/loading';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ProductCard from '@/components/common/product-card';
import { useAuth } from '@/contexts/auth-context';
import { listingsApi } from '@/lib/api';
import { Listing } from '@/types';
import { cn, NIGERIAN_STATES } from '@/lib/utils';

const categories = [
  { name: 'All Categories', slug: 'all' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Home & Garden', slug: 'home-garden' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Books', slug: 'books' },
  { name: 'Toys', slug: 'toys' },
  { name: 'Automotive', slug: 'automotive' },
  { name: 'Beauty', slug: 'beauty' },
];

const sortOptions = [
  { name: 'Newest First', value: 'newest' },
  { name: 'Oldest First', value: 'oldest' },
  { name: 'Price: Low to High', value: 'price-low' },
  { name: 'Price: High to Low', value: 'price-high' },
  { name: 'Most Popular', value: 'popular' },
];

export default function FeedPage(): React.ReactElement {
  const { user } = useAuth();
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = React.useState(false);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedLocation, setSelectedLocation] = React.useState('');
  const [sortBy, setSortBy] = React.useState('newest');
  const [searchQuery, setSearchQuery] = React.useState('');

  // Pagination
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [totalCount, setTotalCount] = React.useState(0);

  // Transform user data for Header component
  const headerUser = user ? {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    ...(user.avatar && { avatar: user.avatar }),
  } : undefined;

  const fetchListings = React.useCallback(async (reset = false): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: reset ? 1 : page,
        limit: 20,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(selectedLocation && { location: selectedLocation }),
        ...(searchQuery && { query: searchQuery }),
        sort: sortBy,
      };

      const response = await listingsApi.getListings(params);
      
      if (reset) {
        setListings(response.data as Listing[]);
        setPage(1);
      } else {
        setListings(prev => [...prev, ...(response.data as Listing[])]);
      }
      
      setTotalCount(response.pagination.total);
      setHasMore(response.pagination.page < response.pagination.pages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, selectedLocation, searchQuery, sortBy]);

  // Initial load
  React.useEffect(() => {
    fetchListings(true);
  }, [selectedCategory, selectedLocation, searchQuery, sortBy]);

  const handleSearch = (query: string): void => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: string): void => {
    setSelectedCategory(category);
  };

  const handleLocationChange = (location: string): void => {
    setSelectedLocation(location);
  };

  const handleSortChange = (sort: string): void => {
    setSortBy(sort);
  };

  const handleLoadMore = (): void => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchListings();
    }
  };

  const handleFavoriteToggle = async (listingId: string): Promise<void> => {
    try {
      await listingsApi.toggleFavorite(listingId);
      // Update the listing in the current list
      setListings(prev => prev.map(listing => 
        listing.id === listingId 
          ? { ...listing, isFavorite: !listing.isFavorite }
          : listing
      ));
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-background-light">
        <Header user={headerUser} onSearch={handleSearch} />
        <div className="flex items-center justify-center py-20">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light">
      <Header user={headerUser} onSearch={handleSearch} />

      <div className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <div className="mb-8">
          {/* Category Pills */}
          <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Badge
                key={category.slug}
                variant={selectedCategory === category.slug ? 'category-active' : 'category-inactive'}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleCategoryChange(category.slug)}
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* Filters and View Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>

              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
                className="input-field text-sm"
              >
                <option value="">All Locations</option>
                {NIGERIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input-field text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-gray">
                {totalCount} item{totalCount !== 1 ? 's' : ''}
              </span>
              
              <div className="flex items-center border border-border-gray rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-none rounded-l-lg',
                    viewMode === 'grid' && 'bg-primary text-white'
                  )}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'rounded-none rounded-r-lg',
                    viewMode === 'list' && 'bg-primary text-white'
                  )}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => fetchListings(true)}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Listings Grid */}
        {listings.length > 0 ? (
          <>
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            )}>
              {listings.map((listing) => (
                <ProductCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  price={listing.priceInKobo || 0}
                  location={`${listing.location.city}, ${listing.location.state}`}
                  imageUrl={listing.images[0]?.url || '/api/placeholder/300/200'}
                  imageAlt={listing.title}
                  isFavorite={Boolean(listing.isFavorite)}
                  onFavoriteToggle={handleFavoriteToggle}
                  className={viewMode === 'list' ? 'flex' : ''}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  loading={loading}
                  disabled={loading}
                >
                  Load More Items
                </Button>
              </div>
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-20">
              <div className="mb-4">
                <div className="w-24 h-24 bg-neutral-gray/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="h-12 w-12 text-neutral-gray" />
                </div>
                <h3 className="heading-2 mb-2">No items found</h3>
                <p className="subtext">
                  Try adjusting your search criteria or browse different categories
                </p>
              </div>
              <Button variant="outline" onClick={() => {
                setSelectedCategory('all');
                setSelectedLocation('');
                setSearchQuery('');
              }}>
                Clear Filters
              </Button>
            </div>
          )
        )}
      </div>

      <Footer />
    </div>
  );
}