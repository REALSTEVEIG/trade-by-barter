'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { listingsApi } from '@/lib/api';
import { CATEGORIES, PRODUCT_CONDITIONS, NIGERIAN_STATES } from '@/lib/utils';
import { useAuth, withAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface CreateListingFormData {
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
  isCashOnly: boolean;
  swapPreferences: string;
  images: File[];
}

const TRADE_OPTIONS = [
  { value: 'swap', label: 'Swap only', description: 'Trade for other items only' },
  { value: 'cash', label: 'Cash only', description: 'Sell for money only' },
  { value: 'both', label: 'Both', description: 'Open to cash or trade' }
];

function CreateListingPageComponent(): React.ReactElement {
  const { user: _user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateListingFormData>({
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
    isCashOnly: false,
    swapPreferences: '',
    images: []
  });

  const [selectedImages, setSelectedImages] = useState<string[]>([]);

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
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: keyof CreateListingFormData, value: string | number | boolean) => {
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
          isCashOnly: false,
        }));
        break;
      case 'cash':
        setFormData(prev => ({
          ...prev,
          acceptsCash: true,
          acceptsSwap: false,
          isSwapOnly: false,
          isCashOnly: true,
        }));
        break;
      case 'both':
      default:
        setFormData(prev => ({
          ...prev,
          acceptsCash: true,
          acceptsSwap: true,
          isSwapOnly: false,
          isCashOnly: false,
        }));
        break;
    }
  };

  const getCurrentTradeType = (): string => {
    if (formData.isSwapOnly) {
      return 'swap';
    } else if (formData.isCashOnly) {
      return 'cash';
    } else {
      return 'both';
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Required Field', 'Title is required');
      return false;
    }
    if (!formData.category) {
      toast.error('Required Field', 'Category is required');
      return false;
    }
    if (!formData.condition) {
      toast.error('Required Field', 'Condition is required');
      return false;
    }
    if (!formData.state) {
      toast.error('Required Field', 'State is required');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Required Field', 'City is required');
      return false;
    }
    if (formData.images.length === 0) {
      toast.error('Required Field', 'At least one photo is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Create FormData for the listing
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
      formDataToSend.append('isCashOnly', formData.isCashOnly.toString());
      
      if (formData.swapPreferences) {
        formDataToSend.append('swapPreferences', JSON.stringify([formData.swapPreferences]));
      }
      
      // Add images to form data
      formData.images.forEach((image, _index) => {
        formDataToSend.append(`images`, image);
      });

      await listingsApi.createListing(formDataToSend);
      
      toast.success(
        'Success',
        'Your item has been posted successfully and is now live!'
      );
      
      router.push('/feed');
    } catch (error: any) {
      console.error('Error creating listing:', error);
      let errorMessage = error.response?.data?.message ||
                        error.response?.data?.originalError ||
                        'Failed to create listing';
      
      // Clean up error message to remove redundant prefixes
      errorMessage = errorMessage.replace(/^(Validation [Ee]rror:?\s*)/i, '')
                                 .replace(/^(Internal [Ss]erver [Ee]rror:?\s*)/i, '')
                                 .replace(/^([Ee]rror:?\s*)/i, '')
                                 .replace(/^(Failed to upload file to S3:\s*)/i, '');
      
      
      toast.error(
        'Failed to Post Item',
        errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-xl font-semibold text-gray-900">Post an Item</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Photo Upload */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Photos</h2>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    ×
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
                  value={formData.priceInKobo > 0 ? (formData.priceInKobo / 100).toString() : ''}
                  onChange={(e) => handleInputChange('priceInKobo', e.target.value ? parseFloat(e.target.value) * 100 : 0)}
                  placeholder="Enter estimated value"
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
              <div>
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
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 text-lg font-medium"
        >
          {isLoading ? 'Posting...' : 'Post Item'}
        </Button>
      </form>
    </div>
  );
}

const CreateListingPage = withAuth(CreateListingPageComponent);
export default CreateListingPage;