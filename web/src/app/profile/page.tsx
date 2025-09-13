import * as React from 'react';
import { Metadata } from 'next';
import ProfilePage from '@/components/pages/profile-page';

export const metadata: Metadata = {
  title: 'Profile - TradeByBarter',
  description: 'View and manage your profile, listings, and trading history.',
  keywords: ['profile', 'user', 'listings', 'trades'],
};

export default function Profile(): React.ReactElement {
  return <ProfilePage />;
}