import { useState } from 'react'
import { Modal } from '../shared/Modal'
import { Button } from '../shared/Button'
import { useTransactionStore } from '../../store/transactionStore'
import { useUiStore } from '../../store/uiStore'
import { generateShareUrl, generateMailtoLink } from '../../lib/share'
import { Copy, Check, Send, Link, Eye, AlertCircle } from 'lucide-react'

export function ShareModal() {
  const { showShareModal, setShowShareModal } = useUiStore()
  const transactions = useTransactionStore((s) => s.transactions)
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [error, setError] = useState('')

  const handleGenerate = () => {
    if (transactions.length === 0) {
      setError('No transactions to share.')
      return
    }
    try {
      const url = generateShareUrl(transactions)
      // Check if URL is too long (browsers typically support ~8,000 chars, but let's warn at 4,000)
      if (url.length > 100000) {
        setError('Too many transactions to share via link. Try exporting as JSON from Settings instead.')
        return
      }
      setShareUrl(url)
      setError('')
    } catch {
      setError('Failed to generate share link.')
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = shareUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleEmailSend = () => {
    if (!email.trim()) return
    const url = shareUrl || generateShareUrl(transactions)
    if (!shareUrl) setShareUrl(url)
    window.open(generateMailtoLink(url, email.trim()), '_blank')
  }

  const handleClose = () => {
    setShowShareModal(false)
    setShareUrl('')
    setCopied(false)
    setEmail('')
    setError('')
  }

  return (
    <Modal open={showShareModal} onClose={handleClose} title="Share Spending Report">
      <div className="space-y-5">
        {/* Info banner */}
        <div className="flex items-start gap-3 p-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <Eye size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Read-only access</p>
            <p className="text-blue-600 dark:text-blue-400">
              Anyone with the link can view your dashboard, charts, and transactions. They cannot edit or add anything.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Generate link */}
        {!shareUrl ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Generate a link containing your {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}.
              The data is compressed and embedded in the URL.
            </p>
            <Button onClick={handleGenerate} disabled={transactions.length === 0}>
              <Link size={16} />
              Generate Share Link
            </Button>
          </div>
        ) : (
          <>
            {/* Copy link */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Share link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm truncate focus:outline-none"
                />
                <Button onClick={handleCopy} variant={copied ? 'primary' : 'secondary'}>
                  {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {shareUrl.length.toLocaleString()} characters · Link contains all transaction data
              </p>
            </div>

            {/* Email invite */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Send via email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSend()}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleEmailSend} disabled={!email.trim()}>
                  <Send size={14} />
                  Send
                </Button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Opens your email app with the link pre-filled
              </p>
            </div>
          </>
        )}

        {/* Note about hosting */}
        <div className="text-xs text-slate-400 dark:text-slate-500 text-center pt-2 border-t border-slate-100 dark:border-slate-800">
          The recipient needs access to this app's URL to view the link.
          If running locally, deploy to Vercel/Netlify for external sharing.
        </div>
      </div>
    </Modal>
  )
}
