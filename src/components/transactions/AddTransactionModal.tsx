import { useState } from 'react'
import { Repeat } from 'lucide-react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { TagInput } from '../shared/TagInput'
import { useCategoryStore } from '../../store/categoryStore'
import { useTransactionStore } from '../../store/transactionStore'
import { useUiStore } from '../../store/uiStore'
import { useToastStore } from '../../store/toastStore'
import type { CategoryId } from '../../types'

export function AddTransactionModal() {
  const { showAddModal, setShowAddModal } = useUiStore()
  const addTransaction = useTransactionStore((s) => s.addTransaction)
  const transactions = useTransactionStore((s) => s.transactions)
  const categories = useCategoryStore((s) => s.categories)
  const addToast = useToastStore((s) => s.addToast)

  // Collect all unique tags from existing transactions for suggestions
  const allTags = Array.from(new Set(transactions.flatMap((t) => t.tags || [])))

  const today = new Date().toISOString().slice(0, 10)
  const [date, setDate] = useState(today)
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [category, setCategory] = useState<CategoryId>('food_dining')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [error, setError] = useState('')
  const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'>('none')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')

  const reset = () => {
    setDate(today)
    setAmount('')
    setType('expense')
    setCategory('food_dining')
    setDescription('')
    setNotes('')
    setTags([])
    setError('')
    setRecurrence('none')
    setRecurrenceEndDate('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    if (!description.trim()) {
      setError('Please enter a description.')
      return
    }
    addTransaction({
      date, amount: amt, type, category, description: description.trim(), notes: notes || undefined,
      tags: tags.length > 0 ? tags : undefined,
      source: 'manual',
      recurrence: recurrence !== 'none' ? recurrence : undefined,
      recurrenceEndDate: recurrence !== 'none' && recurrenceEndDate ? recurrenceEndDate : undefined,
    })
    addToast('Transaction added')
    reset()
    setShowAddModal(false)
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'

  return (
    <Modal open={showAddModal} onClose={() => { reset(); setShowAddModal(false) }} title="Add Transaction">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
          {(['expense', 'income'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setType(t); if (t === 'income') setCategory('income') }}
              className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                type === t
                  ? t === 'expense'
                    ? 'bg-rose-500 text-white'
                    : 'bg-green-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Amount (CAD)</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputCls}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <input type="text" placeholder="e.g. Tim Hortons" value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} required />
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryId)}
            className={inputCls}
          >
            {categories
              .filter((c) => type === 'income' ? c.id === 'income' : c.id !== 'income')
              .map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
          </select>
        </div>

        <div>
          <label className={labelCls}>Notes <span className="text-slate-400 font-normal">(optional)</span></label>
          <textarea
            placeholder="Any extra details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label className={labelCls}>Tags <span className="text-slate-400 font-normal">(optional)</span></label>
          <TagInput tags={tags} onChange={setTags} suggestions={allTags} />
        </div>

        {/* Recurrence */}
        <div>
          <label className={labelCls}>
            <span className="flex items-center gap-1.5"><Repeat size={14} /> Repeat</span>
          </label>
          <select
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}
            className={inputCls}
          >
            <option value="none">Does not repeat</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {recurrence !== 'none' && (
            <div className="mt-2">
              <label className="text-xs text-slate-400">End date (optional)</label>
              <input
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                className={inputCls}
              />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => { reset(); setShowAddModal(false) }}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Add Transaction
          </Button>
        </div>
      </form>
    </Modal>
  )
}
