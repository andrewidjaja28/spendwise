import { useEffect } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { DashboardPage } from './components/dashboard/DashboardPage'
import { MonthlyPage } from './components/monthly/MonthlyPage'
import { YearlyPage } from './components/yearly/YearlyPage'
import { UploadPage } from './components/upload/UploadPage'
import { AddTransactionModal } from './components/transactions/AddTransactionModal'
import { EditTransactionModal } from './components/transactions/EditTransactionModal'
import { SettingsModal } from './components/settings/SettingsModal'
import { ShareModal } from './components/settings/ShareModal'
import { useUiStore } from './store/uiStore'
import { useTransactionStore } from './store/transactionStore'
import { getSharedDataFromUrl } from './lib/share'

function PageContent() {
  const activeView = useUiStore((s) => s.activeView)
  const isReadOnly = useUiStore((s) => s.isReadOnly)
  switch (activeView) {
    case 'dashboard': return <DashboardPage />
    case 'monthly':   return <MonthlyPage />
    case 'yearly':    return <YearlyPage />
    case 'upload':    return isReadOnly ? <DashboardPage /> : <UploadPage />
    default:          return <DashboardPage />
  }
}

export default function App() {
  const isDark = useUiStore((s) => s.isDark)
  const setReadOnly = useUiStore((s) => s.setReadOnly)
  const isReadOnly = useUiStore((s) => s.isReadOnly)
  const addTransactions = useTransactionStore((s) => s.addTransactions)
  const clearAll = useTransactionStore((s) => s.clearAll)

  // Apply dark mode class on mount and changes
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [isDark])

  // Detect shared data in URL on mount
  useEffect(() => {
    const shared = getSharedDataFromUrl()
    if (shared && shared.length > 0) {
      // Enter read-only mode with the shared data
      clearAll()
      addTransactions(shared)
      setReadOnly(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <TopBar />
        <main className="flex-1 overflow-auto">
          <PageContent />
        </main>
      </div>

      {!isReadOnly && (
        <>
          <AddTransactionModal />
          <EditTransactionModal />
          <SettingsModal />
          <ShareModal />
        </>
      )}
    </div>
  )
}
