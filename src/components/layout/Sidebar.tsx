import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Upload,
  Settings,
  Moon,
  Sun,
  Share2,
  type LucideIcon,
} from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import type { ViewId } from '../../types'

const NAV_ITEMS: { id: ViewId; label: string; icon: LucideIcon; hideReadOnly?: boolean }[] = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'monthly',   label: 'Monthly',    icon: Calendar },
  { id: 'yearly',    label: 'Yearly',     icon: CalendarDays },
  { id: 'upload',    label: 'Upload',     icon: Upload, hideReadOnly: true },
]

export function Sidebar() {
  const { activeView, setActiveView, showSettingsModal, setShowSettingsModal, setShowShareModal, isDark, toggleDark, isReadOnly } = useUiStore()

  const visibleNavItems = NAV_ITEMS.filter((item) => !(isReadOnly && item.hideReadOnly))

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-200 dark:border-slate-800">
          <span className="font-mono font-bold text-xl tracking-widest text-slate-900 dark:text-white">STASH</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleNavItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeView === id
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          {!isReadOnly && (
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              <Share2 size={18} />
              Share
            </button>
          )}
          <button
            onClick={toggleDark}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {isDark ? 'Light mode' : 'Dark mode'}
          </button>
          {!isReadOnly && (
            <button
              onClick={() => setShowSettingsModal(!showSettingsModal)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings size={18} />
              Settings
            </button>
          )}
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex">
        {visibleNavItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={`relative flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              activeView === id
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {activeView === id && <span className="absolute -top-0.5 w-4 h-1 rounded-full bg-emerald-500" />}
            <Icon size={20} />
            {label}
          </button>
        ))}
        {!isReadOnly && (
          <button
            onClick={() => setShowShareModal(true)}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium text-slate-500 dark:text-slate-400"
          >
            <Share2 size={20} />
            Share
          </button>
        )}
      </nav>
    </>
  )
}
