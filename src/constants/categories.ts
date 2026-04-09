import type { Category, CategoryId } from '../types'

export const CATEGORIES: Category[] = [
  { id: 'food_dining',    label: 'Food & Dining',   color: '#f97316', tailwindBg: 'bg-orange-500',    tailwindText: 'text-orange-500',    icon: 'UtensilsCrossed' },
  { id: 'groceries',      label: 'Groceries',        color: '#84cc16', tailwindBg: 'bg-lime-500',      tailwindText: 'text-lime-500',      icon: 'ShoppingBasket' },
  { id: 'transport',      label: 'Transport',        color: '#3b82f6', tailwindBg: 'bg-blue-500',      tailwindText: 'text-blue-500',      icon: 'Car' },
  { id: 'housing',        label: 'Housing',          color: '#8b5cf6', tailwindBg: 'bg-violet-500',    tailwindText: 'text-violet-500',    icon: 'Home' },
  { id: 'entertainment',  label: 'Entertainment',    color: '#ec4899', tailwindBg: 'bg-pink-500',      tailwindText: 'text-pink-500',      icon: 'Tv2' },
  { id: 'health',         label: 'Health',           color: '#14b8a6', tailwindBg: 'bg-teal-500',      tailwindText: 'text-teal-500',      icon: 'Heart' },
  { id: 'shopping',       label: 'Shopping',         color: '#f59e0b', tailwindBg: 'bg-amber-500',     tailwindText: 'text-amber-500',     icon: 'ShoppingBag' },
  { id: 'utilities',      label: 'Utilities',        color: '#6366f1', tailwindBg: 'bg-indigo-500',    tailwindText: 'text-indigo-500',    icon: 'Zap' },
  { id: 'travel',         label: 'Travel',           color: '#06b6d4', tailwindBg: 'bg-cyan-500',      tailwindText: 'text-cyan-500',      icon: 'Plane' },
  { id: 'subscriptions',  label: 'Subscriptions',    color: '#a855f7', tailwindBg: 'bg-purple-500',    tailwindText: 'text-purple-500',    icon: 'RefreshCw' },
  { id: 'savings',        label: 'Savings',          color: '#0ea5e9', tailwindBg: 'bg-sky-500',       tailwindText: 'text-sky-500',       icon: 'PiggyBank' },
  { id: 'investment',     label: 'Investment',       color: '#10b981', tailwindBg: 'bg-emerald-500',   tailwindText: 'text-emerald-500',   icon: 'LineChart' },
  { id: 'income',         label: 'Income',           color: '#22c55e', tailwindBg: 'bg-green-500',     tailwindText: 'text-green-500',     icon: 'TrendingUp' },
  { id: 'other',          label: 'Other',            color: '#94a3b8', tailwindBg: 'bg-slate-400',     tailwindText: 'text-slate-400',     icon: 'MoreHorizontal' },
]

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map(c => [c.id, c])
) as Record<CategoryId, Category>

export const EXPENSE_CATEGORIES = CATEGORIES.filter(c => c.id !== 'income')
export const CHART_COLORS = CATEGORIES.map(c => c.color)
