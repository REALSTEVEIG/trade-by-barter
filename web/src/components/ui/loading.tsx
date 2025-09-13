import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loading({ size = 'md', className }: LoadingProps): React.ReactElement {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        className={cn('animate-spin text-primary', sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export interface LoadingPageProps {
  message?: string;
  className?: string;
}

export function LoadingPage({ message = 'Loading...', className }: LoadingPageProps): React.ReactElement {
  return (
    <div className={cn('min-h-screen flex flex-col items-center justify-center bg-background-light', className)}>
      <Loading size="lg" />
      <p className="mt-4 text-neutral-gray">{message}</p>
    </div>
  );
}

export function LoadingOverlay({ className }: { className?: string }): React.ReactElement {
  return (
    <div className={cn('fixed inset-0 bg-black/50 flex items-center justify-center z-50', className)}>
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <Loading size="lg" />
        <p className="mt-4 text-neutral-dark">Loading...</p>
      </div>
    </div>
  );
}

export default Loading;