'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authorizedFetch, isUnauthorizedError } from '@presentation/lib/auth-client';

type CreditCard = {
  id: string;
  name: string;
  creditLimit: number;
  paymentLimit: number;
  currentBalance: number;
  availableCredit: number;
  lastDigits?: string;
  issuer?: string;
};

type Expense = {
  id: string;
  creditCardId: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
};

type ExpensesResponse = {
  expenses: Expense[];
  totalAmount: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export default function CreditCardsPage() {
  const router = useRouter();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expensesByCard, setExpensesByCard] = useState<Record<string, Expense[]>>({});
  const [totalsByCard, setTotalsByCard] = useState<Record<string, number>>({});
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken) {
      router.push('/login');
      return;
    }

    const loadCards = async () => {
      setLoadingCards(true);
      setError('');

      try {
        const response = await authorizedFetch('/api/credit-cards');

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load credit cards.');
          return;
        }

        setCards(data.cards || []);
        setSelectedIndex(0);
      } catch (error) {
        if (isUnauthorizedError(error)) {
          router.push('/login');
          return;
        }

        setError('An unexpected error occurred while loading your credit cards.');
      } finally {
        setLoadingCards(false);
      }
    };

    void loadCards();
  }, [router]);

  const selectedCard = cards[selectedIndex] ?? null;

  useEffect(() => {
    if (!selectedCard) {
      return;
    }

    if (expensesByCard[selectedCard.id]) {
      return;
    }

    const loadExpenses = async () => {
      setLoadingExpenses(true);

      try {
        const response = await authorizedFetch(`/api/credit-cards/${selectedCard.id}/expenses`);

        const data: ExpensesResponse | { error?: string } = await response.json();

        if (!response.ok) {
          setError(('error' in data && data.error) || 'Failed to load expenses.');
          return;
        }

        setExpensesByCard((current) => ({
          ...current,
          [selectedCard.id]: (data as ExpensesResponse).expenses,
        }));
        setTotalsByCard((current) => ({
          ...current,
          [selectedCard.id]: (data as ExpensesResponse).totalAmount,
        }));
      } catch (error) {
        if (isUnauthorizedError(error)) {
          router.push('/login');
          return;
        }

        setError('An unexpected error occurred while loading expenses.');
      } finally {
        setLoadingExpenses(false);
      }
    };

    void loadExpenses();
  }, [expensesByCard, selectedCard]);

  const selectedExpenses = selectedCard ? expensesByCard[selectedCard.id] || [] : [];
  const selectedExpensesTotal = selectedCard ? totalsByCard[selectedCard.id] || 0 : 0;

  const paymentSummary = useMemo(() => {
    if (!selectedCard) {
      return null;
    }

    const recommendedPayment = Math.min(selectedCard.currentBalance, selectedCard.paymentLimit);
    const remainingAfterPayment = Math.max(selectedCard.currentBalance - recommendedPayment, 0);
    const utilization = selectedCard.creditLimit > 0
      ? Math.round((selectedCard.currentBalance / selectedCard.creditLimit) * 100)
      : 0;

    return {
      recommendedPayment,
      remainingAfterPayment,
      utilization,
    };
  }, [selectedCard]);

  const goPrevious = () => {
    setSelectedIndex((current) => (current === 0 ? cards.length - 1 : current - 1));
  };

  const goNext = () => {
    setSelectedIndex((current) => (current === cards.length - 1 ? 0 : current + 1));
  };

  const handleDeleteExpense = async (expenseId: string, amount: number) => {
    if (!selectedCard) {
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this expense?');
    if (!confirmed) {
      return;
    }

    setDeletingExpenseId(expenseId);
    setError('');

    try {
      const response = await authorizedFetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to delete expense.');
        return;
      }

      setExpensesByCard((current) => ({
        ...current,
        [selectedCard.id]: (current[selectedCard.id] || []).filter((expense) => expense.id !== expenseId),
      }));

      setTotalsByCard((current) => ({
        ...current,
        [selectedCard.id]: Math.max((current[selectedCard.id] || 0) - amount, 0),
      }));

      setCards((current) =>
        current.map((card) => {
          if (card.id !== selectedCard.id) {
            return card;
          }

          const newBalance = Math.max(card.currentBalance - amount, 0);
          return {
            ...card,
            currentBalance: newBalance,
            availableCredit: card.creditLimit - newBalance,
          };
        })
      );
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.push('/login');
        return;
      }

      setError('An unexpected error occurred while deleting the expense.');
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCard) {
      return;
    }

    const cardIdToDelete = selectedCard.id;
    const deletedIndex = selectedIndex;

    const confirmed = window.confirm(
      `Delete ${selectedCard.name}? This will also remove all expenses linked to this card.`
    );
    if (!confirmed) {
      return;
    }

    setDeletingCardId(selectedCard.id);
    setError('');

    try {
      const response = await authorizedFetch(`/api/credit-cards/${cardIdToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to delete credit card.');
        return;
      }

      const nextCards = cards.filter((card) => card.id !== cardIdToDelete);
      setCards(nextCards);
      setSelectedIndex(nextCards.length === 0 ? 0 : Math.min(deletedIndex, nextCards.length - 1));

      setExpensesByCard((current) => {
        const nextExpenses = { ...current };
        delete nextExpenses[cardIdToDelete];
        return nextExpenses;
      });

      setTotalsByCard((current) => {
        const nextTotals = { ...current };
        delete nextTotals[cardIdToDelete];
        return nextTotals;
      });
    } catch (error) {
      if (isUnauthorizedError(error)) {
        router.push('/login');
        return;
      }

      setError('An unexpected error occurred while deleting the credit card.');
    } finally {
      setDeletingCardId(null);
    }
  };

  if (loadingCards) {
    return <div className="container">Loading your credit cards...</div>;
  }

  return (
    <div className="container">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Your Credit Cards</h1>
          <p className="mt-2 text-gray-600">
            Switch between cards to review balances, recent expenses, and what to pay before your limit.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <button type="button" onClick={() => router.push('/dashboard')} className="btn btn-secondary w-full sm:w-auto">
            Back to Dashboard
          </button>
          {selectedCard ? (
            <>
              <button
                type="button"
                onClick={() => router.push(`/credit-cards/${selectedCard.id}/edit`)}
                className="btn btn-secondary w-full sm:w-auto"
              >
                Edit Selected Card
              </button>
              <button
                type="button"
                onClick={handleDeleteCard}
                disabled={deletingCardId === selectedCard.id}
                className="btn w-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {deletingCardId === selectedCard.id ? 'Deleting Card...' : 'Delete Selected Card'}
              </button>
            </>
          ) : null}
          <button type="button" onClick={() => router.push('/credit-cards/add')} className="btn btn-primary w-full sm:w-auto">
            Add Card
          </button>
        </div>
      </div>

      {error ? <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">{error}</div> : null}

      {cards.length === 0 ? (
        <div className="card text-center">
          <h2 className="text-xl font-bold sm:text-2xl">No credit cards yet</h2>
          <p className="mt-3 text-gray-600">Create your first credit card to start tracking balances and expenses.</p>
          <div className="mt-6">
            <button type="button" onClick={() => router.push('/credit-cards/add')} className="btn btn-primary">
              Create Your First Card
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <section className="card overflow-hidden">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Card Carousel</p>
                <h2 className="mt-2 text-xl font-bold sm:text-2xl">Pick the card you want to review</h2>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <button type="button" onClick={goPrevious} className="btn btn-secondary" aria-label="Previous card">
                  Previous
                </button>
                <button type="button" onClick={goNext} className="btn btn-secondary" aria-label="Next card">
                  Next
                </button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
              <div className="relative rounded-3xl bg-slate-950 p-1 shadow-2xl">
                <div className="rounded-[1.35rem] bg-gradient-to-br from-sky-500 via-cyan-400 to-emerald-300 p-6 text-slate-950">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-800/80">
                        {selectedCard?.issuer || 'FinanceApp Card'}
                      </p>
                      <h3 className="mt-4 text-2xl font-bold sm:text-3xl">{selectedCard?.name}</h3>
                    </div>
                    <div className="rounded-full bg-white/60 px-4 py-2 text-sm font-semibold">
                      {selectedIndex + 1} / {cards.length}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-5 sm:grid-cols-2 md:mt-10 md:grid-cols-3 md:gap-6">
                    <div>
                      <p className="text-sm text-slate-800/75">Current Balance</p>
                      <p className="mt-2 text-xl font-bold sm:text-2xl">{selectedCard ? formatCurrency(selectedCard.currentBalance) : '$0.00'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-800/75">Available Credit</p>
                      <p className="mt-2 text-xl font-bold sm:text-2xl">{selectedCard ? formatCurrency(selectedCard.availableCredit) : '$0.00'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-800/75">Payment Limit</p>
                      <p className="mt-2 text-xl font-bold sm:text-2xl">{selectedCard ? formatCurrency(selectedCard.paymentLimit) : '$0.00'}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-5 border-t border-slate-900/10 pt-5 sm:mt-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6 sm:pt-6">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-800/75">Credit Limit</p>
                      <p className="mt-2 text-xl font-semibold">{selectedCard ? formatCurrency(selectedCard.creditLimit) : '$0.00'}</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-800/75">Last Digits</p>
                      <p className="mt-2 text-xl font-semibold">{selectedCard?.lastDigits || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {cards.map((card, index) => {
                  const isActive = index === selectedIndex;

                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={[
                        'rounded-2xl border p-4 text-left transition-all duration-200',
                        isActive
                          ? 'border-sky-500 bg-sky-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50/40',
                      ].join(' ')}
                    >
                      <p className="text-sm font-semibold text-gray-900">{card.name}</p>
                      <p className="mt-1 text-sm text-gray-600">Balance {formatCurrency(card.currentBalance)}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">
                        Limit {formatCurrency(card.creditLimit)}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="card h-fit">
              <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Payment Plan</p>
              <h2 className="mt-2 text-xl font-bold sm:text-2xl">Before the payment limit</h2>
              <p className="mt-3 text-gray-600">
                This summary uses the selected card&apos;s configured payment limit as the suggested amount to cover now.
              </p>

              {paymentSummary ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-slate-900 p-5 text-white">
                    <p className="text-sm text-slate-300">Suggested payment now</p>
                    <p className="mt-2 text-2xl font-bold sm:text-3xl">{formatCurrency(paymentSummary.recommendedPayment)}</p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50 p-5">
                    <p className="text-sm text-emerald-700">Balance after payment</p>
                    <p className="mt-2 text-xl font-bold text-emerald-900 sm:text-2xl">
                      {formatCurrency(paymentSummary.remainingAfterPayment)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-50 p-5">
                    <p className="text-sm text-amber-700">Credit utilization</p>
                    <p className="mt-2 text-xl font-bold text-amber-900 sm:text-2xl">{paymentSummary.utilization}%</p>
                    <div className="mt-4 h-3 rounded-full bg-amber-100">
                      <div
                        className="h-3 rounded-full bg-amber-500 transition-all"
                        style={{ width: `${Math.min(paymentSummary.utilization, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-5">
                    <p className="text-sm text-gray-500">Expenses posted on this card</p>
                    <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">{formatCurrency(selectedExpensesTotal)}</p>
                  </div>
                </div>
              ) : null}
            </aside>

            <div className="card">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-gray-500">Expenses</p>
                  <h2 className="mt-2 text-xl font-bold sm:text-2xl">Transactions for {selectedCard?.name}</h2>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => selectedCard && router.push(`/expenses/add?cardId=${selectedCard.id}`)}
                    className="btn btn-primary w-full sm:w-auto"
                  >
                    Add Expense
                  </button>
                  <div className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 text-center">
                    Total {formatCurrency(selectedExpensesTotal)}
                  </div>
                </div>
              </div>

              {loadingExpenses && !selectedExpenses.length ? (
                <p className="text-gray-600">Loading expenses...</p>
              ) : selectedExpenses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
                  No expenses found for this card yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{expense.description}</h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {expense.category} • {formatDate(expense.date)}
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-lg font-bold text-gray-900 sm:text-xl">{formatCurrency(expense.amount)}</p>
                        <p className="mt-1 text-sm text-gray-500">Registered {formatDate(expense.createdAt)}</p>
                        <button
                          type="button"
                          onClick={() => handleDeleteExpense(expense.id, expense.amount)}
                          disabled={deletingExpenseId === expense.id}
                          className="mt-2 text-sm font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingExpenseId === expense.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}