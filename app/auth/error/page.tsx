'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: { [key: string]: string } = {
    AccessDenied: 'Access denied. Please try signing in with a different account.',
    Configuration: 'There is a problem with the server configuration.',
    Default: 'An error occurred during authentication. Please try again.',
  };

  const errorMessage = errorMessages[error as string] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-600">Authentication Error</h2>
          <p className="mt-2 text-gray-600">{errorMessage}</p>
          <p className="mt-1 text-sm text-gray-500">Error code: {error}</p>
        </div>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/signin">Try Again</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 