import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CATEGORIES } from '../../constants/categories'
import { formatCurrency } from '../../lib/dateUtils'
import type { MonthlyData } from '../../types'

interface CategoryPieChartProps {
  data: MonthlyData
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = CATEGORIES
    .filter((c) => c.id !== 'income' && data.byCategory[c.id] > 0)
    .map((c) => ({ name: c.label, value: data.byCategory[c.id], color: c.color }))
    .sort((a, b) => b.value - a.value)

  if (chartData.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), 'Spent']}
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
          formatter={(value) => <span style={{ fontSize: 12, color: '#94a3b8' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
