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
  positive: 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/40',
  negative: 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-900/30',
  neutral: 'bg-surface-muted dark:bg-surface-dark-raised border-slate-200/50 dark:border-slate-700/50',
}

const ICON_STYLES = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-amber-600 dark:text-amber-400',
  neutral: 'text-slate-500 dark:text-slate-400',
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
