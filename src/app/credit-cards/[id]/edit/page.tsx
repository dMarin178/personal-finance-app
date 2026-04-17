'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authorizedFetch, isUnauthorizedError } from '@presentation/lib/auth-client';

type EditCardFormData = {
  name: string;
  creditLimit: string;
  paymentLimit: string;
};

type CardResponse = {
  card: {
    id: string;
    name: string;
    creditLimit: number;
    paymentLimit: number;
    currentBalance: number;
  };
};

export default function EditCreditCardPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const cardId = params.id;

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingCard, setLoadingCard] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [formData, setFormData] = useState<EditCardFormData>({
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

  useEffect(() => {
    if (checkingAuth || !cardId) {
      return;
    }

    const loadCard = async () => {
      setLoadingCard(true);
      setError('');

      try {
        const response = await authorizedFetch(`/api/credit-cards/${cardId}`);

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load credit card.');
          return;
        }

        const cardData = (data as CardResponse).card;
        setCurrentBalance(cardData.currentBalance);
        setFormData({
          name: cardData.name,
          creditLimit: String(cardData.creditLimit),
          paymentLimit: String(cardData.paymentLimit),
        });
      } catch (error) {
        if (isUnauthorizedError(error)) {
          router.push('/login');
          return;
        }

        setError('An unexpected error occurred while loading your card.');
      } finally {
        setLoadingCard(false);
      }
    };

    void loadCard();
  }, [checkingAuth, cardId, router]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingSave(true);
    setError('');
    setSuccess('');

    const creditLimit = Number(formData.creditLimit);
    const paymentLimit = Number(formData.paymentLimit);

    if (Number.isNaN(creditLimit) || Number.isNaN(paymentLimit)) {
      setError('Credit and payment limits must be valid numbers.');
      setLoadingSave(false);
      return;
    }

    try {
      const response = await authorizedFetch(`/api/credit-cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          creditLimit,
          paymentLimit,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update credit card.');
        return;
      }

      setSuccess('Credit card updated successfully.');

      window.setTimeout(() => {
        router.push('/credit-cards');
      }, 900);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.push('/login');
        return;
      }

      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoadingSave(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Delete this credit card? This will also remove all expenses linked to it.'
    );
    if (!confirmed) {
      return;
    }

    setLoadingDelete(true);
    setError('');
    setSuccess('');

    try {
      const response = await authorizedFetch(`/api/credit-cards/${cardId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to delete credit card.');
        return;
      }

      router.push('/credit-cards');
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.push('/login');
        return;
      }

      setError('An unexpected error occurred while deleting your credit card.');
    } finally {
      setLoadingDelete(false);
    }
  };

  if (checkingAuth || loadingCard) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-4 sm:min-h-[calc(100vh-4rem)]">
        <div className="card w-full max-w-lg">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Edit Credit Card</h1>
              <p className="mt-2 text-gray-600">
                Update card name and limits while keeping current balance intact.
              </p>
              <p className="mt-2 text-sm text-gray-500">Current balance: {currentBalance.toFixed(2)}</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/credit-cards')}
              className="btn btn-secondary w-full sm:w-auto"
            >
              Back
            </button>
          </div>

          {error ? <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{error}</div> : null}
          {success ? <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">{success}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Card Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="creditLimit" className="mb-2 block text-sm font-medium">
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
                required
              />
            </div>

            <div>
              <label htmlFor="paymentLimit" className="mb-2 block text-sm font-medium">
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
                required
              />
            </div>

            <button type="submit" disabled={loadingSave || loadingDelete} className="btn btn-primary w-full">
              {loadingSave ? 'Saving changes...' : 'Update Credit Card'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loadingDelete || loadingSave}
              className="btn w-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingDelete ? 'Deleting Credit Card...' : 'Delete Credit Card'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
