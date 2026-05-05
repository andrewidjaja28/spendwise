import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../../store/toastStore'

const iconMap = {
  success: { Icon: CheckCircle, color: 'text-green-500' },
  error: { Icon: AlertCircle, color: 'text-rose-500' },
  info: { Icon: Info, color: 'text-emerald-500' },
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-sm:right-1/2 max-sm:translate-x-1/2 max-sm:w-[90vw]"
    >
      {toasts.map((toast) => {
        const { Icon, color } = iconMap[toast.type]
        return (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : undefined}
            className="bg-surface dark:bg-surface-dark-raised border border-slate-200/70 dark:border-slate-700/70 rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 animate-slide-in"
          >
            <Icon size={18} className={color} />
            <span className="text-sm text-slate-800 dark:text-slate-100 flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-2.5 sm:p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
