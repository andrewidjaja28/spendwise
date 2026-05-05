import { memo } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, Trophy, Zap } from 'lucide-react'
import type { Insight } from '../../lib/insights'

const ICONS = {
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'alert': AlertTriangle,
  'trophy': Trophy,
  'zap': Zap,
}

const TYPE_STYLES = {
  positive: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  negative: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
  neutral: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
}

const ICON_STYLES = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-rose-600 dark:text-rose-400',
  neutral: 'text-slate-600 dark:text-slate-400',
}

export const InsightsPanel = memo(function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {insights.map((insight) => {
        const Icon = ICONS[insight.icon]
        return (
          <div key={insight.id} className={`flex items-start gap-3 p-4 rounded-xl border ${TYPE_STYLES[insight.type]}`}>
            <Icon size={18} className={`shrink-0 mt-0.5 ${ICON_STYLES[insight.type]}`} />
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{insight.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{insight.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
})
