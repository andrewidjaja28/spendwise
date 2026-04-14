import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CATEGORIES } from '../constants/categories'
import type { CategoryDefinition } from '../types'

interface CategoryStoreState {
  categories: CategoryDefinition[]
  addCategory: (cat: Omit<CategoryDefinition, 'id'> & { id?: string }) => void
  updateCategory: (id: string, patch: Partial<CategoryDefinition>) => void
  removeCategory: (id: string) => void
  resetToDefaults: () => void
}

export const useCategoryStore = create<CategoryStoreState>()(
  persist(
    (set) => ({
      categories: [...CATEGORIES],
      addCategory: (cat) => {
        const id = cat.id || cat.label.toLowerCase().replace(/[^a-z0-9]/g, '_')
        set((s) => ({
          categories: [...s.categories, { ...cat, id } as CategoryDefinition],
        }))
      },
      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),
      resetToDefaults: () => set({ categories: [...CATEGORIES] }),
    }),
    { name: 'stash-categories' }
  )
)
