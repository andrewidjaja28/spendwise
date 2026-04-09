import { useState } from 'react'
import { Pencil, ChevronUp, ChevronDown, Trash2, CheckSquare } from 'lucide-react'
import { CategoryBadge } from './CategoryBadge'
import { useUiStore } from '../../store/uiStore'
import { useTransactionStore } from '../../store/transactionStore'
import { formatCurrency } from '../../lib/dateUtils'
import type { Transaction } from '../../types'

type SortKey = 'date' | 'amount' | 'description' | 'category'
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 25

interface TransactionTableProps {
  transactions: Transaction[]
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const setEditingId = useUiStore((s) => s.setEditingTransactionId)
  const isReadOnly = useUiStore((s) => s.isReadOnly)
  const deleteTransaction = useTransactionStore((s) => s.deleteTransaction)
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false)
  const [selectMode, setSelectMode] = useState(false)

  const sorted = [...transactions].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'date') cmp = a.date.localeCompare(b.date)
    else if (sortKey === 'amount') cmp = a.amount - b.amount
    else if (sortKey === 'description') cmp = a.description.localeCompare(b.description)
    else if (sortKey === 'category') cmp = a.category.localeCompare(b.category)
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const pagedIds = paged.map((t) => t.id)
  const allPageSelected = pagedIds.length > 0 && pagedIds.every((id) => selected.has(id))
  const somePageSelected = pagedIds.some((id) => selected.has(id))

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('desc') }
    setPage(0)
  }

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setConfirmBulkDelete(false)
  }

  const togglePage = () => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allPageSelected) pagedIds.forEach((id) => next.delete(id))
      else pagedIds.forEach((id) => next.add(id))
      return next
    })
    setConfirmBulkDelete(false)
  }

  const clearSelection = () => { setSelected(new Set()); setConfirmBulkDelete(false) }

  const exitSelectMode = () => { clearSelection(); setSelectMode(false) }

  const handleBulkDelete = () => {
    selected.forEach((id) => deleteTransaction(id))
    clearSelection()
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
    ) : null

  const thCls = 'px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200'

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 dark:text-slate-600 text-sm">
        No transactions for this period.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Toolbar row */}
      <div className="flex items-center justify-between">
        {/* Left: bulk actions (only in select mode) */}
        <div className="flex items-center gap-3">
          {selectMode && selected.size > 0 && (
            <>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {selected.size} selected
              </span>
              <button onClick={clearSelection} className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                Clear
              </button>
              {confirmBulkDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600 dark:text-red-400">Delete {selected.size}?</span>
                  <button onClick={() => setConfirmBulkDelete(false)} className="text-sm text-slate-500 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                    Cancel
                  </button>
                  <button onClick={handleBulkDelete} className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg font-medium transition-colors">
                    Delete
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmBulkDelete(true)}
                  className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </>
          )}
        </div>

        {/* Right: Select / Done button */}
        {!isReadOnly && (
          <button
            onClick={() => selectMode ? exitSelectMode() : setSelectMode(true)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              selectMode
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckSquare size={14} />
            {selectMode ? 'Done' : 'Select'}
          </button>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              {selectMode && (
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected }}
                    onChange={togglePage}
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}
              <th className={thCls} onClick={() => handleSort('date')}>
                <span className="flex items-center gap-1">Date <SortIcon k="date" /></span>
              </th>
              <th className={thCls} onClick={() => handleSort('description')}>
                <span className="flex items-center gap-1">Description <SortIcon k="description" /></span>
              </th>
              <th className={thCls} onClick={() => handleSort('category')}>
                <span className="flex items-center gap-1">Category <SortIcon k="category" /></span>
              </th>
              <th className={`${thCls} text-right`} onClick={() => handleSort('amount')}>
                <span className="flex items-center justify-end gap-1">Amount <SortIcon k="amount" /></span>
              </th>
              {!isReadOnly && <th className="px-4 py-3 w-10" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paged.map((tx) => {
              const isSelected = selected.has(tx.id)
              return (
                <tr
                  key={tx.id}
                  onClick={() => selectMode && toggleRow(tx.id)}
                  className={`transition-colors ${selectMode ? 'cursor-pointer' : ''} ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/10'
                      : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {selectMode && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleRow(tx.id)}
                        className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(tx.date + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-100 max-w-xs truncate">
                    {tx.description}
                    {tx.notes && <span className="ml-2 text-xs text-slate-400">{tx.notes}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <CategoryBadge category={tx.category} />
                  </td>
                  <td className={`px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap ${
                    tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-100'
                  }`}>
                    {tx.type === 'income' ? '+' : ''}{formatCurrency(tx.amount)}
                  </td>
                  {!isReadOnly && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingId(tx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {selectMode && (
          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              checked={allPageSelected}
              ref={(el) => { if (el) el.indeterminate = somePageSelected && !allPageSelected }}
              onChange={togglePage}
              className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs text-slate-500 dark:text-slate-400">Select all</span>
          </div>
        )}
        {paged.map((tx) => {
          const isSelected = selected.has(tx.id)
          return (
            <div
              key={tx.id}
              onClick={() => selectMode && toggleRow(tx.id)}
              className={`rounded-xl border px-4 py-3 transition-colors ${selectMode ? 'cursor-pointer' : ''} ${
                isSelected
                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  {selectMode && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(tx.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer mt-0.5 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {new Date(tx.date + 'T12:00:00').toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className={`text-sm font-semibold tabular-nums ${
                      tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {tx.type === 'income' ? '+' : ''}{formatCurrency(tx.amount)}
                    </p>
                    <div className="mt-0.5"><CategoryBadge category={tx.category} /></div>
                  </div>
                  {!isReadOnly && !selectMode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingId(tx.id) }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
