import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useRedirectAuthenticated() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      router.replace('/dashboard');
      return;
    }

    setIsCheckingAuth(false);
  }, [router]);

  return { isCheckingAuth };
}