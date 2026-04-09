import { Plus, Eye } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { Button } from '../shared/Button'
import type { ViewId } from '../../types'

const VIEW_TITLES: Record<ViewId, string> = {
  dashboard: 'Dashboard',
  monthly:   'Monthly View',
  yearly:    'Yearly View',
  upload:    'Import Transactions',
  settings:  'Settings',
}

export function TopBar() {
  const { activeView, setShowAddModal, isReadOnly } = useUiStore()

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          {VIEW_TITLES[activeView]}
        </h1>
        {isReadOnly && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
            <Eye size={12} />
            View only
          </span>
        )}
      </div>
      {!isReadOnly && (
        <Button onClick={() => setShowAddModal(true)}>
          <Plus size={16} />
          <span className="hidden sm:inline">Add Transaction</span>
        </Button>
      )}
    </header>
  )
}
