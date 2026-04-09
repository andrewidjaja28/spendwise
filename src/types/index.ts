export type CategoryId =
  | 'food_dining'
  | 'groceries'
  | 'transport'
  | 'housing'
  | 'entertainment'
  | 'health'
  | 'shopping'
  | 'utilities'
  | 'travel'
  | 'subscriptions'
  | 'savings'
  | 'investment'
  | 'income'
  | 'other'

export interface Transaction {
  id: string
  date: string           // ISO 8601: "2026-03-15"
  amount: number         // always positive
  type: 'expense' | 'income'
  category: CategoryId
  description: string
  notes?: string
  source: 'manual' | 'csv' | 'receipt'
  importBatchId?: string
  createdAt: string
}

export interface Category {
  id: CategoryId
  label: string
  color: string          // hex color for Recharts
  tailwindBg: string     // tailwind bg class
  tailwindText: string   // tailwind text class
  icon: string           // lucide icon name
}

export type ViewId = 'dashboard' | 'monthly' | 'yearly' | 'upload' | 'settings'

export interface MonthlyData {
  month: string          // "2026-03"
  label: string          // "Mar 2026"
  total: number
  byCategory: Record<CategoryId, number>
  transactions: Transaction[]
}

export interface YearlyData {
  year: number
  total: number
  byCategory: Record<CategoryId, number>
  byMonth: MonthlyData[]
}
