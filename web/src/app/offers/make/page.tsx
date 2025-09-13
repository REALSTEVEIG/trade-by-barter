import * as React from 'react';
import { Metadata } from 'next';
import { Suspense } from 'react';
import MakeOfferPage from '@/components/pages/make-offer-page';

export const metadata: Metadata = {
  title: 'Make an Offer - TradeByBarter',
  description: 'Propose a trade for an item you want.',
  keywords: ['offer', 'trade', 'proposal', 'exchange'],
};

export default function MakeOffer(): React.ReactElement {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MakeOfferPage />
    </Suspense>
  );
}