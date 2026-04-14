import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BudgetState {
  budgets: Record<string, number> // categoryId -> monthly budget amount
  setBudget: (categoryId: string, amount: number) => void
  removeBudget: (categoryId: string) => void
  clearBudgets: () => void
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set) => ({
      budgets: {},
      setBudget: (categoryId, amount) =>
        set((s) => ({ budgets: { ...s.budgets, [categoryId]: amount } })),
      removeBudget: (categoryId) =>
        set((s) => {
          const { [categoryId]: _, ...rest } = s.budgets
          return { budgets: rest }
        }),
      clearBudgets: () => set({ budgets: {} }),
    }),
    { name: 'stash-budgets' }
  )
)
