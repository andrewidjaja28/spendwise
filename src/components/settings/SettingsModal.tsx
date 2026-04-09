import { useState } from 'react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { useTransactionStore } from '../../store/transactionStore'
import { useUiStore } from '../../store/uiStore'
import { Download, Trash2, AlertTriangle } from 'lucide-react'

export function SettingsModal() {
  const { showSettingsModal, setShowSettingsModal } = useUiStore()
  const { transactions, clearAll } = useTransactionStore()
  const [confirmClear, setConfirmClear] = useState(false)

  const exportData = () => {
    const json = JSON.stringify(transactions, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `spending-tracker-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    clearAll()
    setConfirmClear(false)
    setShowSettingsModal(false)
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
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Download size={16} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Export Data</p>
                <p className="text-xs text-slate-400">Download all transactions as JSON</p>
              </div>
            </button>

            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Clear All Data</p>
                  <p className="text-xs text-slate-400">Permanently delete all transactions</p>
                </div>
              </button>
            ) : (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-red-600" />
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">This will delete all {transactions.length} transactions. This cannot be undone.</p>
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
            Spendwise · All data stored locally in your browser · v0.1.0
          </p>
        </div>
      </div>
    </Modal>
  )
}
