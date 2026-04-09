import { useState } from 'react'
import { MonthSelector } from './MonthSelector'
import { MonthlyBarChart } from './MonthlyBarChart'
import { TransactionTable } from '../transactions/TransactionTable'
import { useTransactionStore } from '../../store/transactionStore'
import { getMonthlyData, formatCurrency, currentMonth } from '../../lib/dateUtils'
import { useUiStore } from '../../store/uiStore'
import { Button } from '../shared/Button'
import { Plus } from 'lucide-react'
import type { CategoryId } from '../../types'

export function MonthlyPage() {
  const [month, setMonth] = useState(currentMonth)
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null)
  const transactions = useTransactionStore((s) => s.transactions)
  const setShowAddModal = useUiStore((s) => s.setShowAddModal)

  const data = getMonthlyData(transactions, month)
  const filtered = activeCategory
    ? data.transactions.filter((t) => t.category === activeCategory)
    : data.transactions

  const income = data.transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <MonthSelector month={month} onChange={(m) => { setMonth(m); setActiveCategory(null) }} />
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Expenses</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(data.total)}</p>
          </div>
          {income > 0 && (
            <div className="text-right">
              <p className="text-xs text-slate-500 dark:text-slate-400">Income</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(income)}</p>
            </div>
          )}
        </div>
      </div>

      {data.transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-4">No transactions in {data.label}.</p>
          <Button onClick={() => setShowAddModal(true)}><Plus size={16} /> Add Transaction</Button>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
              Spending by Category
              {activeCategory && (
                <button onClick={() => setActiveCategory(null)} className="ml-3 text-blue-500 normal-case font-normal">Clear filter</button>
              )}
            </h2>
            <MonthlyBarChart data={data} activeCategory={activeCategory} onCategoryClick={(c) => setActiveCategory(c as CategoryId | null)} />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
              Transactions
              {activeCategory && <span className="ml-2 text-blue-500 font-normal normal-case">({filtered.length})</span>}
            </h2>
            <TransactionTable transactions={filtered} />
          </div>
        </>
      )}
    </div>
  )
}
