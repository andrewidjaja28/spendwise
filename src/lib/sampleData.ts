import type { Transaction, CategoryId } from '../types'

const rand = (min: number, max: number) =>
  Math.round((Math.random() * (max - min) + min) * 100) / 100

const sample = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const merchants: Record<CategoryId, string[]> = {
  food_dining: ['Tim Hortons', 'McDonald\'s', 'The Keg', 'Sushi Shop', 'A&W', 'Subway', 'Café Olimpico'],
  groceries: ['Loblaws', 'Metro', 'No Frills', 'Costco', 'Sobeys', 'Whole Foods'],
  transport: ['Presto', 'Uber', 'Shell', 'Petro-Canada', 'TTC', 'Lyft'],
  housing: ['Rent - Main St', 'Rogers Home Insurance'],
  entertainment: ['Netflix', 'Cineplex', 'Spotify', 'TIFF', 'Steam'],
  health: ['Shoppers Drug Mart', 'Goodlife Fitness', 'Maple Telehealth', 'Rexall'],
  shopping: ['Amazon', 'IKEA', 'H&M', 'Zara', 'Sport Chek'],
  utilities: ['Enbridge Gas', 'Toronto Hydro', 'Rogers Internet', 'Bell Mobility'],
  travel: ['Air Canada', 'Airbnb', 'Expedia', 'WestJet'],
  subscriptions: ['Apple One', 'Adobe CC', 'YouTube Premium', 'Amazon Prime'],
  savings: ['TFSA Contribution', 'HISA Transfer', 'Emergency Fund'],
  investment: ['Wealthsimple', 'Questrade', 'RRSP Contribution'],
  income: ['Payroll Deposit', 'Freelance Payment', 'E-Transfer'],
  other: ['ATM Withdrawal', 'Bank Fee', 'Misc'],
}

const expenseCategories: CategoryId[] = [
  'food_dining','groceries','transport','housing','entertainment',
  'health','shopping','utilities','travel','subscriptions','other',
]

const weights = [20, 15, 12, 8, 8, 5, 10, 6, 3, 5, 8]
const amountRanges: Record<CategoryId, [number, number]> = {
  food_dining:    [8, 65],
  groceries:      [30, 200],
  transport:      [5, 80],
  housing:        [1200, 1800],
  entertainment:  [10, 60],
  health:         [15, 120],
  shopping:       [20, 250],
  utilities:      [40, 200],
  travel:         [150, 800],
  subscriptions:  [8, 25],
  savings:        [200, 1000],
  investment:     [100, 500],
  income:         [2000, 5000],
  other:          [10, 100],
}

function weightedCategory(): CategoryId {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < expenseCategories.length; i++) {
    r -= weights[i]
    if (r <= 0) return expenseCategories[i]
  }
  return 'other'
}

export function generateSampleData(): Omit<Transaction, 'id' | 'createdAt'>[] {
  const txns: Omit<Transaction, 'id' | 'createdAt'>[] = []
  const now = new Date()

  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    const date = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1)
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Income: 1-2 per month
    for (let i = 0; i < (Math.random() > 0.3 ? 2 : 1); i++) {
      const day = i === 0 ? 15 : 30
      txns.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(Math.min(day, daysInMonth)).padStart(2, '0')}`,
        amount: rand(3500, 5500),
        type: 'income',
        category: 'income',
        description: sample(merchants.income),
        source: 'manual',
      })
    }

    // Expenses: 20-35 per month
    const count = Math.floor(rand(20, 35))
    for (let i = 0; i < count; i++) {
      const cat = weightedCategory()
      const [min, max] = amountRanges[cat]
      const day = Math.floor(Math.random() * daysInMonth) + 1

      txns.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        amount: rand(min, max),
        type: 'expense',
        category: cat,
        description: sample(merchants[cat]),
        source: 'manual',
      })
    }
  }

  return txns
}
