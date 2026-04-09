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
import { CATEGORIES } from '../../constants/categories'
import { formatCurrency } from '../../lib/dateUtils'
import type { YearlyData } from '../../types'

interface YearlyLineChartProps {
  data: YearlyData
}

export function YearlyLineChart({ data }: YearlyLineChartProps) {
  const chartData = data.byMonth.map((m) => ({
    month: m.label,
    ...Object.fromEntries(
      CATEGORIES.filter((c) => c.id !== 'income').map((c) => [c.id, m.byCategory[c.id] || 0])
    ),
  }))

  // Only show categories that have at least one non-zero month
  const activeCategories = CATEGORIES.filter(
    (c) => c.id !== 'income' && data.byCategory[c.id] > 0
  )

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            const cat = CATEGORIES.find((c) => c.id === name)
            return [formatCurrency(value), cat?.label || name]
          }}
          contentStyle={{
            backgroundColor: '#1e293b',
            border: 'none',
            borderRadius: '8px',
            color: '#f1f5f9',
            fontSize: '13px',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => {
            const cat = CATEGORIES.find((c) => c.id === value)
            return <span style={{ fontSize: 12, color: '#94a3b8' }}>{cat?.label || value}</span>
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
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
