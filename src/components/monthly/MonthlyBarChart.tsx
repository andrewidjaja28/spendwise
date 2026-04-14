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
import { ChartTooltip } from '../shared/ChartTooltip'
import { useCategoryStore } from '../../store/categoryStore'
import { formatCurrency } from '../../lib/dateUtils'
import type { MonthlyData } from '../../types'

interface MonthlyBarChartProps {
  data: MonthlyData
  onCategoryClick?: (category: string | null) => void
  activeCategory?: string | null
}

export function MonthlyBarChart({ data, onCategoryClick, activeCategory }: MonthlyBarChartProps) {
  const categories = useCategoryStore((s) => s.categories)

  const chartData = categories
    .filter((c) => c.id !== 'income' && data.byCategory[c.id] > 0)
    .map((c) => ({ name: c.label, value: data.byCategory[c.id], id: c.id, color: c.color }))
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No expense data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
        <CartesianGrid horizontal vertical={false} strokeOpacity={0.1} />
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
          content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
        />
        <Bar dataKey="value" radius={[2, 2, 0, 0]} animationDuration={800} onClick={(d) => onCategoryClick?.(d.id === activeCategory ? null : d.id)}>
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
