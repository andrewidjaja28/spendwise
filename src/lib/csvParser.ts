import Papa from 'papaparse'
import type { Transaction } from '../types'
import { autoCategory } from './autoCategory'

interface RawRow {
  [key: string]: string
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[\s_\-]/g, '')
}

function findColumn(row: RawRow, candidates: string[]): string | undefined {
  const keys = Object.keys(row)
  // Exact match first
  for (const candidate of candidates) {
    const found = keys.find((k) => normalizeKey(k) === normalizeKey(candidate))
    if (found !== undefined && row[found]?.trim()) return row[found]
  }
  // Partial match: column name contains candidate
  for (const candidate of candidates) {
    const norm = normalizeKey(candidate)
    const found = keys.find((k) => normalizeKey(k).includes(norm) || norm.includes(normalizeKey(k)))
    if (found !== undefined && row[found]?.trim()) return row[found]
  }
  return undefined
}

function parseAmount(raw: string): number {
  if (!raw) return 0
  // Remove currency symbols, spaces, commas
  const cleaned = raw.replace(/[^0-9.\-]/g, '')
  return Math.abs(parseFloat(cleaned) || 0)
}

function inferType(row: RawRow, amount: string): 'expense' | 'income' {
  // Check for debit/credit columns
  const debit = findColumn(row, ['debit', 'withdrawal', 'amount debit'])
  const credit = findColumn(row, ['credit', 'deposit', 'amount credit'])
  if (debit && parseFloat(debit.replace(/[^0-9.\-]/g, '')) > 0) return 'expense'
  if (credit && parseFloat(credit.replace(/[^0-9.\-]/g, '')) > 0) return 'income'
  // Negative amount = expense in most bank exports
  const raw = amount.replace(/[^0-9.\-]/g, '')
  return parseFloat(raw) < 0 ? 'expense' : 'income'
}

function parseDate(raw: string): string {
  if (!raw) return new Date().toISOString().slice(0, 10)
  // Try common formats
  const cleaned = raw.trim()
  // "MM/DD/YYYY" or "DD/MM/YYYY"
  const slashMatch = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const [, a, b, year] = slashMatch
    // Assume MM/DD/YYYY for North American banks
    return `${year}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`
  }
  // "YYYY-MM-DD"
  const isoMatch = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoMatch) return cleaned.slice(0, 10)
  // "Month DD, YYYY"
  const d = new Date(cleaned)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return new Date().toISOString().slice(0, 10)
}

// Try to parse a row from a headerless CSV by position
// Many Canadian banks (TD, Tangerine, CIBC) export: Date, Description, Debit, Credit, Balance
function parseHeaderlessRow(values: string[], colCount: number): Omit<Transaction, 'id' | 'createdAt'> | null {
  if (values.length < 3) return null

  // Find the first date-like column
  let dateIdx = -1
  for (let i = 0; i < Math.min(3, values.length); i++) {
    if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(values[i].trim()) ||
        /^\d{4}-\d{2}-\d{2}$/.test(values[i].trim())) {
      dateIdx = i
      break
    }
  }
  if (dateIdx === -1) return null

  // 5-column format: Date, Description, Debit, Credit, Balance
  // Use positional parsing — ignore the balance column (last)
  if (colCount === 5 && dateIdx === 0) {
    const description = (values[1] || '').trim().slice(0, 100) || 'Unknown'
    const debitRaw = values[2]?.trim() || ''
    const creditRaw = values[3]?.trim() || ''
    const debit = parseAmount(debitRaw)
    const credit = parseAmount(creditRaw)

    let amount = 0
    let type: 'expense' | 'income' = 'expense'
    if (debit > 0) { amount = debit; type = 'expense' }
    else if (credit > 0) { amount = credit; type = 'income' }
    if (amount === 0) return null

    const cat = autoCategory(description)
    return {
      date: parseDate(values[0]),
      amount,
      type: cat === 'income' ? 'income' : type,
      category: cat,
      description,
      source: 'csv',
    }
  }

  // Generic fallback: find amount-like columns
  const amountIndices: number[] = []
  for (let i = 0; i < values.length; i++) {
    if (i !== dateIdx && /^\$?[\d,]+\.?\d*$/.test(values[i].replace(/\s/g, '')) && values[i].trim()) {
      amountIndices.push(i)
    }
  }

  // Description is typically the column after date that isn't a number
  let descIdx = -1
  for (let i = dateIdx + 1; i < values.length; i++) {
    if (!amountIndices.includes(i) && values[i].trim()) {
      descIdx = i
      break
    }
  }

  const description = descIdx >= 0 ? values[descIdx].trim().slice(0, 100) : 'Unknown'
  let amount = 0
  let type: 'expense' | 'income' = 'expense'

  if (amountIndices.length >= 2) {
    const withdrawal = parseAmount(values[amountIndices[0]])
    const deposit = parseAmount(values[amountIndices[1]])
    if (deposit > 0 && withdrawal === 0) { amount = deposit; type = 'income' }
    else { amount = withdrawal || deposit; type = 'expense' }
  } else if (amountIndices.length === 1) {
    amount = parseAmount(values[amountIndices[0]])
    const raw = values[amountIndices[0]].replace(/[^0-9.\-]/g, '')
    type = parseFloat(raw) < 0 ? 'expense' : 'income'
  }

  if (amount === 0) return null

  const cat = autoCategory(description)
  return {
    date: parseDate(values[dateIdx]),
    amount,
    type: cat === 'income' ? 'income' : type,
    category: cat,
    description,
    source: 'csv',
  }
}

