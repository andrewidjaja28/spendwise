import type { Transaction } from '../types'
import { CATEGORY_MAP } from '../constants/categories'
import { formatCurrency } from './dateUtils'
import { startOfMonth, subMonths, format, parseISO, startOfToday } from 'date-fns'

export interface Insight {
  id: string
  icon: 'trending-up' | 'trending-down' | 'alert' | 'trophy' | 'zap'
  title: string
  description: string
  type: 'positive' | 'negative' | 'neutral'
}

export function generateInsights(transactions: Transaction[]): Insight[] {
  const insights: Insight[] = []
  const today = startOfToday()
  const thisMonth = format(today, 'yyyy-MM')
  const lastMonth = format(subMonths(today, 1), 'yyyy-MM')

  const thisMonthTxns = transactions.filter(t => t.date.startsWith(thisMonth) && t.type === 'expense')
  const lastMonthTxns = transactions.filter(t => t.date.startsWith(lastMonth) && t.type === 'expense')

  const thisTotal = thisMonthTxns.reduce((s, t) => s + t.amount, 0)
  const lastTotal = lastMonthTxns.reduce((s, t) => s + t.amount, 0)

  // 1. Month-over-month total comparison
  if (lastTotal > 0) {
    const change = ((thisTotal - lastTotal) / lastTotal) * 100
    if (Math.abs(change) > 5) {
      insights.push({
        id: 'mom-total',
        icon: change > 0 ? 'trending-up' : 'trending-down',
        title: change > 0 ? `Spending up ${Math.round(change)}%` : `Spending down ${Math.round(Math.abs(change))}%`,
        description: `You've spent ${formatCurrency(thisTotal)} this month vs ${formatCurrency(lastTotal)} last month.`,
        type: change > 0 ? 'negative' : 'positive',
      })
    }
  }

  // 2. Category anomaly detection (>30% above 3-month average)
  const threeMonthsAgo = subMonths(today, 3)
  const recentTxns = transactions.filter(t => {
    const d = parseISO(t.date)
    return d >= threeMonthsAgo && d < startOfMonth(today) && t.type === 'expense'
  })

  // Group by category for averages
  const catAvg: Record<string, number> = {}
  for (const t of recentTxns) {
    catAvg[t.category] = (catAvg[t.category] || 0) + t.amount
  }
  for (const cat of Object.keys(catAvg)) {
    catAvg[cat] = catAvg[cat] / 3
  }

  // Compare this month per category
  const thisCatTotals: Record<string, number> = {}
  for (const t of thisMonthTxns) {
    thisCatTotals[t.category] = (thisCatTotals[t.category] || 0) + t.amount
  }

  for (const [cat, total] of Object.entries(thisCatTotals)) {
    const avg = catAvg[cat]
    if (avg && avg > 20 && total > avg * 1.3) {
      const catLabel = CATEGORY_MAP[cat]?.label || cat
      insights.push({
        id: `anomaly-${cat}`,
        icon: 'alert',
        title: `${catLabel} spending is high`,
        description: `${formatCurrency(total)} this month vs ${formatCurrency(avg)} monthly average.`,
        type: 'negative',
      })
    }
  }

  // 3. Top merchant this month
  if (thisMonthTxns.length > 0) {
    const merchantCounts: Record<string, { count: number; total: number }> = {}
    for (const t of thisMonthTxns) {
      if (!merchantCounts[t.description]) merchantCounts[t.description] = { count: 0, total: 0 }
      merchantCounts[t.description].count++
      merchantCounts[t.description].total += t.amount
    }
    const topMerchant = Object.entries(merchantCounts).sort((a, b) => b[1].total - a[1].total)[0]
    if (topMerchant && topMerchant[1].count >= 2) {
      insights.push({
        id: 'top-merchant',
        icon: 'trophy',
        title: `Top spend: ${topMerchant[0]}`,
        description: `${topMerchant[1].count} transactions totaling ${formatCurrency(topMerchant[1].total)} this month.`,
        type: 'neutral',
      })
    }
  }

  // 4. Daily spending rate
  const dayOfMonth = today.getDate()
  if (dayOfMonth >= 5 && thisTotal > 0) {
    const dailyRate = thisTotal / dayOfMonth
    const projected = dailyRate * 30
    insights.push({
      id: 'daily-rate',
      icon: 'zap',
      title: `On pace to spend ${formatCurrency(projected)}`,
      description: `Averaging ${formatCurrency(dailyRate)}/day over ${dayOfMonth} days.`,
      type: projected > lastTotal * 1.1 ? 'negative' : 'neutral',
    })
  }

  return insights.slice(0, 4) // max 4 insights
}
