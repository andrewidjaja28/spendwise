import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, parseISO, addMonths, subMonths } from 'date-fns'

interface MonthSelectorProps {
  month: string  // "2026-03"
  onChange: (month: string) => void
}

export function MonthSelector({ month, onChange }: MonthSelectorProps) {
  const date = parseISO(`${month}-01`)

  const prev = () => onChange(format(subMonths(date, 1), 'yyyy-MM'))
  const next = () => onChange(format(addMonths(date, 1), 'yyyy-MM'))
  const isCurrentMonth = month === format(new Date(), 'yyyy-MM')

  return (
    <div className="flex items-center gap-3">
      <button onClick={prev} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
        <ChevronLeft size={20} />
      </button>
      <span className="text-lg font-semibold text-slate-900 dark:text-white min-w-[140px] text-center">
        {format(date, 'MMMM yyyy')}
      </span>
      <button onClick={next} disabled={isCurrentMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
