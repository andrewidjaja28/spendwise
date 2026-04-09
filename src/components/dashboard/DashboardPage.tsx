import { format, subMonths } from 'date-fns'
import { SummaryCards } from './SummaryCards'
import { SpendingAreaChart } from './SpendingAreaChart'
import { CategoryPieChart } from './CategoryPieChart'
import { TransactionTable } from '../transactions/TransactionTable'
import { EmptyState } from '../shared/EmptyState'
import { useTransactionStore } from '../../store/transactionStore'
import { getMonthlyData, groupByMonth, currentMonth } from '../../lib/dateUtils'
import { useUiStore } from '../../store/uiStore'

export function DashboardPage() {
  const transactions = useTransactionStore((s) => s.transactions)
  const setShowAddModal = useUiStore((s) => s.setShowAddModal)

  if (transactions.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="No transactions yet"
          description="Start by adding a transaction manually or import a bank statement."
          actionLabel="Add Transaction"
          onAction={() => setShowAddModal(true)}
        />
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
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <SummaryCards current={currentData} previous={previousData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area chart — takes 2/3 */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            12-Month Spending
          </h2>
          <SpendingAreaChart months={monthlyHistory} />
        </div>

        {/* Pie chart — takes 1/3 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
            This Month
          </h2>
          <CategoryPieChart data={currentData} />
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
          Recent Transactions
        </h2>
        <TransactionTable transactions={recent} />
      </div>
    </div>
  )
}
