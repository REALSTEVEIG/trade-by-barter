import * as React from 'react';
import { Metadata } from 'next';
import ChatPage from '@/components/pages/chat-page';

export const metadata: Metadata = {
  title: 'Messages - TradeByBarter',
  description: 'Chat with other traders and manage your conversations.',
  keywords: ['chat', 'messages', 'communication', 'trading'],
};

export default function Chat(): React.ReactElement {
  return <ChatPage />;
}