'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRedirectAuthenticated } from '@presentation/hooks/use-redirect-authenticated';

export default function LoginPage() {
  const router = useRouter();
  const { isCheckingAuth } = useRedirectAuthenticated();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Store tokens in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return null;
  }

  return (
    <div className="container">
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-4 sm:min-h-[calc(100vh-4rem)]">
        <div className="card w-full max-w-md">
          <h2 className="mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">Sign In</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="input"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600 sm:text-base">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-blue-600 hover:text-blue-700">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
