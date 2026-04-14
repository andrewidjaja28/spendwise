import { PlusCircle } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  illustration?: React.ReactNode
  secondaryLabel?: string
  onSecondaryAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction, illustration, secondaryLabel, onSecondaryAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {illustration ? (
        <div className="mb-6">{illustration}</div>
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
          <PlusCircle className="text-slate-400" size={36} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">{description}</p>
      <div className="flex gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
        {secondaryLabel && onSecondaryAction && (
          <Button variant="secondary" onClick={onSecondaryAction}>{secondaryLabel}</Button>
        )}
      </div>
    </div>
  )
}
