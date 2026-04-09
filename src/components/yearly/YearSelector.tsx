import { ChevronLeft, ChevronRight } from 'lucide-react'

interface YearSelectorProps {
  year: number
  availableYears: number[]
  onChange: (year: number) => void
}

export function YearSelector({ year, availableYears, onChange }: YearSelectorProps) {
  const sorted = [...availableYears].sort((a, b) => a - b)
  const idx = sorted.indexOf(year)

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(sorted[idx - 1])}
        disabled={idx <= 0}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-lg font-semibold text-slate-900 dark:text-white w-20 text-center">{year}</span>
      <button
        onClick={() => onChange(sorted[idx + 1])}
        disabled={idx >= sorted.length - 1}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
