import { useState } from 'react'
import { YearSelector } from './YearSelector'
import { YearlyLineChart } from './YearlyLineChart'
import { useTransactionStore } from '../../store/transactionStore'
import { getYearlyData, getAvailableYears, formatCurrency } from '../../lib/dateUtils'
import { useCategoryStore } from '../../store/categoryStore'
import { EmptyState } from '../shared/EmptyState'
import { GhostChart } from '../shared/GhostChart'
import { useUiStore } from '../../store/uiStore'
import { CategoryBadge } from '../transactions/CategoryBadge'

export function YearlyPage() {
  const transactions = useTransactionStore((s) => s.transactions)
  const categories = useCategoryStore((s) => s.categories)
  const setShowAddModal = useUiStore((s) => s.setShowAddModal)
  const availableYears = getAvailableYears(transactions)
  const [year, setYear] = useState(availableYears[0])

  if (transactions.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
          <GhostChart type="line" />
          <EmptyState
            title="No transactions yet"
            description="Add transactions to see your yearly breakdown."
            actionLabel="Add Transaction"
            onAction={() => setShowAddModal(true)}
          />
        </div>
      </div>
    )
  }

  const data = getYearlyData(transactions, year)

  const categoryRows = categories
    .filter((c) => c.id !== 'income' && data.byCategory[c.id] > 0)
    .map((c) => ({ cat: c, total: data.byCategory[c.id], pct: data.total > 0 ? (data.byCategory[c.id] / data.total) * 100 : 0 }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 -mx-6 px-6 py-3">
        <YearSelector year={year} availableYears={availableYears} onChange={setYear} />
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Expenses</p>
          <p className="text-2xl font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(data.total)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
          Monthly Breakdown by Category
        </h2>
        <YearlyLineChart data={data} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
          Category Totals
        </h2>
        <div className="space-y-3">
          {categoryRows.map(({ cat, total, pct }) => (
            <div key={cat.id} className="flex items-center gap-4">
              <div className="w-28 shrink-0">
                <CategoryBadge category={cat.id} />
              </div>
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: cat.color }}
                />
              </div>
              <span className="text-sm font-mono font-medium text-slate-700 dark:text-slate-300 w-28 text-right tabular-nums">
                {formatCurrency(total)}
              </span>
              <span className="text-xs text-slate-400 w-10 text-right tabular-nums">
                {pct.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
