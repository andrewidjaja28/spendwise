import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChartTooltip } from '../shared/ChartTooltip'
import { formatCurrency } from '../../lib/dateUtils'
import type { MonthlyData } from '../../types'

interface SpendingAreaChartProps {
  months: MonthlyData[]
}

export function SpendingAreaChart({ months }: SpendingAreaChartProps) {
  const data = months.map((m) => ({ label: m.label, total: m.total }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid horizontal vertical={false} strokeOpacity={0.1} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
        />
        <Tooltip
          content={<ChartTooltip formatter={(v) => formatCurrency(v)} />}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#34d399"
          strokeWidth={2.5}
          fill="url(#areaGradient)"
          dot={false}
          activeDot={{ r: 5, fill: '#34d399' }}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
