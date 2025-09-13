import * as React from 'react';
import { Metadata } from 'next';
import LoginForm from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Sign In - TradeByBarter',
  description: 'Sign in to your TradeByBarter account to start trading.',
};

export default function LoginPage(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center">
            <div className="splash-logo w-12 h-12">
              <span className="text-white font-bold text-xl">X</span>
            </div>
            <span className="ml-3 text-2xl font-bold text-neutral-dark font-display">
              TradeByBarter
            </span>
          </div>
          <p className="mt-2 text-sm text-neutral-gray">
            Trade anything...
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}