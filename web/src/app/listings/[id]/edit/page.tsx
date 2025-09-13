'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Camera, ArrowLeft, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { listingsApi } from '@/lib/api';
import { CATEGORIES, PRODUCT_CONDITIONS, NIGERIAN_STATES } from '@/lib/utils';
import { useAuth, withAuth } from '@/contexts/auth-context';
import Image from 'next/image';

interface EditListingFormData {
  title: string;
  description: string;
  category: string;
  condition: string;
  priceInKobo: number;
  state: string;
  city: string;
  specificLocation: string;
  acceptsCash: boolean;
  acceptsSwap: boolean;
  isSwapOnly: boolean;
  swapPreferences: string;
  images: File[];
  existingImages: string[];
}

const TRADE_OPTIONS = [
  { value: 'swap', label: 'Swap only', description: 'Trade for other items only' },
  { value: 'cash', label: 'Cash only', description: 'Sell for money only' },
  { value: 'both', label: 'Both', description: 'Open to cash or trade' }
];

function EditListingPageComponent(): React.ReactElement {
  const { user } = useAuth();
  const { id } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [formData, setFormData] = useState<EditListingFormData>({
    title: '',
    description: '',
    category: '',
    condition: '',
    priceInKobo: 0,
    state: '',
    city: '',
    specificLocation: '',
    acceptsCash: true,
    acceptsSwap: true,
    isSwapOnly: false,
    swapPreferences: '',
    images: [],
    existingImages: []
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // Load existing listing data
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsInitialLoading(true);
        const response = await listingsApi.getListing(id as string);
        const listing = response.data as any;

        // Check if user owns this listing
        if (listing.owner.id !== user?.id) {
          router.push(`/listings/${id}`);
          return;
        }

        setFormData({
          title: listing.title || '',
          description: listing.description || '',
          category: listing.category || '',
          condition: listing.condition || '',
          priceInKobo: listing.priceInKobo || 0,
          state: listing.state || '',
          city: listing.city || '',
          specificLocation: listing.specificLocation || '',
          acceptsCash: listing.acceptsCash,
          acceptsSwap: listing.acceptsSwap,
          isSwapOnly: listing.isSwapOnly,
          swapPreferences: listing.swapPreferences?.join(', ') || '',
          images: [],
          existingImages: listing.images || []
        });

        setSelectedImages(listing.images || []);
      } catch (error: any) {
        console.error('Error fetching listing:', error);
        setError(error.response?.data?.message || 'Failed to load listing');
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (id && user) {
      fetchListing();
    }
  }, [id, user, router]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const imageUrls = fileArray.map(file => URL.createObjectURL(file));
      
      setSelectedImages(prev => [...prev, ...imageUrls]);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...fileArray]
      }));
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = selectedImages[index];
    const isExistingImage = imageToRemove ? formData.existingImages.includes(imageToRemove) : false;
    
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    
    if (isExistingImage) {
      // Remove from existing images
      setFormData(prev => ({
        ...prev,
        existingImages: prev.existingImages.filter(img => img !== imageToRemove)
      }));
    } else {
      // Remove from new images
      const newImageIndex = index - formData.existingImages.length;
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== newImageIndex)
      }));
    }
  };

  const handleInputChange = (field: keyof EditListingFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTradeTypeChange = (tradeType: string) => {
    switch (tradeType) {
      case 'swap':
        setFormData(prev => ({
          ...prev,
          acceptsCash: false,
          acceptsSwap: true,
          isSwapOnly: true,
        }));
        break;
      case 'cash':
        setFormData(prev => ({
          ...prev,
          acceptsCash: true,
          acceptsSwap: false,
          isSwapOnly: false,
        }));
        break;
      case 'both':
      default:
        setFormData(prev => ({
          ...prev,
          acceptsCash: true,
          acceptsSwap: true,
          isSwapOnly: false,
        }));
        break;
    }
  };

  const getCurrentTradeType = (): string => {
    if (formData.isSwapOnly && formData.acceptsSwap && !formData.acceptsCash) {
      return 'swap';
    } else if (formData.acceptsCash && !formData.acceptsSwap) {
      return 'cash';
    } else {
      return 'both';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData for the listing update
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('priceInKobo', formData.priceInKobo.toString());
      formDataToSend.append('state', formData.state);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('specificLocation', formData.specificLocation);
      formDataToSend.append('acceptsCash', formData.acceptsCash.toString());
      formDataToSend.append('acceptsSwap', formData.acceptsSwap.toString());
      formDataToSend.append('isSwapOnly', formData.isSwapOnly.toString());
      
      if (formData.swapPreferences) {
        formDataToSend.append('swapPreferences', JSON.stringify([formData.swapPreferences]));
      }
      
      // Add existing images to keep
      formDataToSend.append('existingImages', JSON.stringify(formData.existingImages));
      
      // Add new images
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      await listingsApi.updateListing(id as string, formDataToSend);
      router.push(`/listings/${id}`);
    } catch (error: any) {
      console.error('Error updating listing:', error);
      setError(error.response?.data?.message || 'Failed to update listing');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
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
          <h1 className="text-xl font-semibold text-gray-900">Edit Listing</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Photo Upload */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Photos</h2>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={image}
                    alt={`Upload ${index + 1}`}
                    width={100}
                    height={96}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {selectedImages.length < 6 && (
                <label className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                  <Camera className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Add Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            
            <p className="text-sm text-gray-500">Add up to 6 photos. First photo will be your main image.</p>
          </CardContent>
        </Card>

        {/* Item Details */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Item Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="What are you trading?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your item in detail..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                    required
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <div className="relative">
                  <select
                    value={formData.condition}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                    required
                  >
                    <option value="">Select condition</option>
                    {PRODUCT_CONDITIONS.map((condition) => (
                      <option key={condition.value} value={condition.value}>{condition.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value (₦)
                </label>
                <Input
                  value={formData.priceInKobo / 100}
                  onChange={(e) => handleInputChange('priceInKobo', parseFloat(e.target.value || '0') * 100)}
                  placeholder="0"
                  type="number"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">Enter the estimated value of your item</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <div className="relative">
                  <select
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                    required
                  >
                    <option value="">Select state</option>
                    {NIGERIAN_STATES.map((state: string) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <Input
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter your city"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Location (Optional)
              </label>
              <Input
                value={formData.specificLocation}
                onChange={(e) => handleInputChange('specificLocation', e.target.value)}
                placeholder="e.g., Computer Village, Ikeja"
              />
            </div>
          </CardContent>
        </Card>

        {/* Trading Options */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">How do you want to trade?</h2>
            
            <div className="space-y-3">
              {TRADE_OPTIONS.map(option => {
                const currentTradeType = getCurrentTradeType();
                return (
                  <label key={option.value} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                         style={{ borderColor: currentTradeType === option.value ? '#1E3A8A' : '#E5E7EB' }}>
                    <input
                      type="radio"
                      name="tradeType"
                      value={option.value}
                      checked={currentTradeType === option.value}
                      onChange={(e) => handleTradeTypeChange(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      currentTradeType === option.value ? 'border-primary-600' : 'border-gray-300'
                    }`}>
                      {currentTradeType === option.value && (
                        <div className="w-2 h-2 rounded-full bg-primary-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            {formData.acceptsSwap && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are you looking for in exchange? (Optional)
                </label>
                <Input
                  value={formData.swapPreferences}
                  onChange={(e) => handleInputChange('swapPreferences', e.target.value)}
                  placeholder="e.g., iPhone, Laptop, etc."
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !formData.title || !formData.category || !formData.condition || !formData.state || !formData.city}
          className="w-full py-3 text-lg font-medium"
        >
          {isLoading ? 'Updating...' : 'Update Listing'}
        </Button>
      </form>
    </div>
  );
}

const EditListingPage = withAuth(EditListingPageComponent);
export default EditListingPage;