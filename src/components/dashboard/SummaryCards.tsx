import { TrendingUp, TrendingDown, DollarSign, Tag } from 'lucide-react'
import { formatCurrency } from '../../lib/dateUtils'
import { CATEGORY_MAP } from '../../constants/categories'
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

  const cards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(current.total),
      sub: momChange !== null
        ? `${momChange >= 0 ? '+' : ''}${momChange.toFixed(1)}% vs last month`
        : 'This month',
      icon: DollarSign,
      trend: momChange !== null ? (momChange > 0 ? 'up' : 'down') : 'neutral',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
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
      value: income > 0 ? formatCurrency(income) : '—',
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
        <div key={card.title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{card.title}</p>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}
              style={card.iconBgStyle}
            >
              <card.icon size={16} className={card.iconColor} style={card.iconStyle} />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{card.value}</p>
          <p className={`text-xs mt-1 ${
            card.trend === 'up' ? 'text-red-500' : card.trend === 'down' ? 'text-green-500' : 'text-slate-400 dark:text-slate-500'
          }`}>
            {card.sub}
          </p>
        </div>
      ))}
    </div>
  )
}
