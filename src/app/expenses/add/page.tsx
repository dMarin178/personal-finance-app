'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authorizedFetch, isUnauthorizedError } from '@presentation/lib/auth-client';

type CreditCard = {
  id: string;
  name: string;
  currentBalance: number;
  availableCredit: number;
};

type ExpenseFormData = {
  creditCardId: string;
  description: string;
  amount: string;
  category: string;
  date: string;
};

const CATEGORIES = [
  'Food',
  'Transportation',
  'Health',
  'Shopping',
  'Entertainment',
  'Services',
  'Other',
] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export default function AddExpensePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingCards, setLoadingCards] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<ExpenseFormData>({
    creditCardId: 'none',
    description: '',
    amount: '',
    category: CATEGORIES[0],
    date: new Date().toISOString().slice(0, 10),
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
    if (checkingAuth) {
      return;
    }

    const loadCards = async () => {
      setLoadingCards(true);
      setError('');

      try {
        const response = await authorizedFetch('/api/credit-cards');

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load your credit cards.');
          return;
        }

        const cardsData = (data.cards || []) as CreditCard[];
        const preferredCardId = searchParams.get('cardId');
        const selectedCard = preferredCardId && cardsData.some((card) => card.id === preferredCardId)
          ? preferredCardId
          : 'none';

        setCards(cardsData);
        setFormData((current) => ({
          ...current,
          creditCardId: selectedCard,
        }));
      } catch (error) {
        if (isUnauthorizedError(error)) {
          router.push('/login');
          return;
        }

        setError('An unexpected error occurred while loading cards.');
      } finally {
        setLoadingCards(false);
      }
    };

    void loadCards();
  }, [checkingAuth, router, searchParams]);

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === formData.creditCardId) || null,
    [cards, formData.creditCardId]
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingSubmit(true);
    setError('');
    setSuccess('');

    const amount = Number(formData.amount);

    if (Number.isNaN(amount) || amount <= 0) {
      setError('Amount must be greater than zero.');
      setLoadingSubmit(false);
      return;
    }

    try {
      const response = await authorizedFetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditCardId: formData.creditCardId === 'none' ? undefined : formData.creditCardId,
          description: formData.description.trim(),
          amount,
          category: formData.category,
          date: formData.date,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add expense.');
        return;
      }

      setSuccess('Expense added successfully.');
      setFormData((current) => ({
        ...current,
        description: '',
        amount: '',
      }));

      window.setTimeout(() => {
        router.push('/credit-cards');
      }, 1000);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.push('/login');
        return;
      }

      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (checkingAuth) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-4 sm:min-h-[calc(100vh-4rem)]">
        <div className="card w-full max-w-2xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Add Expense</h1>
              <p className="mt-2 text-gray-600">
                Register a new expense and assign it to one of your credit cards.
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

          {error ? <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{error}</div> : null}
          {success ? <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">{success}</div> : null}

          {loadingCards ? (
            <p className="text-gray-600">Loading your cards...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="creditCardId" className="mb-2 block text-sm font-medium">
                  Expense Source
                </label>
                <select
                  id="creditCardId"
                  name="creditCardId"
                  className="input"
                  value={formData.creditCardId}
                  onChange={handleChange}
                >
                  <option value="none">Direct monthly expense (no credit card)</option>
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name} - Available {formatCurrency(card.availableCredit)}
                    </option>
                  ))}
                </select>
              </div>

              {cards.length === 0 ? (
                <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                  You do not have credit cards yet. This expense will be saved as a direct monthly expense.
                </p>
              ) : null}

              {selectedCard ? (
                <div className="grid grid-cols-1 gap-3 rounded-lg bg-blue-50 p-4 sm:grid-cols-2">
                  <p className="text-sm text-blue-900">
                    Current balance: <span className="font-semibold">{formatCurrency(selectedCard.currentBalance)}</span>
                  </p>
                  <p className="text-sm text-blue-900">
                    Available credit: <span className="font-semibold">{formatCurrency(selectedCard.availableCredit)}</span>
                  </p>
                </div>
              ) : null}

              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  className="input"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Example: Grocery store"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="amount" className="mb-2 block text-sm font-medium">
                    Amount
                  </label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    className="input"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="35.50"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="mb-2 block text-sm font-medium">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="input"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="date" className="mb-2 block text-sm font-medium">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="input"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" disabled={loadingSubmit} className="btn btn-primary w-full">
                {loadingSubmit ? 'Saving expense...' : 'Add Expense'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}