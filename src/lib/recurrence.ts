import type { Transaction } from '../types'
import { addDays, addWeeks, addMonths, addYears, parseISO, isBefore, isAfter, format, startOfToday } from 'date-fns'

export function generateRecurringTransactions(transactions: Transaction[]): Omit<Transaction, 'id' | 'createdAt'>[] {
  const today = startOfToday()
  const newTxns: Omit<Transaction, 'id' | 'createdAt'>[] = []

  const recurring = transactions.filter(t => t.recurrence && t.recurrence !== 'none')

  for (const tx of recurring) {
    const lastDate = parseISO(tx.date)
    const endDate = tx.recurrenceEndDate ? parseISO(tx.recurrenceEndDate) : null

    let nextDate = getNextDate(lastDate, tx.recurrence!)

    // Generate instances up to today
    while (isBefore(nextDate, today) || format(nextDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      if (endDate && isAfter(nextDate, endDate)) break

      const dateStr = format(nextDate, 'yyyy-MM-dd')

      // Check if this instance already exists
      const exists = transactions.some(
        t => t.date === dateStr && t.amount === tx.amount && t.description === tx.description
      )

      if (!exists) {
        newTxns.push({
          date: dateStr,
          amount: tx.amount,
          type: tx.type,
          category: tx.category,
          description: tx.description,
          notes: tx.notes,
          source: tx.source,
          recurrence: tx.recurrence,
          recurrenceEndDate: tx.recurrenceEndDate,
        })
      }

      nextDate = getNextDate(nextDate, tx.recurrence!)
    }
  }

  return newTxns
}

function getNextDate(date: Date, recurrence: string): Date {
  switch (recurrence) {
    case 'weekly': return addWeeks(date, 1)
    case 'biweekly': return addWeeks(date, 2)
    case 'monthly': return addMonths(date, 1)
    case 'yearly': return addYears(date, 1)
    default: return addDays(date, 36500) // far future
  }
}
