import { useState } from 'react'
import { ShieldCheck, BarChart3, Share2 } from 'lucide-react'
import { Button } from './Button'
import { useUiStore } from '../../store/uiStore'
import { useTransactionStore } from '../../store/transactionStore'

const STEPS = [
  {
    icon: ShieldCheck,
    title: 'Welcome to Stash',
    description: 'Track every dollar. Import bank statements or add transactions manually.',
  },
  {
    icon: BarChart3,
    title: 'See where it goes',
    description: 'Charts and breakdowns show your spending patterns by category and month.',
  },
  {
    icon: Share2,
    title: 'Share with anyone',
    description: 'Generate a read-only link to share your spending summary.',
  },
]

export function OnboardingOverlay() {
  const transactions = useTransactionStore((s) => s.transactions)
  const hasSeenOnboarding = useUiStore((s) => s.hasSeenOnboarding)
  const setHasSeenOnboarding = useUiStore((s) => s.setHasSeenOnboarding)
  const [step, setStep] = useState(0)

  if (transactions.length > 0 || hasSeenOnboarding) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      setHasSeenOnboarding(true)
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
          <Icon size={32} className="text-emerald-600 dark:text-emerald-400" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {current.title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          {current.description}
        </p>

        <Button onClick={handleNext} className="w-full mb-4">
          {isLast ? 'Get Started' : 'Next'}
        </Button>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step
                  ? 'bg-emerald-500'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
