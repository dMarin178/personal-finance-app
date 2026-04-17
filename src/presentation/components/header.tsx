'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      setIsLoggedIn(Boolean(accessToken && user));
    };

    checkAuth();

    // Update nav state when auth changes in another tab.
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [pathname]);

  return (
    <nav className="bg-blue-600 text-white">
      <div className="container">
        <div className="flex h-14 items-center justify-between sm:h-16">
          <h1 className="text-lg font-bold sm:text-2xl">FinanceApp</h1>
          <ul className="flex items-center gap-3 text-sm sm:gap-6 sm:text-base">
            {isLoggedIn && (
              <li>
                <Link href="/dashboard" className="hover:text-blue-200">
                  Dashboard
                </Link>
              </li>
            )}
            {!isLoggedIn && (
              <>
                <li>
                  <Link href="/" className="hover:text-blue-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-blue-200">
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}