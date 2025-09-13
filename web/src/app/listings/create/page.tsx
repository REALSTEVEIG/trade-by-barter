import * as React from 'react';
import { Metadata } from 'next';
import CreateListingPage from '@/components/pages/create-listing-page';

export const metadata: Metadata = {
  title: 'Post an Item - TradeByBarter',
  description: 'Create a new listing to trade your items with others.',
  keywords: ['post', 'create', 'listing', 'trade', 'sell'],
};

export default function CreateListing(): React.ReactElement {
  return <CreateListingPage />;
}