import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import type { Transaction, MonthlyData, YearlyData, CategoryId } from '../types'
import { CATEGORIES } from '../constants/categories'

const emptyCategoryTotals = (): Record<CategoryId, number> =>
  Object.fromEntries(CATEGORIES.map((c) => [c.id, 0])) as Record<CategoryId, number>

export function groupByMonth(transactions: Transaction[]): MonthlyData[] {
  const map = new Map<string, MonthlyData>()

  for (const t of transactions) {
    if (t.type === 'income') continue
    const key = t.date.slice(0, 7) // "2026-03"
    if (!map.has(key)) {
      map.set(key, {
        month: key,
        label: format(parseISO(t.date), 'MMM yyyy'),
        total: 0,
        byCategory: emptyCategoryTotals(),
        transactions: [],
      })
    }
    const entry = map.get(key)!
    entry.total += t.amount
    entry.byCategory[t.category] = (entry.byCategory[t.category] || 0) + t.amount
    entry.transactions.push(t)
  }

  return Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month))
}

export function getMonthlyData(transactions: Transaction[], month: string): MonthlyData {
  const monthStart = startOfMonth(parseISO(`${month}-01`))
  const monthEnd = endOfMonth(monthStart)

  const filtered = transactions.filter((t) =>
    isWithinInterval(parseISO(t.date), { start: monthStart, end: monthEnd })
  )

  const byCategory = emptyCategoryTotals()
  let total = 0
  const expenses = filtered.filter((t) => t.type === 'expense')
  for (const t of expenses) {
    total += t.amount
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
  }

  return {
    month,
    label: format(monthStart, 'MMMM yyyy'),
    total,
    byCategory,
    transactions: filtered,
  }
}

export function getYearlyData(transactions: Transaction[], year: number): YearlyData {
  const yearStr = String(year)
  const yearTxns = transactions.filter((t) => t.date.startsWith(yearStr))

  const byCategory = emptyCategoryTotals()
  let total = 0
  const byMonthMap = new Map<string, MonthlyData>()

  for (let m = 1; m <= 12; m++) {
    const month = `${year}-${String(m).padStart(2, '0')}`
    const date = parseISO(`${month}-01`)
    byMonthMap.set(month, {
      month,
      label: format(date, 'MMM'),
      total: 0,
      byCategory: emptyCategoryTotals(),
      transactions: [],
    })
  }

  for (const t of yearTxns) {
    if (t.type === 'income') continue
    const month = t.date.slice(0, 7)
    total += t.amount
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
    const entry = byMonthMap.get(month)
    if (entry) {
      entry.total += t.amount
      entry.byCategory[t.category] = (entry.byCategory[t.category] || 0) + t.amount
      entry.transactions.push(t)
    }
  }

  return {
    year,
    total,
    byCategory,
    byMonth: Array.from(byMonthMap.values()),
  }
}

export function getAvailableYears(transactions: Transaction[]): number[] {
  const years = new Set(transactions.map((t) => Number(t.date.slice(0, 4))))
  if (years.size === 0) years.add(new Date().getFullYear())
  return Array.from(years).sort((a, b) => b - a)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function currentMonth(): string {
  return format(new Date(), 'yyyy-MM')
}
