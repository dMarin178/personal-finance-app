'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authorizedFetch, isUnauthorizedError } from '@presentation/lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string;
}

interface CreditCard {
  id: string;
  name: string;
  currentBalance: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [salaryInput, setSalaryInput] = useState('');
  const [salaryError, setSalaryError] = useState('');
  const [cardsError, setCardsError] = useState('');
  const [loadingCards, setLoadingCards] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData) as User;
    setUser(parsedUser);

    const storedSalary = localStorage.getItem(`monthlySalary:${parsedUser.id}`);
    if (storedSalary) {
      setSalaryInput(storedSalary);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      router.push('/login');
      return;
    }

    const loadCards = async () => {
      setLoadingCards(true);
      setCardsError('');

      try {
        const response = await authorizedFetch('/api/credit-cards');

        const data = await response.json();

        if (!response.ok) {
          setCardsError(data.error || 'Failed to load your credit cards.');
          return;
        }

        setCards(data.cards || []);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          router.push('/login');
          return;
        }

        setCardsError('An unexpected error occurred while loading your cards.');
      } finally {
        setLoadingCards(false);
      }
    };

    void loadCards();
  }, [user, router]);

  const totalCardPayments = cards.reduce((sum, card) => sum + card.currentBalance, 0);
  const monthlySalary = Number(salaryInput) || 0;
  const projectedRemaining = monthlySalary - totalCardPayments;

  const handleSaveSalary = () => {
    if (!user) {
      return;
    }

    const salary = Number(salaryInput);

    if (Number.isNaN(salary) || salary < 0) {
      setSalaryError('Salary must be a valid number greater than or equal to 0.');
      return;
    }

    localStorage.setItem(`monthlySalary:${user.id}`, String(salary));
    setSalaryError('');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch {
      // Clear client auth state even if server cookie cleanup fails.
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
          <button onClick={handleLogout} className="btn btn-secondary w-full sm:w-auto">
            Logout
          </button>
        </div>
      </div>

      <div className="card mb-4 sm:mb-6">
        <h2 className="mb-3 text-lg font-bold sm:text-xl">Monthly Projection</h2>
        <p className="mb-4 text-sm text-gray-600 sm:text-base">
          Enter your monthly salary to see how much money you will have left after paying all current balances from your credit cards.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            type="number"
            min="0"
            step="0.01"
            className="input"
            placeholder="Example: 2500"
            value={salaryInput}
            onChange={(event) => setSalaryInput(event.target.value)}
          />
          <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={handleSaveSalary}>
            Save Salary
          </button>
        </div>

        {salaryError ? <p className="mt-2 text-sm text-red-600">{salaryError}</p> : null}

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">Monthly salary</p>
            <p className="mt-1 text-xl font-bold text-blue-900">{formatCurrency(monthlySalary)}</p>
          </div>
          <div className="rounded-lg bg-amber-50 p-4">
            <p className="text-sm text-amber-700">Total card payments</p>
            <p className="mt-1 text-xl font-bold text-amber-900">{formatCurrency(totalCardPayments)}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Money left after payments</p>
            <p
              className={[
                'mt-1 text-xl font-bold',
                projectedRemaining < 0 ? 'text-red-700' : 'text-emerald-900',
              ].join(' ')}
            >
              {formatCurrency(projectedRemaining)}
            </p>
          </div>
        </div>

        {cardsError ? <p className="mt-4 text-sm text-red-600">{cardsError}</p> : null}

        {!loadingCards && cards.length > 0 ? (
          <div className="mt-5">
            <p className="text-sm font-semibold text-gray-700">Current card balances</p>
            <div className="mt-2 space-y-2">
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                >
                  <span className="text-sm text-gray-700">{card.name}</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(card.currentBalance)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
        <div className="card">
          <h2 className="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">Welcome, {user?.name}!</h2>
          <p className="text-gray-600 mb-4">Email: {user?.email}</p>
          <a href="/credit-cards" className="btn btn-primary inline-block w-full text-center sm:w-auto">
            View Credit Cards
          </a>
        </div>

        <div className="card">
          <h2 className="mb-3 text-lg font-bold sm:mb-4 sm:text-xl">Quick Actions</h2>
          <div className="flex flex-col gap-2">
            <a href="/credit-cards/add" className="btn btn-primary">
              Add Credit Card
            </a>
            <a href="/expenses/add" className="btn btn-secondary">
              Add Expense
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
