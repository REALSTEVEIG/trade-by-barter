'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowUpDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { listingsApi, offersApi } from '@/lib/api';
import { formatNaira } from '@/lib/utils';

interface Listing {
  id: string;
  title: string;
  category: string;
  price: number;
  images: string[];
  condition: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface OfferData {
  targetListingId: string;
  offerType: 'item' | 'cash' | 'both';
  cashAmount?: number;
  message?: string;
  offeredItems: string[];
}

export default function MakeOfferPage(): React.ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');
  
  const [targetListing, setTargetListing] = useState<Listing | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [offerType, setOfferType] = useState<'item' | 'cash' | 'both'>('item');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (listingId) {
      loadTargetListing();
      loadUserListings();
    }
  }, [listingId]);

  const loadTargetListing = async () => {
    try {
      const response = await listingsApi.getListing(listingId!);
      setTargetListing(response.data as Listing);
    } catch (error) {
      console.error('Error loading listing:', error);
    }
  };

  const loadUserListings = async () => {
    try {
      const response = await listingsApi.getListings({ userId: 'current' });
      setUserListings(response.data as Listing[]);
    } catch (error) {
      console.error('Error loading user listings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for demonstration
  const mockTargetListing: Listing = {
    id: '1',
    title: 'Vintage Camera',
    category: 'Electronics',
    price: 25000,
    images: ['/api/placeholder/200/200'],
    condition: 'Very Good',
    owner: {
      id: '2',
      firstName: 'Alex',
      lastName: 'Johnson',
      avatar: '/api/placeholder/50/50'
    }
  };

  const mockUserListings: Listing[] = [
    {
      id: '3',
      title: 'Gaming Headset',
      category: 'Electronics',
      price: 15000,
      images: ['/api/placeholder/150/150'],
      condition: 'Like New',
      owner: {
        id: 'current',
        firstName: 'You',
        lastName: '',
      }
    },
    {
      id: '4',
      title: 'Designer Watch',
      category: 'Accessories',
      price: 35000,
      images: ['/api/placeholder/150/150'],
      condition: 'Brand New',
      owner: {
        id: 'current',
        firstName: 'You',
        lastName: '',
      }
    }
  ];

  const displayTargetListing = targetListing || mockTargetListing;
  const displayUserListings = userListings.length > 0 ? userListings : mockUserListings;

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmitOffer = async () => {
    if (!listingId) return;

    setIsSubmitting(true);
    try {
      const offerData: OfferData = {
        targetListingId: listingId,
        offerType,
        offeredItems: selectedItems,
      };

      if (message.trim()) {
        offerData.message = message.trim();
      }

      if (offerType === 'cash' || offerType === 'both') {
        offerData.cashAmount = parseFloat(cashAmount) || 0;
      }

      await offersApi.createOffer(offerData);
      
      // Navigate to chat or success page
      router.push(`/chat?userId=${displayTargetListing.owner.id}`);
    } catch (error) {
      console.error('Error creating offer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedItemsValue = selectedItems.reduce((total, itemId) => {
    const item = displayUserListings.find(l => l.id === itemId);
    return total + (item?.price || 0);
  }, 0);

  const totalOfferValue = selectedItemsValue + (parseFloat(cashAmount) || 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
          <h1 className="text-xl font-semibold text-gray-900">Make a Proposal</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Target Item */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">You want</h2>
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                <img
                  src={displayTargetListing.images[0]}
                  alt={displayTargetListing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <Badge variant="secondary" className="text-xs mb-1">
                  {displayTargetListing.category}
                </Badge>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {displayTargetListing.title}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  Condition: {displayTargetListing.condition}
                </p>
                <p className="text-lg font-bold text-primary-600">
                  {formatNaira(displayTargetListing.price * 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <ArrowUpDown className="w-6 h-6 text-primary-600" />
          </div>
        </div>

        {/* Offer Type Selection */}
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Your offer</h2>
            
            <div className="space-y-3 mb-4">
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                     style={{ borderColor: offerType === 'item' ? '#1E3A8A' : '#E5E7EB' }}>
                <input
                  type="radio"
                  name="offerType"
                  value="item"
                  checked={offerType === 'item'}
                  onChange={(e) => setOfferType(e.target.value as 'item')}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  offerType === 'item' ? 'border-primary-600' : 'border-gray-300'
                }`}>
                  {offerType === 'item' && (
                    <div className="w-2 h-2 rounded-full bg-primary-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">Trade items</div>
                  <div className="text-sm text-gray-500">Exchange your items</div>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                     style={{ borderColor: offerType === 'cash' ? '#1E3A8A' : '#E5E7EB' }}>
                <input
                  type="radio"
                  name="offerType"
                  value="cash"
                  checked={offerType === 'cash'}
                  onChange={(e) => setOfferType(e.target.value as 'cash')}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  offerType === 'cash' ? 'border-primary-600' : 'border-gray-300'
                }`}>
                  {offerType === 'cash' && (
                    <div className="w-2 h-2 rounded-full bg-primary-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">Cash offer</div>
                  <div className="text-sm text-gray-500">Buy with money</div>
                </div>
              </label>

              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                     style={{ borderColor: offerType === 'both' ? '#1E3A8A' : '#E5E7EB' }}>
                <input
                  type="radio"
                  name="offerType"
                  value="both"
                  checked={offerType === 'both'}
                  onChange={(e) => setOfferType(e.target.value as 'both')}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                  offerType === 'both' ? 'border-primary-600' : 'border-gray-300'
                }`}>
                  {offerType === 'both' && (
                    <div className="w-2 h-2 rounded-full bg-primary-600" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">Items + Cash</div>
                  <div className="text-sm text-gray-500">Combine both</div>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Cash Amount Input */}
        {(offerType === 'cash' || offerType === 'both') && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Cash Amount</h3>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                <Input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="0"
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Item Selection */}
        {(offerType === 'item' || offerType === 'both') && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Select your items</h3>
              
              {displayUserListings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">No items to trade</p>
                  <Button onClick={() => router.push('/listings/create')}>
                    Post an item first
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayUserListings.map((listing) => (
                    <div
                      key={listing.id}
                      onClick={() => handleItemSelect(listing.id)}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedItems.includes(listing.id)
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden mr-3">
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{listing.title}</h4>
                        <p className="text-sm text-gray-600">{listing.category}</p>
                        <p className="text-sm font-semibold text-primary-600">
                          {formatNaira(listing.price * 100)}
                        </p>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedItems.includes(listing.id)
                          ? 'border-primary-600 bg-primary-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedItems.includes(listing.id) && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Message */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Add a message (optional)</h3>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell them why you want this item..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </CardContent>
        </Card>

        {/* Offer Summary */}
        {(selectedItems.length > 0 || cashAmount) && (
          <Card className="border-primary-200 bg-primary-50">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-2">Offer Summary</h3>
              <div className="space-y-1 text-sm">
                {selectedItems.length > 0 && (
                  <p>Items value: <span className="font-semibold">{formatNaira(selectedItemsValue * 100)}</span></p>
                )}
                {cashAmount && (
                  <p>Cash: <span className="font-semibold">{formatNaira(parseFloat(cashAmount) * 100)}</span></p>
                )}
                <div className="border-t border-primary-200 pt-2 mt-2">
                  <p className="font-semibold">Total offer: {formatNaira(totalOfferValue * 100)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmitOffer}
          disabled={isSubmitting || (offerType !== 'cash' && selectedItems.length === 0) || (offerType === 'cash' && !cashAmount)}
          className="w-full py-3 text-lg font-medium"
        >
          {isSubmitting ? 'Sending Proposal...' : 'Send Proposal'}
        </Button>
      </div>
    </div>
  );
}