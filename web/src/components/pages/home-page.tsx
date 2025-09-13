'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Shield, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import SearchBar from '@/components/common/search-bar';
import ProductCard from '@/components/common/product-card';
import { useAuth } from '@/contexts/auth-context';

const featuredCategories = [
  { name: 'Electronics', slug: 'electronics', count: '2.5k+ items' },
  { name: 'Fashion', slug: 'fashion', count: '1.8k+ items' },
  { name: 'Home & Garden', slug: 'home-garden', count: '1.2k+ items' },
  { name: 'Sports', slug: 'sports', count: '950+ items' },
  { name: 'Books', slug: 'books', count: '780+ items' },
  { name: 'Toys', slug: 'toys', count: '650+ items' },
];

const featuredListings = [
  {
    id: '1',
    title: 'iPhone 13 Pro Max - Excellent Condition',
    price: 45000000, // 450,000 NGN in kobo
    location: 'Lagos, Nigeria',
    imageUrl: '/api/placeholder/300/200',
    imageAlt: 'iPhone 13 Pro Max',
  },
  {
    id: '2',
    title: 'MacBook Air M2 - Like New',
    price: 75000000, // 750,000 NGN in kobo
    location: 'Abuja, Nigeria',
    imageUrl: '/api/placeholder/300/200',
    imageAlt: 'MacBook Air M2',
  },
  {
    id: '3',
    title: 'Samsung 55" Smart TV',
    price: 35000000, // 350,000 NGN in kobo
    location: 'Port Harcourt, Rivers',
    imageUrl: '/api/placeholder/300/200',
    imageAlt: 'Samsung Smart TV',
  },
  {
    id: '4',
    title: 'Nike Air Jordan Sneakers',
    price: 8500000, // 85,000 NGN in kobo
    location: 'Kano, Nigeria',
    imageUrl: '/api/placeholder/300/200',
    imageAlt: 'Nike Air Jordan',
  },
];

const features = [
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Trade with confidence using our secure escrow system',
  },
  {
    icon: Users,
    title: 'Verified Users',
    description: 'All users are verified for your safety and peace of mind',
  },
  {
    icon: Zap,
    title: 'Instant Trades',
    description: 'Complete trades instantly with our streamlined process',
  },
];

export default function HomePage(): React.ReactElement {
  const { user } = useAuth();

  const handleSearch = (query: string): void => {
    // Redirect to search page or handle search
    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  // Transform user data for Header component
  const headerUser = user ? {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    ...(user.avatar && { avatar: user.avatar }),
  } : undefined;

  return (
    <div className="min-h-screen bg-background-light">
      <Header user={headerUser} onSearch={handleSearch} />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary to-secondary py-20 lg:py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 font-display">
                Trade Anything...
              </h1>
              <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
                Nigeria's premier barter marketplace. Trade anything with anyone, anywhere in Nigeria.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto mb-8">
                <SearchBar
                  placeholder="What are you looking for today?"
                  onSearch={handleSearch}
                  className="w-full"
                />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <>
                    <Button size="lg" variant="accent" asChild>
                      <Link href="/feed">
                        Browse Marketplace
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/listings/create" className="text-white border-white hover:bg-white hover:text-primary">
                        List an Item
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" variant="accent" asChild>
                      <Link href="/auth/signup">
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/feed" className="text-white border-white hover:bg-white hover:text-primary">
                        Browse Items
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="heading-1 mb-4">Popular Categories</h2>
              <p className="subtext max-w-2xl mx-auto">
                Discover thousands of items across different categories
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/search?category=${category.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg border border-border-gray p-6 text-center hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-neutral-dark mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-neutral-gray">{category.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="heading-1 mb-4">Featured Items</h2>
                <p className="subtext">Top-rated items from trusted traders</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/feed">View All</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing) => (
                <ProductCard
                  key={listing.id}
                  {...listing}
                  onFavoriteToggle={(id) => {
                    console.log('Toggle favorite:', id);
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="heading-1 mb-4">Why Choose TradeByBarter?</h2>
              <p className="subtext max-w-2xl mx-auto">
                Experience the future of trading with our innovative platform designed for Nigerians
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-6">
                    <feature.icon className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="heading-2 mb-4">{feature.title}</h3>
                  <p className="subtext">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-r from-secondary to-primary">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 font-display">
                Ready to Start Trading?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of Nigerians already trading on our platform
              </p>
              {!user && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="accent" asChild>
                    <Link href="/auth/signup">
                      Create Free Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/auth/login" className="text-white border-white hover:bg-white hover:text-primary">
                      Sign In
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}