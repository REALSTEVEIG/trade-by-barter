import * as React from 'react';
import { Metadata } from 'next';
import WalletPage from '@/components/pages/wallet-page';

export const metadata: Metadata = {
  title: 'Wallet - TradeByBarter',
  description: 'Manage your TradeByBarter wallet, view transactions, and handle payments.',
  keywords: ['wallet', 'payments', 'transactions', 'Nigeria', 'naira'],
};

export default function Wallet(): React.ReactElement {
  return <WalletPage />;
}