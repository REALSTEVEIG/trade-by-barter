import * as React from 'react';
import { Metadata } from 'next';
import FeedPage from '@/components/pages/feed-page';

export const metadata: Metadata = {
  title: 'Marketplace - TradeByBarter',
  description: 'Browse thousands of items available for trade across Nigeria.',
  keywords: ['marketplace', 'trade', 'barter', 'Nigeria', 'items', 'exchange'],
};

export default function Feed(): React.ReactElement {
  return <FeedPage />;
}