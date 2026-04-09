import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Transaction } from '../types'

interface TransactionStore {
  transactions: Transaction[]
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void
  addTransactions: (ts: Omit<Transaction, 'id' | 'createdAt'>[]) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  clearAll: () => void
}

export const useTransactionStore = create<TransactionStore>()(
  persist(
    (set) => ({
      transactions: [],

      addTransaction: (t) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            { ...t, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
          ],
        })),

      addTransactions: (ts) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            ...ts.map((t) => ({
              ...t,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            })),
          ],
        })),

      updateTransaction: (id, patch) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      clearAll: () => set({ transactions: [] }),
    }),
    { name: 'spending-tracker-transactions' }
  )
)
