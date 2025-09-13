'use client';

import * as React from 'react';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth, withAuth } from '@/contexts/auth-context';
import { authApi } from '@/lib/api';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  profilePicture?: File | null;
  currentAvatar?: string;
}

function EditProfilePageComponent(): React.ReactElement {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profilePicture: null,
    currentAvatar: user?.avatar || ''
  });

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, profilePicture: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, profilePicture: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData for profile update
      const updateData = new FormData();
      updateData.append('firstName', formData.firstName);
      updateData.append('lastName', formData.lastName);
      updateData.append('phone', formData.phone);
      updateData.append('bio', formData.bio);
      updateData.append('location', formData.location);

      // Add profile picture if one was selected
      if (formData.profilePicture) {
        updateData.append('profilePicture', formData.profilePicture);
      }

      await authApi.updateProfile(updateData);
      
      // Refresh user data
      await refreshUser();
      
      router.push('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const currentImage = imagePreview || formData.currentAvatar;

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
          <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Profile Picture */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h2>
            
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <Avatar className="w-32 h-32">
                  {currentImage ? (
                    <AvatarImage src={currentImage} alt="Profile picture" />
                  ) : (
                    <AvatarFallback className="text-2xl bg-primary-100 text-primary-600">
                      <User className="w-12 h-12" />
                    </AvatarFallback>
                  )}
                </Avatar>
                
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  {currentImage ? 'Change Photo' : 'Upload Photo'}
                </Button>
                
                {currentImage && !imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, currentAvatar: '' }));
                    }}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove Photo
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <p className="text-sm text-gray-500 mt-2 text-center">
                Upload a photo to help others recognize you. Max size: 5MB
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email address cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+234 800 123 4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Lagos, Nigeria"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell others about yourself..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.bio?.length || 0}/500 characters
              </p>
            </div>
          </CardContent>
        </Card>


        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading || !formData.firstName || !formData.lastName}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

const EditProfilePage = withAuth(EditProfilePageComponent);
export default EditProfilePage;