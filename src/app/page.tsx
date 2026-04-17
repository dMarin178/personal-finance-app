'use client';

import { useRedirectAuthenticated } from '@presentation/hooks/use-redirect-authenticated';

export default function Home() {
  const { isCheckingAuth } = useRedirectAuthenticated();

  if (isCheckingAuth) {
    return null;
  }

  return (
    <div className="container">
      <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center py-4 text-center sm:min-h-[calc(100vh-4rem)]">
        <h1 className="mb-3 text-3xl font-bold sm:mb-4 sm:text-4xl">Welcome to FinanceApp</h1>
        <p className="mb-6 max-w-xl text-base text-gray-600 sm:mb-8 sm:text-xl">
          Manage your credit cards and expenses in one place
        </p>
        <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:gap-4">
          <a href="/register" className="btn btn-primary w-full text-center sm:w-auto">
            Get Started
          </a>
          <a href="/login" className="btn btn-secondary w-full text-center sm:w-auto">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
