import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { ChartTooltip } from '../shared/ChartTooltip'
import { useCategoryStore } from '../../store/categoryStore'
import { formatCurrency } from '../../lib/dateUtils'
import { CHART_COLORS } from '../../lib/chartConfig'
import type { YearlyData } from '../../types'

interface YearlyLineChartProps {
  data: YearlyData
}

export function YearlyLineChart({ data }: YearlyLineChartProps) {
  const categories = useCategoryStore((s) => s.categories)

  const chartData = data.byMonth.map((m) => ({
    month: m.label,
    ...Object.fromEntries(
      categories.filter((c) => c.id !== 'income').map((c) => [c.id, m.byCategory[c.id] || 0])
    ),
  }))

  // Only show categories that have at least one non-zero month
  const activeCategories = categories.filter(
    (c) => c.id !== 'income' && data.byCategory[c.id] > 0
  )

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid horizontal vertical={false} strokeOpacity={0.1} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_COLORS.tickText }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: CHART_COLORS.tickText }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
        />
        <Tooltip
          content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => {
            const cat = categories.find((c) => c.id === value)
            return <span style={{ fontSize: 12, color: CHART_COLORS.tickText }}>{cat?.label || value}</span>
          }}
        />
        {activeCategories.map((c) => (
          <Line
            key={c.id}
            type="monotone"
            dataKey={c.id}
            stroke={c.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            animationDuration={800}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
