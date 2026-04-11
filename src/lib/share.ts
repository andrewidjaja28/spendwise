import LZString from 'lz-string'
import type { Transaction } from '../types'

// Compact a transaction for sharing (strip fields that can be inferred)
interface CompactTx {
  d: string   // date
  a: number   // amount
  t: 'e' | 'i' // type
  c: string   // category
  n: string   // description
}

function compact(tx: Transaction): CompactTx {
  return {
    d: tx.date,
    a: tx.amount,
    t: tx.type === 'income' ? 'i' : 'e',
    c: tx.category,
    n: tx.description,
  }
}

function expand(ct: CompactTx): Omit<Transaction, 'id' | 'createdAt'> {
  return {
    date: ct.d,
    amount: ct.a,
    type: ct.t === 'i' ? 'income' : 'expense',
    category: ct.c as Transaction['category'],
    description: ct.n,
    source: 'manual',
  }
}

/**
 * Encode transactions into a compressed URL-safe string
 */
export function encodeShareData(transactions: Transaction[]): string {
  const compacted = transactions.map(compact)
  const json = JSON.stringify(compacted)
  return LZString.compressToEncodedURIComponent(json)
}

/**
 * Decode shared data from a compressed string
 */
export function decodeShareData(
  encoded: string
): Omit<Transaction, 'id' | 'createdAt'>[] | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded)
    if (!json) return null
    const compacted: CompactTx[] = JSON.parse(json)
    if (!Array.isArray(compacted)) return null
    return compacted.map(expand)
  } catch {
    return null
  }
}

/**
 * Generate a full share URL for the current page
 */
export function generateShareUrl(transactions: Transaction[]): string {
  const encoded = encodeShareData(transactions)
  const base = window.location.origin + window.location.pathname
  return `${base}?shared=${encoded}`
}

/**
 * Check URL for shared data on page load
 */
export function getSharedDataFromUrl(): Omit<Transaction, 'id' | 'createdAt'>[] | null {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('shared')
  if (!encoded) return null
  return decodeShareData(encoded)
}

/**
 * Generate a mailto link with the share URL
 */
export function generateMailtoLink(
  shareUrl: string,
  recipientEmail: string
): string {
  const subject = encodeURIComponent('View my spending report — Stash')
  const body = encodeURIComponent(
    `Hi,\n\nI'm sharing my spending tracker with you. Click the link below to view:\n\n${shareUrl}\n\nThis is a read-only view — no login needed.\n\n— Sent from Stash`
  )
  return `mailto:${recipientEmail}?subject=${subject}&body=${body}`
}
