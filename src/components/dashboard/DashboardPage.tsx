import { useMemo } from 'react'
import { format, subMonths } from 'date-fns'
import { Lightbulb } from 'lucide-react'
import { SummaryCards } from './SummaryCards'
import { SpendingAreaChart } from './SpendingAreaChart'
import { CategoryPieChart } from './CategoryPieChart'
import { InsightsPanel } from './InsightsPanel'
import { TransactionTable } from '../transactions/TransactionTable'
import { Button } from '../shared/Button'
import { useTransactionStore } from '../../store/transactionStore'
import { getMonthlyData, currentMonth } from '../../lib/dateUtils'
import { useUiStore } from '../../store/uiStore'
import { useToastStore } from '../../store/toastStore'
import { generateInsights } from '../../lib/insights'
import { generateSampleData } from '../../lib/sampleData'

export function DashboardPage() {
  const transactions = useTransactionStore((s) => s.transactions)
  const addTransactions = useTransactionStore((s) => s.addTransactions)
  const setShowAddModal = useUiStore((s) => s.setShowAddModal)
  const addToast = useToastStore((s) => s.addToast)

  const insights = useMemo(() => generateInsights(transactions), [transactions])

  if (transactions.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {/* Vault-themed illustration */}
          <div className="w-24 h-24 mb-6 relative">
            <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
              <rect x="12" y="20" width="72" height="60" rx="8" className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2"/>
              <rect x="20" y="28" width="56" height="44" rx="4" className="fill-white dark:fill-slate-900 stroke-slate-200 dark:stroke-slate-700" strokeWidth="1.5"/>
              <circle cx="48" cy="50" r="12" className="stroke-emerald-500" strokeWidth="2.5" fill="none"/>
              <circle cx="48" cy="50" r="4" className="fill-emerald-500"/>
              <line x1="48" y1="38" x2="48" y2="42" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round"/>
              <line x1="48" y1="58" x2="48" y2="62" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round"/>
              <line x1="36" y1="50" x2="40" y2="50" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round"/>
              <line x1="56" y1="50" x2="60" y2="50" className="stroke-emerald-500" strokeWidth="2" strokeLinecap="round"/>
              <rect x="78" y="38" width="8" height="24" rx="4" className="fill-slate-200 dark:fill-slate-700"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">Your vault is empty</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">
            Add your first transaction or import a bank statement to start tracking.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => setShowAddModal(true)}>Add Transaction</Button>
            <Button
              variant="secondary"
              onClick={() => {
                const data = generateSampleData()
                addTransactions(data)
                addToast('Sample data loaded — ' + data.length + '+ transactions added')
              }}
            >
              Try Sample Data
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const thisMonth = currentMonth()
  const lastMonth = format(subMonths(new Date(), 1), 'yyyy-MM')

  const currentData = getMonthlyData(transactions, thisMonth)
  const previousData = getMonthlyData(transactions, lastMonth)

  // Last 12 months for the area chart
  const last12 = Array.from({ length: 12 }, (_, i) =>
    format(subMonths(new Date(), 11 - i), 'yyyy-MM')
  )
  const monthlyHistory = last12.map((m) => getMonthlyData(transactions, m))

  // Recent transactions (last 10)
  const recent = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10)

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <SummaryCards current={currentData} previous={previousData} />

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            <Lightbulb size={14} />
            Insights
          </h2>
          <InsightsPanel insights={insights} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart — takes 2/3 */}
        <div className="lg:col-span-2 bg-surface-muted dark:bg-surface-dark-raised/60 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            12-Month Spending
          </h2>
          <SpendingAreaChart months={monthlyHistory} />
        </div>

        {/* Pie chart — takes 1/3 */}
        <div className="bg-surface dark:bg-surface-dark-raised rounded-2xl border border-slate-200/70 dark:border-slate-800/70 p-5">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            This Month
          </h2>
          <CategoryPieChart data={currentData} />
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
          Recent Transactions
        </h2>
        <TransactionTable transactions={recent} />
      </div>
    </div>
  )
}
