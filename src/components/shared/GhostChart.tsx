export function GhostChart({ type }: { type: 'bar' | 'line' | 'area' }) {
  return (
    <div className="w-full h-48 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 flex items-end justify-center gap-2 p-6 opacity-40">
      {type === 'bar' && (
        <>
          {[40, 65, 45, 80, 55, 70, 35, 60].map((h, i) => (
            <div key={i} className="w-8 bg-slate-200 dark:bg-slate-700 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </>
      )}
      {type === 'line' && (
        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
          <path
            d="M 0 70 Q 40 50, 75 60 T 150 40 T 225 55 T 300 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-200 dark:text-slate-700"
            strokeDasharray="4 4"
          />
        </svg>
      )}
      {type === 'area' && (
        <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
          <path
            d="M 0 70 Q 40 50, 75 60 T 150 40 T 225 55 T 300 30 L 300 100 L 0 100 Z"
            fill="currentColor"
            className="text-slate-100 dark:text-slate-800"
          />
          <path
            d="M 0 70 Q 40 50, 75 60 T 150 40 T 225 55 T 300 30"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-slate-200 dark:text-slate-700"
            strokeDasharray="4 4"
          />
        </svg>
      )}
    </div>
  )
}
