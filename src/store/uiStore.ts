import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ViewId } from '../types'

interface UiStore {
  activeView: ViewId
  setActiveView: (v: ViewId) => void
  showAddModal: boolean
  setShowAddModal: (v: boolean) => void
  editingTransactionId: string | null
  setEditingTransactionId: (id: string | null) => void
  showSettingsModal: boolean
  setShowSettingsModal: (v: boolean) => void
  showShareModal: boolean
  setShowShareModal: (v: boolean) => void
  showBudgetModal: boolean
  setShowBudgetModal: (v: boolean) => void
  showCategoryManager: boolean
  setShowCategoryManager: (v: boolean) => void
  // Read-only mode (for shared links)
  isReadOnly: boolean
  setReadOnly: (v: boolean) => void
  // Dark mode
  isDark: boolean
  toggleDark: () => void
  // Onboarding
  hasSeenOnboarding: boolean
  setHasSeenOnboarding: (v: boolean) => void
}

function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem('spending-tracker-ui')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (typeof parsed?.state?.isDark === 'boolean') return parsed.state.isDark
    }
  } catch {}
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useUiStore = create<UiStore>()(
  persist(
    (set) => ({
      activeView: 'dashboard',
      setActiveView: (v) => set({ activeView: v }),
      showAddModal: false,
      setShowAddModal: (v) => set({ showAddModal: v }),
      editingTransactionId: null,
      setEditingTransactionId: (id) => set({ editingTransactionId: id }),
      showSettingsModal: false,
      setShowSettingsModal: (v) => set({ showSettingsModal: v }),
      showShareModal: false,
      setShowShareModal: (v) => set({ showShareModal: v }),
      showBudgetModal: false,
      setShowBudgetModal: (v) => set({ showBudgetModal: v }),
      showCategoryManager: false,
      setShowCategoryManager: (v) => set({ showCategoryManager: v }),
      isReadOnly: false,
      setReadOnly: (v) => set({ isReadOnly: v }),
      isDark: getInitialDark(),
      toggleDark: () =>
        set((state) => {
          const next = !state.isDark
          if (next) document.documentElement.classList.add('dark')
          else document.documentElement.classList.remove('dark')
          return { isDark: next }
        }),
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (v) => set({ hasSeenOnboarding: v }),
    }),
    {
      name: 'spending-tracker-ui',
      partialize: (state) => ({ isDark: state.isDark, hasSeenOnboarding: state.hasSeenOnboarding }),
    }
  )
)
