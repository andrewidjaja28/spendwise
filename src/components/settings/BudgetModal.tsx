import { Modal } from '../shared/Modal'
import { useUiStore } from '../../store/uiStore'
import { useBudgetStore } from '../../store/budgetStore'
import { useCategoryStore } from '../../store/categoryStore'
import { CategoryBadge } from '../transactions/CategoryBadge'
import type { CategoryId } from '../../types'

export function BudgetModal() {
  const { showBudgetModal, setShowBudgetModal } = useUiStore()
  const { budgets, setBudget, removeBudget, clearBudgets } = useBudgetStore()
  const categories = useCategoryStore((s) => s.categories)
  const expenseCategories = categories.filter((c) => c.id !== 'income')

  const handleChange = (categoryId: CategoryId, value: string) => {
    const num = parseFloat(value)
    if (value === '' || isNaN(num)) {
      removeBudget(categoryId)
    } else {
      setBudget(categoryId, num)
    }
  }

  return (
    <Modal open={showBudgetModal} onClose={() => setShowBudgetModal(false)} title="Monthly Budgets">
      <div className="space-y-4">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {expenseCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between gap-4 py-2">
              <CategoryBadge category={cat.id} />
              <input
                type="number"
                min="0"
                step={10}
                placeholder="No limit"
                value={budgets[cat.id] ?? ''}
                onChange={(e) => handleChange(cat.id as CategoryId, e.target.value)}
                className="w-32 px-3 py-1.5 text-sm text-right rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          ))}
        </div>

        {Object.keys(budgets).length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={clearBudgets}
              className="text-sm text-rose-500 hover:text-rose-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
