import { useState, useEffect } from 'react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { CATEGORIES } from '../../constants/categories'
import { useTransactionStore } from '../../store/transactionStore'
import { useUiStore } from '../../store/uiStore'
import type { CategoryId } from '../../types'

export function EditTransactionModal() {
  const { editingTransactionId, setEditingTransactionId } = useUiStore()
  const { transactions, updateTransaction, deleteTransaction } = useTransactionStore()

  const tx = transactions.find((t) => t.id === editingTransactionId)
  const open = !!editingTransactionId && !!tx

  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [category, setCategory] = useState<CategoryId>('other')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (tx) {
      setDate(tx.date)
      setAmount(String(tx.amount))
      setType(tx.type)
      setCategory(tx.category)
      setDescription(tx.description)
      setNotes(tx.notes || '')
      setConfirmDelete(false)
    }
  }, [tx])

  const close = () => setEditingTransactionId(null)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransactionId) return
    updateTransaction(editingTransactionId, {
      date, amount: parseFloat(amount), type, category, description, notes: notes || undefined,
    })
    close()
  }

  const handleDelete = () => {
    if (!editingTransactionId) return
    deleteTransaction(editingTransactionId)
    close()
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'

  return (
    <Modal open={open} onClose={close} title="Edit Transaction">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
          {(['expense', 'income'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
                type === t
                  ? t === 'expense' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
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
            {CATEGORIES
              .filter((c) => type === 'income' ? c.id === 'income' : c.id !== 'income')
              .map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
        </div>

        {confirmDelete ? (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <p className="text-sm text-red-700 dark:text-red-300 mb-3">Are you sure you want to delete this transaction?</p>
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
