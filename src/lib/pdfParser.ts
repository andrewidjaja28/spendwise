import * as pdfjsLib from 'pdfjs-dist'
import type { Transaction } from '../types'
import { autoCategory } from './autoCategory'

// Point the worker at the bundled version
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString()

// ── helpers ──────────────────────────────────────────────────────────────────

function parseDate(raw: string): string | null {
  const cleaned = raw.trim()
  // MM/DD/YYYY or DD/MM/YYYY
  const slash = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (slash) {
    const [, a, b, y] = slash
    const year = y.length === 2 ? `20${y}` : y
    return `${year}-${a.padStart(2, '0')}-${b.padStart(2, '0')}`
  }
  // YYYY-MM-DD
  const iso = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return cleaned
  // "Jan 15" / "Jan 15, 2026" / "15 Jan 2026"
  const d = new Date(cleaned)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return null
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/[^0-9.]/g, '')
  return Math.round(parseFloat(cleaned) * 100) / 100 || 0
}

function isDateLike(s: string): boolean {
  return (
    /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s.trim()) ||
    /^\d{4}-\d{2}-\d{2}$/.test(s.trim()) ||
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}/i.test(s.trim())
  )
}

function isAmountLike(s: string): boolean {
  return /^\$?[\d,]+\.\d{2}$/.test(s.trim())
}

// ── main parser ───────────────────────────────────────────────────────────────

export async function parsePdf(
  file: File
): Promise<Omit<Transaction, 'id' | 'createdAt'>[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  // Extract all text items with their positions
  interface TextItem { str: string; x: number; y: number; page: number }
  const items: TextItem[] = []

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const content = await page.getTextContent()
    for (const item of content.items) {
      if ('str' in item && item.str.trim()) {
        const [, , , , x, y] = item.transform as number[]
        items.push({ str: item.str.trim(), x, y, page: p })
      }
    }
  }

  // Group items into lines by (page, y-coordinate within ±2pt tolerance)
  const lines: string[][] = []
  const used = new Set<number>()

  const sorted = [...items].sort((a, b) =>
    a.page !== b.page ? a.page - b.page : b.y - a.y || a.x - b.x
  )

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(i)) continue
    const group = [sorted[i]]
    used.add(i)
    for (let j = i + 1; j < sorted.length; j++) {
      if (
        !used.has(j) &&
        sorted[j].page === sorted[i].page &&
        Math.abs(sorted[j].y - sorted[i].y) <= 3
      ) {
        group.push(sorted[j])
        used.add(j)
      }
    }
    group.sort((a, b) => a.x - b.x)
    lines.push(group.map((g) => g.str))
  }

  // Heuristic: a transaction line has a date token AND an amount token
  const transactions: Omit<Transaction, 'id' | 'createdAt'>[] = []

  for (const line of lines) {
    const joined = line.join(' ')
    const dateToken = line.find((t) => isDateLike(t))
    const amountTokens = line.filter((t) => isAmountLike(t))

    if (!dateToken || amountTokens.length === 0) continue

    const date = parseDate(dateToken)
    if (!date) continue

    const amount = parseAmount(amountTokens[amountTokens.length - 1])
    if (amount === 0) continue

    // Description: everything that is not the date and not an amount
    const descParts = line.filter(
      (t) => !isDateLike(t) && !isAmountLike(t) && t.length > 1
    )
    const description = descParts.join(' ').slice(0, 100) || joined.slice(0, 100)

    // Determine debit vs credit: some PDFs have two amount columns (debit, credit)
    // If there are two amounts, first = debit, second = credit (common TD/RBC format)
    let type: 'expense' | 'income' = 'expense'
    if (amountTokens.length >= 2) {
      const debit = parseAmount(amountTokens[0])
      const credit = parseAmount(amountTokens[1])
      type = credit > 0 && debit === 0 ? 'income' : 'expense'
    } else {
      // Single amount — use keyword heuristic
      const cat = autoCategory(description)
      if (cat === 'income') type = 'income'
    }

    transactions.push({
      date,
      amount,
      type,
      category: autoCategory(description),
      description,
      source: 'receipt',
    })
  }

  return transactions
}
