import { useState } from 'react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { useCategoryStore } from '../../store/categoryStore'
import { useTransactionStore } from '../../store/transactionStore'
import { useUiStore } from '../../store/uiStore'
import { Pencil, Trash2, Plus, RotateCcw, Check, X } from 'lucide-react'

const COLOR_PALETTE = [
  { color: '#f97316', bg: 'bg-orange-500', text: 'text-orange-500' },
  { color: '#84cc16', bg: 'bg-lime-500', text: 'text-lime-500' },
  { color: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-500' },
  { color: '#8b5cf6', bg: 'bg-violet-500', text: 'text-violet-500' },
  { color: '#ec4899', bg: 'bg-pink-500', text: 'text-pink-500' },
  { color: '#14b8a6', bg: 'bg-teal-500', text: 'text-teal-500' },
  { color: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-500' },
  { color: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-500' },
  { color: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-500' },
  { color: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-500' },
  { color: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-500' },
  { color: '#94a3b8', bg: 'bg-slate-400', text: 'text-slate-400' },
]

export function CategoryManager() {
  const { showCategoryManager, setShowCategoryManager } = useUiStore()
  const { categories, addCategory, updateCategory, removeCategory, resetToDefaults } = useCategoryStore()
  const transactions = useTransactionStore((s) => s.transactions)

  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(COLOR_PALETTE[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const getCategoryUsage = (id: string) =>
    transactions.filter((t) => t.category === id).length

  const handleAdd = () => {
    if (!newName.trim()) return
    addCategory({
      label: newName.trim(),
      color: newColor.color,
      tailwindBg: newColor.bg,
      tailwindText: newColor.text,
      icon: 'Tag',
    })
    setNewName('')
    setNewColor(COLOR_PALETTE[0])
    setShowAdd(false)
  }

  const handleStartEdit = (id: string, label: string) => {
    setEditingId(id)
    setEditName(label)
  }

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      updateCategory(id, { label: editName.trim() })
    }
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    removeCategory(id)
    setConfirmDeleteId(null)
  }

  const handleReset = () => {
    resetToDefaults()
    setConfirmReset(false)
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500'

  return (
    <Modal open={showCategoryManager} onClose={() => setShowCategoryManager(false)} title="Manage Categories" maxWidth="max-w-md">
      <div className="space-y-4">
        {/* Category list */}
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {categories.map((cat) => {
            const usage = getCategoryUsage(cat.id)
            const isEditing = editingId === cat.id
            const isConfirmingDelete = confirmDeleteId === cat.id

            return (
              <div
                key={cat.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 group"
              >
                {/* Color dot */}
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />

                {/* Name */}
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(cat.id); if (e.key === 'Escape') setEditingId(null) }}
                      className={`${inputCls} py-1`}
                      autoFocus
                    />
                    <button onClick={() => handleSaveEdit(cat.id)} className="p-1 text-emerald-500 hover:text-emerald-600">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-slate-800 dark:text-slate-100">{cat.label}</span>
                    {usage > 0 && (
                      <span className="text-[10px] text-slate-400 tabular-nums">{usage} txn{usage !== 1 ? 's' : ''}</span>
                    )}

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1">
                        {usage > 0 ? (
                          <>
                            <span className="text-[10px] text-rose-500">Has {usage} txns</span>
                            <button onClick={() => setConfirmDeleteId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-[10px] text-rose-500">Delete?</span>
                            <button onClick={() => handleDelete(cat.id)} className="p-1 text-rose-500 hover:text-rose-600">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setConfirmDeleteId(null)} className="p-1 text-slate-400 hover:text-slate-600">
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(cat.id, cat.label)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(cat.id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Add category form */}
        {showAdd ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
                placeholder="e.g. Pets"
                className={inputCls}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Color</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setNewColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      newColor.color === c.color ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => { setShowAdd(false); setNewName('') }}>Cancel</Button>
              <Button size="sm" onClick={handleAdd} disabled={!newName.trim()}>Add</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-sm text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <Plus size={16} />
            Add Category
          </button>
        )}

        {/* Reset to defaults */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {confirmReset ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-500">Reset all categories to defaults?</span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setConfirmReset(false)}>Cancel</Button>
                <Button variant="danger" size="sm" onClick={handleReset}>Reset</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <RotateCcw size={12} />
              Reset to defaults
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