// Known column name keywords that real headers would contain
const KNOWN_HEADER_KEYWORDS = [
  'date', 'description', 'memo', 'details', 'amount', 'debit', 'credit',
  'withdrawal', 'deposit', 'transaction', 'posting', 'payee', 'name',
  'narrative', 'merchant', 'value', 'balance', 'type', 'category',
]

function looksLikeRealHeaders(keys: string[]): boolean {
  const normalizedKeys = keys.map(normalizeKey).filter(Boolean)
  // At least one header must match a known keyword
  return normalizedKeys.some((k) =>
    KNOWN_HEADER_KEYWORDS.some((kw) => k.includes(kw) || kw.includes(k))
  )
}

export function parseCsv(
  file: File
): Promise<Omit<Transaction, 'id' | 'createdAt'>[]> {
  return new Promise((resolve, reject) => {
    // First try with headers
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data
          const headerKeys = rows.length > 0 ? Object.keys(rows[0]) : []
          const hasRealHeaders = looksLikeRealHeaders(headerKeys)

          if (hasRealHeaders) {
            const transactions: Omit<Transaction, 'id' | 'createdAt'>[] = rows
              .map((row): Omit<Transaction, 'id' | 'createdAt'> | null => {
                const dateRaw =
                  findColumn(row, ['date', 'transaction date', 'posting date', 'transactiondate', 'account transaction date']) || ''
                const descRaw =
                  findColumn(row, ['description', 'memo', 'details', 'narrative', 'payee', 'name', 'transaction description', 'merchant']) || 'Unknown'
                const amountRaw =
                  findColumn(row, ['amount', 'transaction amount', 'debit', 'credit', 'value', 'withdrawal', 'deposit']) || '0'

                const amount = parseAmount(amountRaw)
                if (amount === 0) return null

                const description = descRaw.trim().slice(0, 100)
                const type = inferType(row, amountRaw)
                const cat = autoCategory(description)
                return {
                  date: parseDate(dateRaw),
                  amount,
                  type: cat === 'income' ? 'income' : type,
                  category: cat,
                  description,
                  source: 'csv',
                }
              })
              .filter((t): t is Omit<Transaction, 'id' | 'createdAt'> => t !== null)

            if (transactions.length > 0) {
              resolve(transactions)
              return
            }
          }

          // Fallback: headerless parsing
          Papa.parse(file, {
            header: false,
            skipEmptyLines: true,
            complete: (noHeaderResults) => {
              const allRows = noHeaderResults.data as string[][]
              // Determine consistent column count from majority of rows
              const colCount = allRows.length > 0
                ? allRows.reduce((max, row) => Math.max(max, row.length), 0)
                : 0
              const fallback = allRows
                .map((row) => parseHeaderlessRow(row, colCount))
                .filter((t): t is Omit<Transaction, 'id' | 'createdAt'> => t !== null)
              resolve(fallback)
            },
            error: () => resolve([]),
          })
        } catch (e) {
          reject(e)
        }
      },
      error: (err) => reject(err),
    })
  })
}
