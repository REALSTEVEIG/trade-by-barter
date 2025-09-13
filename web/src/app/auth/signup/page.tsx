import * as React from 'react';
import { Metadata } from 'next';
import SignupForm from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Create Account - TradeByBarter',
  description: 'Create your TradeByBarter account and start trading today.',
};

export default function SignupPage(): React.ReactElement {
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

        <SignupForm />
      </div>
    </div>
  );
}