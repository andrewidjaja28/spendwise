import { useState } from 'react'
import Papa from 'papaparse'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { useTransactionStore } from '../../store/transactionStore'
import { useUiStore } from '../../store/uiStore'
import { useToastStore } from '../../store/toastStore'
import { useCategoryStore } from '../../store/categoryStore'
import { Download, Trash2, AlertTriangle, FileSpreadsheet, Target, Palette } from 'lucide-react'

export function SettingsModal() {
  const { showSettingsModal, setShowSettingsModal, setShowBudgetModal, setShowCategoryManager } = useUiStore()
  const categories = useCategoryStore((s) => s.categories)
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c]))
  const { transactions, clearAll } = useTransactionStore()
  const addToast = useToastStore((s) => s.addToast)
  const [confirmClear, setConfirmClear] = useState(false)

  const exportData = () => {
    const json = JSON.stringify(transactions, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stash-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Data exported')
  }

  const exportCsv = () => {
    const data = transactions.map((t) => ({
      Date: t.date,
      Description: t.description,
      Category: categoryMap[t.category]?.label || t.category,
      Type: t.type,
      Amount: t.amount,
      Notes: t.notes || '',
    }))
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stash-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    addToast('CSV exported')
  }

  const handleClear = () => {
    clearAll()
    setConfirmClear(false)
    setShowSettingsModal(false)
    addToast('All data cleared', 'info')
  }

  return (
    <Modal open={showSettingsModal} onClose={() => { setShowSettingsModal(false); setConfirmClear(false) }} title="Settings">
      <div className="space-y-6">
        {/* Data section */}
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Data</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Transactions stored</p>
                <p className="text-xs text-slate-400">{transactions.length} transactions in local storage</p>
              </div>
            </div>

            <button
              onClick={exportData}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Download size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Export Data</p>
                <p className="text-xs text-slate-400">Download all transactions as JSON</p>
              </div>
            </button>

            <button
              onClick={exportCsv}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <FileSpreadsheet size={16} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Export CSV</p>
                <p className="text-xs text-slate-400">Download all transactions as CSV</p>
              </div>
            </button>

            <button
              onClick={() => { setShowSettingsModal(false); setShowBudgetModal(true) }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                <Target size={16} className="text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Set Budgets</p>
                <p className="text-xs text-slate-400">Set monthly spending limits by category</p>
              </div>
            </button>

            <button
              onClick={() => { setShowSettingsModal(false); setShowCategoryManager(true) }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Palette size={16} className="text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Manage Categories</p>
                <p className="text-xs text-slate-400">Add, edit, or remove spending categories</p>
              </div>
            </button>

            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <Trash2 size={16} className="text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-rose-600 dark:text-rose-400">Clear All Data</p>
                  <p className="text-xs text-slate-400">Permanently delete all transactions</p>
                </div>
              </button>
            ) : (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-rose-600" />
                  <p className="text-sm font-medium text-rose-700 dark:text-rose-300">This will delete all {transactions.length} transactions. This cannot be undone.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setConfirmClear(false)}>Cancel</Button>
                  <Button variant="danger" size="sm" onClick={handleClear}>Yes, delete everything</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* About */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 text-center">
            Stash · All data stored locally in your browser · v0.1.0
          </p>
        </div>
      </div>
    </Modal>
  )
}
