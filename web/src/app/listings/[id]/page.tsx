'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  MapPin, 
  Calendar, 
  User, 
  Edit3, 
  Trash2,
  MessageCircle,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { listingsApi } from '@/lib/api';
import { formatNaira, formatTimeAgo } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

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

export default function ListingDetailPage(): React.ReactElement {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        const response = await listingsApi.getListing(id as string);
        setListing((response.data || response) as Listing);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to load listing';
        setError(errorMessage);
        toast.error("Error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!listing) return;
    
    try {
      await listingsApi.toggleFavorite(listing.id);
      setListing(prev => prev ? { ...prev, isFavorited: !prev.isFavorited } : null);
    } catch (error: any) {
      toast.error("Error", "Failed to update favorite. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this listing? This action cannot be undone.');
    if (!confirmed) return;
    
    try {
      setIsDeleting(true);
      await listingsApi.deleteListing(listing.id);
      toast.success("Success", "Listing deleted successfully");
      router.push('/feed');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete listing';
      setError(errorMessage);
      toast.error("Error", errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title || '',
          text: listing?.description || '',
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied", "Listing URL copied to clipboard");
      } catch (error) {
        toast.error("Error", "Failed to copy link to clipboard");
      }
    }
  };

  const isOwner = user?.id === listing?.owner.id;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Listing not found'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteToggle}
            >
              <Heart
                className={`w-5 h-5 ${listing.isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'}`}
              />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </Button>
            
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/listings/${listing.id}/edit`)}
                >
                  <Edit3 className="w-5 h-5 text-gray-600" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Images */}
        {listing.images.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <Image
                  src={listing.images[currentImageIndex] || '/api/placeholder/400/300'}
                  alt={listing.title}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                
                {listing.images.length > 1 && (
                  <>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {listing.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-sm">
                      {currentImageIndex + 1}/{listing.images.length}
                    </div>
                  </>
                )}
              </div>
              
              {listing.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-primary-500' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${listing.title} ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Title and Price */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <p className="text-3xl font-bold text-primary-600">{formatNaira(listing.priceInKobo / 100)}</p>
              </div>
              
              <div className="flex flex-col gap-2">
                <Badge variant="secondary">{listing.category.replace('_', ' ')}</Badge>
                <Badge variant="outline">{listing.condition.replace('_', ' ')}</Badge>
              </div>
            </div>
            
            {/* Trade Options */}
            <div className="flex gap-2 mb-4">
              {listing.isSwapOnly ? (
                <Badge className="bg-blue-100 text-blue-800">Swap only</Badge>
              ) : listing.acceptsCash && listing.acceptsSwap ? (
                <>
                  <Badge className="bg-green-100 text-green-800">Cash</Badge>
                  <Badge className="bg-blue-100 text-blue-800">Swap</Badge>
                </>
              ) : listing.acceptsCash ? (
                <Badge className="bg-green-100 text-green-800">Cash only</Badge>
              ) : listing.acceptsSwap ? (
                <Badge className="bg-blue-100 text-blue-800">Swap only</Badge>
              ) : null}
            </div>
            
            {/* Location */}
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-4 h-4 mr-2" />
              <span>
                {listing.specificLocation ? `${listing.specificLocation}, ` : ''}
                {listing.city}, {listing.state}
              </span>
            </div>
            
            {/* Post Date */}
            <div className="flex items-center text-gray-500 text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Posted {formatTimeAgo(new Date(listing.createdAt))}</span>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {listing.description && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Swap Preferences */}
        {listing.swapPreferences && listing.swapPreferences.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Looking for in exchange</h2>
              <div className="flex flex-wrap gap-2">
                {listing.swapPreferences.map((preference, index) => (
                  <Badge key={index} variant="outline">{preference}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Owner */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Posted by</h2>
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                {listing.owner.profilePicture ? (
                  <Image
                    src={listing.owner.profilePicture}
                    alt={listing.owner.displayName || `${listing.owner.firstName} ${listing.owner.lastName}`}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                )}
              </Avatar>
              
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {listing.owner.displayName || `${listing.owner.firstName} ${listing.owner.lastName}`}
                  {listing.owner.verified && (
                    <span className="ml-1 text-blue-500">✓</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {!isOwner && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => router.push(`/chat?userId=${listing.owner.id}&listingId=${listing.id}`)}
              className="flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </Button>
            
            <Button
              onClick={() => router.push(`/offers/make?listingId=${listing.id}`)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Make Offer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}