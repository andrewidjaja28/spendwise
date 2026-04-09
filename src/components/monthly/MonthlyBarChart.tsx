import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { CATEGORIES } from '../../constants/categories'
import { formatCurrency } from '../../lib/dateUtils'
import type { MonthlyData } from '../../types'

interface MonthlyBarChartProps {
  data: MonthlyData
  onCategoryClick?: (category: string | null) => void
  activeCategory?: string | null
}

export function MonthlyBarChart({ data, onCategoryClick, activeCategory }: MonthlyBarChartProps) {
  const chartData = CATEGORIES
    .filter((c) => c.id !== 'income' && data.byCategory[c.id] > 0)
    .map((c) => ({ name: c.label, value: data.byCategory[c.id], id: c.id, color: c.color }))
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No expense data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#94a3b8' }}
          tickFormatter={(v) => `$${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? 'k' : ''}`}
        />
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Spent']}
          contentStyle={{
            backgroundColor: 'var(--tooltip-bg, #1e293b)',
            border: 'none',
            borderRadius: '8px',
            color: '#f1f5f9',
            fontSize: '13px',
          }}
        />
        <Bar dataKey="value" radius={[6, 6, 0, 0]} onClick={(d) => onCategoryClick?.(d.id === activeCategory ? null : d.id)}>
          {chartData.map((entry) => (
            <Cell
              key={entry.id}
              fill={entry.color}
              opacity={activeCategory && activeCategory !== entry.id ? 0.3 : 1}
              cursor="pointer"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
