import { useState, useEffect } from 'react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { useCategoryStore } from '../../store/categoryStore'
import { useTransactionStore } from '../../store/transactionStore'
import { useToastStore } from '../../store/toastStore'
import type { Transaction, CategoryId } from '../../types'

type DraftRow = Omit<Transaction, 'id' | 'createdAt'> & { selected: boolean; isDuplicate: boolean }

interface ImportReviewModalProps {
  open: boolean
  onClose: () => void
  drafts: Omit<Transaction, 'id' | 'createdAt'>[]
  onImported: () => void
}

export function ImportReviewModal({ open, onClose, drafts, onImported }: ImportReviewModalProps) {
  const addTransactions = useTransactionStore((s) => s.addTransactions)
  const existingTransactions = useTransactionStore((s) => s.transactions)
  const categories = useCategoryStore((s) => s.categories)
  const addToast = useToastStore((s) => s.addToast)
  const [rows, setRows] = useState<DraftRow[]>([])

  // Sync rows whenever drafts prop changes, with duplicate detection
  useEffect(() => {
    setRows(drafts.map((d) => {
      const isDuplicate = existingTransactions.some(
        (t) => t.date === d.date && t.amount === d.amount && t.description.trim().toLowerCase() === d.description.trim().toLowerCase()
      )
      return { ...d, selected: !isDuplicate, isDuplicate }
    }))
  }, [drafts, existingTransactions])

  const update = (i: number, patch: Partial<DraftRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))

  const toggleAll = (v: boolean) =>
    setRows((prev) => prev.map((r) => ({ ...r, selected: v })))

  const selected = rows.filter((r) => r.selected)

  const duplicateCount = rows.filter((r) => r.isDuplicate).length

  const handleImport = () => {
    const toImport = rows.filter((r) => r.selected).map(({ selected: _, isDuplicate: _d, ...rest }) => rest)
    addTransactions(toImport)
    addToast(`${toImport.length} transactions imported`)
    onImported()
    onClose()
  }

  const inputCls = 'w-full px-2 py-1 text-sm rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500'

  return (
    <Modal open={open} onClose={onClose} title={`Review Import (${rows.length} rows)`} maxWidth="max-w-4xl">
      <div className="space-y-4">
        {duplicateCount > 0 && (
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
            {duplicateCount} possible duplicate{duplicateCount !== 1 ? 's' : ''} found
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            {selected.length} of {rows.length} selected
          </span>
          <div className="flex gap-3">
            <button onClick={() => toggleAll(true)} className="text-emerald-500 hover:text-emerald-600">Select all</button>
            <button onClick={() => toggleAll(false)} className="text-slate-400 hover:text-slate-600">None</button>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block max-h-96 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-2 w-8" />
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((row, i) => (
                <tr key={i} className={`${row.selected ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50 opacity-50'}`}>
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" checked={row.selected} onChange={(e) => update(i, { selected: e.target.checked })} className="rounded" />
                  </td>
                  <td className="px-3 py-2">
                    <input type="date" value={row.date} onChange={(e) => update(i, { date: e.target.value })} className={inputCls} style={{ minWidth: 120 }} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input type="text" value={row.description} onChange={(e) => update(i, { description: e.target.value })} className={inputCls} style={{ minWidth: 160 }} />
                      {row.isDuplicate && (
                        <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 whitespace-nowrap">
                          Possible duplicate
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <select value={row.category} onChange={(e) => update(i, { category: e.target.value as CategoryId })} className={inputCls}>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select value={row.type} onChange={(e) => update(i, { type: e.target.value as 'expense' | 'income' })} className={inputCls}>
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.amount}
                      onChange={(e) => update(i, { amount: parseFloat(e.target.value) || 0 })}
                      className={`${inputCls} text-right font-mono`}
                      style={{ minWidth: 80 }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card layout */}
        <div className="md:hidden max-h-80 overflow-y-auto space-y-2">
          {rows.map((row, i) => (
            <div
              key={i}
              className={`rounded-xl border p-3 space-y-2 ${
                row.selected
                  ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
                  : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={row.selected} onChange={(e) => update(i, { selected: e.target.checked })} className="rounded shrink-0" />
                <input type="text" value={row.description} onChange={(e) => update(i, { description: e.target.value })} className={`${inputCls} font-medium`} />
                {row.isDuplicate && (
                  <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 whitespace-nowrap">
                    Duplicate
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-semibold">Date</label>
                  <input type="date" value={row.date} onChange={(e) => update(i, { date: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-semibold">Amount</label>
                  <input type="number" min="0" step="0.01" value={row.amount} onChange={(e) => update(i, { amount: parseFloat(e.target.value) || 0 })} className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-semibold">Category</label>
                  <select value={row.category} onChange={(e) => update(i, { category: e.target.value as CategoryId })} className={inputCls}>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-slate-400 font-semibold">Type</label>
                  <select value={row.type} onChange={(e) => update(i, { type: e.target.value as 'expense' | 'income' })} className={inputCls}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleImport} disabled={selected.length === 0}>
            Import {selected.length} Transaction{selected.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
