import { useState, useEffect } from 'react'
import { Repeat } from 'lucide-react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { TagInput } from '../shared/TagInput'
import { useCategoryStore } from '../../store/categoryStore'
import { useTransactionStore } from '../../store/transactionStore'
import { useUiStore } from '../../store/uiStore'
import { useToastStore } from '../../store/toastStore'
import type { CategoryId } from '../../types'

export function EditTransactionModal() {
  const { editingTransactionId, setEditingTransactionId } = useUiStore()
  const { transactions, updateTransaction, deleteTransaction } = useTransactionStore()
  const categories = useCategoryStore((s) => s.categories)
  const addToast = useToastStore((s) => s.addToast)

  // Collect all unique tags from existing transactions for suggestions
  const allTags = Array.from(new Set(transactions.flatMap((t) => t.tags || [])))

  const tx = transactions.find((t) => t.id === editingTransactionId)
  const open = !!editingTransactionId && !!tx

  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [category, setCategory] = useState<CategoryId>('other')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'>('none')
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')

  useEffect(() => {
    if (tx) {
      setDate(tx.date)
      setAmount(String(tx.amount))
      setType(tx.type)
      setCategory(tx.category)
      setDescription(tx.description)
      setNotes(tx.notes || '')
      setTags(tx.tags || [])
      setConfirmDelete(false)
      setRecurrence(tx.recurrence || 'none')
      setRecurrenceEndDate(tx.recurrenceEndDate || '')
    }
  }, [tx])

  const close = () => setEditingTransactionId(null)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransactionId) return
    updateTransaction(editingTransactionId, {
      date, amount: parseFloat(amount), type, category, description, notes: notes || undefined,
      tags: tags.length > 0 ? tags : undefined,
      recurrence: recurrence !== 'none' ? recurrence : undefined,
      recurrenceEndDate: recurrence !== 'none' && recurrenceEndDate ? recurrenceEndDate : undefined,
    })
    addToast('Transaction updated')
    close()
  }

  const handleDelete = () => {
    if (!editingTransactionId) return
    deleteTransaction(editingTransactionId)
    addToast('Transaction deleted')
    close()
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'

  return (
    <Modal open={open} onClose={close} title="Edit Transaction">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
          {(['expense', 'income'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                type === t
                  ? t === 'expense' ? 'bg-rose-500 text-white' : 'bg-green-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Amount (CAD)</label>
            <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)} className={inputCls}>
            {categories
              .filter((c) => type === 'income' ? c.id === 'income' : c.id !== 'income')
              .map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
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

        {confirmDelete ? (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-4">
            <p className="text-sm text-rose-700 dark:text-rose-300 mb-3">Are you sure you want to delete this transaction?</p>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button type="button" variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>Delete</Button>
            <div className="flex-1" />
            <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        )}
      </form>
    </Modal>
  )
}
