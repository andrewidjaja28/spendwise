import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ChartTooltip } from '../shared/ChartTooltip'
import { useCategoryStore } from '../../store/categoryStore'
import { formatCurrency } from '../../lib/dateUtils'
import type { MonthlyData } from '../../types'

interface CategoryPieChartProps {
  data: MonthlyData
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const categories = useCategoryStore((s) => s.categories)

  const chartData = categories
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
          innerRadius={70}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          animationDuration={800}
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        {/* Center label */}
        <text
          x="50%"
          y="48%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-500 dark:fill-slate-400"
          style={{ fontSize: 11 }}
        >
          Total
        </text>
        <text
          x="50%"
          y="56%"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-slate-900 dark:fill-white"
          style={{ fontSize: 14, fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}
        >
          {formatCurrency(data.total)}
        </text>
        <Tooltip
          content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
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
