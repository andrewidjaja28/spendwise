import { memo } from 'react'

interface ChartTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name?: string; color?: string }>
  label?: string
  formatter?: (value: number) => string
}

export const ChartTooltip = memo(function ChartTooltip({ active, payload, label, formatter }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  const format = formatter || ((v: number) => v.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' }))
  return (
    <div className="bg-slate-900 dark:bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 shadow-xl">
      {label && <p className="text-xs text-slate-400 mb-1 font-mono">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-mono font-medium text-white flex items-center gap-2">
          {entry.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />}
          {entry.name && <span className="text-slate-400 text-xs">{entry.name}:</span>}
          {format(entry.value)}
        </p>
      ))}
    </div>
  )
})
