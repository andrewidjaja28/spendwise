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
import { CHART_COLORS } from '../../lib/chartConfig'
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
            <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid horizontal vertical={false} strokeOpacity={0.1} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: CHART_COLORS.tickText }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: CHART_COLORS.tickText }}
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
          stroke={CHART_COLORS.accent}
          strokeWidth={2.5}
          fill="url(#areaGradient)"
          dot={false}
          activeDot={{ r: 5, fill: CHART_COLORS.accent }}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
