import { TrendingUp, TrendingDown, DollarSign, Tag } from 'lucide-react'
import { formatCurrency } from '../../lib/dateUtils'
import { CATEGORY_MAP } from '../../constants/categories'
import { useBudgetStore } from '../../store/budgetStore'
import { useCountUp } from '../../hooks/useCountUp'
import type { MonthlyData } from '../../types'
import type { CategoryId } from '../../types'

interface SummaryCardsProps {
  current: MonthlyData
  previous: MonthlyData | null
}

export function SummaryCards({ current, previous }: SummaryCardsProps) {
  const daysInMonth = new Date(
    parseInt(current.month.slice(0, 4)),
    parseInt(current.month.slice(5, 7)),
    0
  ).getDate()
  const dailyAvg = current.total / daysInMonth

  // Top expense category
  const topCatId = Object.entries(current.byCategory)
    .filter(([id]) => id !== 'income')
    .sort(([, a], [, b]) => b - a)[0]?.[0] as CategoryId | undefined
  const topCat = topCatId ? CATEGORY_MAP[topCatId] : null
  const topCatAmount = topCatId ? current.byCategory[topCatId] : 0

  // MoM change
  const momChange = previous && previous.total > 0
    ? ((current.total - previous.total) / previous.total) * 100
    : null

  const income = current.transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)

  const budgets = useBudgetStore((s) => s.budgets)
  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0)
  const budgetPct = totalBudget > 0 ? Math.round((current.total / totalBudget) * 100) : null

  const animatedTotal = useCountUp(current.total)
  const animatedIncome = useCountUp(income)

  const cards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(animatedTotal),
      sub: momChange !== null
        ? `${momChange >= 0 ? '+' : ''}${momChange.toFixed(1)}% vs last month`
        : 'This month',
      icon: DollarSign,
      trend: momChange !== null ? (momChange > 0 ? 'up' : 'down') : 'neutral',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Daily Average',
      value: formatCurrency(dailyAvg),
      sub: `Over ${daysInMonth} days`,
      icon: TrendingDown,
      trend: 'neutral' as const,
      iconBg: 'bg-violet-100 dark:bg-violet-900/30',
      iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      title: 'Top Category',
      value: topCat?.label || '—',
      sub: topCat ? formatCurrency(topCatAmount) : 'No expenses yet',
      icon: Tag,
      trend: 'neutral' as const,
      iconBg: topCat ? `bg-opacity-10` : 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-400',
      iconBgStyle: topCat ? { backgroundColor: `${topCat.color}22` } : undefined,
      iconStyle: topCat ? { color: topCat.color } : undefined,
    },
    {
      title: 'Income',
      value: income > 0 ? formatCurrency(animatedIncome) : '—',
      sub: income > 0 ? `Net: ${formatCurrency(income - current.total)}` : 'None recorded',
      icon: TrendingUp,
      trend: 'neutral' as const,
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{card.title}</p>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}
              style={card.iconBgStyle}
            >
              <card.icon size={16} className={card.iconColor} style={card.iconStyle} />
            </div>
          </div>
          <p className={`${card.title === 'Total Expenses' || card.title === 'Income' ? 'text-2xl md:text-3xl' : 'text-xl'} font-mono font-bold text-slate-900 dark:text-white leading-tight`}>{card.value}</p>
          <p className={`text-xs font-mono mt-1 ${
            card.trend === 'up' ? 'text-rose-500' : card.trend === 'down' ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'
          }`}>
            {card.sub}
          </p>
          {card.title === 'Total Expenses' && budgetPct !== null && (
            <div className="mt-2">
              <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetPct > 100 ? 'bg-rose-500' : budgetPct >= 75 ? 'bg-amber-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(budgetPct, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{budgetPct}% of budget</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
