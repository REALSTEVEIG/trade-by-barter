'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Star,
  Shield,
  Package,
  MessageCircle,
  Phone,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatTimeAgo, getInitials } from '@/lib/utils';

interface ProfileModalProps {
  isOpen: boolean;
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
    images: string[];
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
  isOpen, 
  onClose, 
  userId, 
  onStartCall, 
  onSendMessage 
}: ProfileModalProps): React.ReactElement | null {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchProfile();
    }
  }, [isOpen, userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would be a single API call
      // For now, we'll simulate the profile data
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
            images: [],
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            title: 'Designer Leather Jacket',
            description: 'Authentic designer leather jacket, size M',
            category: 'FASHION',
            location: 'Lagos, Nigeria',
            images: [],
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
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-gray">
          <h2 className="text-xl font-bold text-neutral-dark">Profile</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchProfile}>Try Again</Button>
            </div>
          </div>
        ) : profile ? (
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Profile Header */}
            <div className="p-6 bg-gray-50 border-b border-border-gray">
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl bg-primary text-white">
                    {getInitials(`${profile.firstName} ${profile.lastName}`)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold text-neutral-dark">
                      {`${profile.firstName} ${profile.lastName}`}
                    </h3>
                    {profile.isVerified && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-neutral-gray mb-3">
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {formatTimeAgo(new Date(profile.joinedAt))}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      {renderStars(profile.rating)}
                      <span className="ml-1 text-sm font-medium">
                        {profile.rating} ({profile.reviews.length} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-neutral-gray">
                      <Package className="w-4 h-4" />
                      <span>{profile.totalTrades} trades</span>
                    </div>
                  </div>

                  {profile.bio && (
                    <p className="text-neutral-gray text-sm">{profile.bio}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                {onSendMessage && (
                  <Button onClick={onSendMessage} className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                )}
                {onStartCall && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => onStartCall('audio')}
                      className="flex-1"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onStartCall('video')}
                      className="flex-1"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Video
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="listings" className="p-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="listings">Listings ({profile.listings.length})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({profile.reviews.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="mt-6">
                <div className="space-y-4">
                  {profile.listings.length > 0 ? (
                    profile.listings.map((listing) => (
                      <Card key={listing.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-neutral-dark">{listing.title}</h4>
                          <Badge variant="outline">{listing.category}</Badge>
                        </div>
                        <p className="text-sm text-neutral-gray mb-2">{listing.description}</p>
                        <div className="flex items-center justify-between text-xs text-neutral-gray">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{listing.location}</span>
                          </div>
                          <span>{formatTimeAgo(new Date(listing.createdAt))}</span>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-neutral-gray mx-auto mb-3" />
                      <p className="text-neutral-gray">No listings yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-4">
                  {profile.reviews.length > 0 ? (
                    profile.reviews.map((review) => (
                      <Card key={review.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={review.reviewer.avatar} />
                            <AvatarFallback className="text-xs bg-primary text-white">
                              {getInitials(review.reviewer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{review.reviewer.name}</span>
                              <span className="text-xs text-neutral-gray">
                                {formatTimeAgo(new Date(review.createdAt))}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-sm text-neutral-gray">{review.comment}</p>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Star className="w-12 h-12 text-neutral-gray mx-auto mb-3" />
                      <p className="text-neutral-gray">No reviews yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </Card>
    </div>
  );
}