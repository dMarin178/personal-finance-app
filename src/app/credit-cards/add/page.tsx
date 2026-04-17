'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authorizedFetch, isUnauthorizedError } from '@presentation/lib/auth-client';

type CreateCardFormData = {
  name: string;
  creditLimit: string;
  paymentLimit: string;
};

export default function AddCreditCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<CreateCardFormData>({
    name: '',
    creditLimit: '',
    paymentLimit: '',
  });

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      router.push('/login');
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const creditLimit = Number(formData.creditLimit);
    const paymentLimit = Number(formData.paymentLimit);

    if (Number.isNaN(creditLimit) || Number.isNaN(paymentLimit)) {
      setError('Credit and payment limits must be valid numbers.');
      setLoading(false);
      return;
    }

    try {
      const response = await authorizedFetch('/api/credit-cards/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          creditLimit,
          paymentLimit,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create credit card.');
        return;
      }

      setSuccess('Credit card created successfully.');
      setFormData({
        name: '',
        creditLimit: '',
        paymentLimit: '',
      });

      window.setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.push('/login');
        return;
      }

      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-4 sm:min-h-[calc(100vh-4rem)]">
        <div className="card w-full max-w-lg">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Add Credit Card</h1>
              <p className="text-gray-600 mt-2">
                Register a new card with its name, total credit, and payment limit.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="btn btn-secondary w-full sm:w-auto"
            >
              Back
            </button>
          </div>

          {error ? (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{error}</div>
          ) : null}

          {success ? (
            <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">{success}</div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Card Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Example: Main Visa"
                required
              />
            </div>

            <div>
              <label htmlFor="creditLimit" className="block text-sm font-medium mb-2">
                Credit Limit
              </label>
              <input
                type="number"
                id="creditLimit"
                name="creditLimit"
                className="input"
                value={formData.creditLimit}
                onChange={handleChange}
                min="1"
                step="0.01"
                placeholder="5000"
                required
              />
            </div>

            <div>
              <label htmlFor="paymentLimit" className="block text-sm font-medium mb-2">
                Payment Limit
              </label>
              <input
                type="number"
                id="paymentLimit"
                name="paymentLimit"
                className="input"
                value={formData.paymentLimit}
                onChange={handleChange}
                min="1"
                step="0.01"
                placeholder="1500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Saving card...' : 'Create Credit Card'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}