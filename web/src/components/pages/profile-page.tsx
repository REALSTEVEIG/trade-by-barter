'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, Settings, CheckCircle, Eye, Home, FileText, MessageCircle, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { authApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { formatNaira } from '@/lib/utils';

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
}

type TabType = 'listings' | 'trades' | 'reviews';

export default function ProfilePage(): React.ReactElement {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('listings');
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
      toast.error('Error', 'Failed to load profile data');
    }
  };

  const loadListings = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoadingListings(true);
      // Use the my-listings endpoint for user's own listings
      const response = await fetch('/api/v1/listings/my-listings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const data = await response.json();
      setListings(data.data || []);
    } catch (error: any) {
      toast.error('Error', 'Failed to load your listings');
      setListings([]);
    } finally {
      setIsLoading(false);
      setIsLoadingListings(false);
    }
  };

  const displayListings = listings || [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="bg-white px-4 py-6">
        <div className="text-center">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage
                src={profile?.avatar || user?.avatar}
                alt={`${profile?.firstName || user?.firstName} ${profile?.lastName || user?.lastName}`}
              />
              <AvatarFallback className="text-2xl font-semibold bg-primary-100 text-primary-600">
                {profile?.firstName?.[0] || user?.firstName?.[0]}
                {profile?.lastName?.[0] || user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            {(profile?.isVerified || user?.isVerified) && (
              <CheckCircle className="absolute -bottom-1 -right-1 w-6 h-6 text-blue-500 bg-white rounded-full" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {profile?.firstName || user?.firstName} {profile?.lastName || user?.lastName}
          </h2>
          
          <p className="text-gray-600 mb-3">
            {profile?.location || user?.location || 'Lagos, Nigeria'}
          </p>

          <div className="flex items-center justify-center gap-1 mb-6">
            {renderStars(profile?.rating || 0)}
            <span className="ml-2 text-sm text-gray-600">
              {profile?.rating || 0} ({profile?.reviewCount || 0} reviews)
            </span>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              variant="outline"
              onClick={() => router.push('/wallet')}
              className="flex-1 max-w-28"
            >
              Wallet
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/profile/edit')}
              className="flex-1 max-w-28"
            >
              Edit profile
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/profile/verification')}
              className="flex-1 max-w-32"
            >
              Verification
            </Button>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await logout();
                  router.push('/auth/login');
                } catch (error: any) {
                  toast.error('Error', 'Failed to logout. Please try again.');
                }
              }}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'listings'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Active Listings
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'trades'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Completed Trades
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-4 px-4 text-center font-medium border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Reviews
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {isLoadingListings ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your listings...</p>
              </div>
            ) : displayListings.length > 0 ? (
              displayListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-24 h-24 bg-gray-200 overflow-hidden">
                      <img
                        src={listing.images[0] || '/api/placeholder/120/120'}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant="secondary" className="text-xs mb-1">
                            {listing.category}
                          </Badge>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {listing.title}
                          </h3>
                          <p className="text-lg font-bold text-primary-600">
                            {formatNaira(listing.price)}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => router.push(`/listings/${listing.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No active listings
                </h3>
                <p className="text-gray-600 mb-4">
                  You haven't posted any items yet.
                </p>
                <Button onClick={() => router.push('/listings/create')}>
                  Post your first item
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No completed trades
            </h3>
            <p className="text-gray-600">
              Your completed trades will appear here.
            </p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600">
              Reviews from other users will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button
            onClick={() => router.push('/')}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FileText className="w-6 h-6 mb-1" />
            <span className="text-xs">My Listings</span>
          </button>
          <button
            onClick={() => router.push('/chat')}
            className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6 mb-1" />
            <span className="text-xs">Messages</span>
          </button>
          <button
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center py-2 px-3 text-primary-600"
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>

      {/* Add padding to prevent content from being hidden behind bottom nav */}
      <div className="h-20"></div>
    </div>
  );
}