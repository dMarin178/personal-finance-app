import { create } from 'zustand';

interface CreditCard {
  id: string;
  name: string;
  creditLimit: number;
  paymentLimit: number;
  currentBalance: number;
  availableCredit: number;
  lastDigits?: string;
  issuer?: string;
}

interface Expense {
  id: string;
  creditCardId: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
}

interface FinanceStore {
  creditCards: CreditCard[];
  expenses: Expense[];
  selectedCard: CreditCard | null;

  setCreditCards: (cards: CreditCard[]) => void;
  addCreditCard: (card: CreditCard) => void;
  removeCreditCard: (cardId: string) => void;

  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (expenseId: string) => void;

  selectCard: (card: CreditCard | null) => void;
}

export const useFinanceStore = create<FinanceStore>((set) => ({
  creditCards: [],
  expenses: [],
  selectedCard: null,

  setCreditCards: (cards) => set({ creditCards: cards }),
  addCreditCard: (card) =>
    set((state) => ({ creditCards: [...state.creditCards, card] })),
  removeCreditCard: (cardId) =>
    set((state) => ({
      creditCards: state.creditCards.filter((c) => c.id !== cardId),
    })),

  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) =>
    set((state) => ({ expenses: [...state.expenses, expense] })),
  removeExpense: (expenseId) =>
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== expenseId),
    })),

  selectCard: (card) => set({ selectedCard: card }),
}));
