import { useState, useRef } from 'react'
import { Upload, FileText, FileType, CheckCircle, AlertCircle, Sparkles, type LucideIcon } from 'lucide-react'
import { ImportReviewModal } from './ImportReviewModal'
import { parseCsv } from '../../lib/csvParser'
import { parsePdf } from '../../lib/pdfParser'
import type { Transaction } from '../../types'

type Status = 'idle' | 'parsing' | 'done' | 'error'

interface UploadZoneState {
  status: Status
  error: string
  drafts: Omit<Transaction, 'id' | 'createdAt'>[]
  reviewOpen: boolean
}

const initState = (): UploadZoneState => ({
  status: 'idle', error: '', drafts: [], reviewOpen: false,
})

export function UploadPage() {
  const [csv, setCsv] = useState<UploadZoneState>(initState())
  const [pdf, setPdf] = useState<UploadZoneState>(initState())
  const csvRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  const handleFile = async (
    file: File,
    type: 'csv' | 'pdf',
    setState: React.Dispatch<React.SetStateAction<UploadZoneState>>
  ) => {
    setState((s) => ({ ...s, status: 'parsing', error: '' }))
    try {
      const drafts = type === 'csv' ? await parseCsv(file) : await parsePdf(file)
      if (drafts.length === 0) {
        setState((s) => ({
          ...s,
          status: 'error',
          error: type === 'pdf'
            ? 'No transactions found. This PDF format may not be supported — try exporting as CSV from your bank instead.'
            : 'No transactions found. Make sure the CSV has Date, Description, and Amount columns.',
        }))
        return
      }
      setState((s) => ({ ...s, status: 'idle', drafts, reviewOpen: true }))
    } catch (e) {
      setState((s) => ({
        ...s,
        status: 'error',
        error: `Failed to parse ${type.toUpperCase()}. ${e instanceof Error ? e.message : 'Please check the file and try again.'}`,
      }))
    }
  }

  const DropZone = ({
    type,
    state,
    setState,
    inputRef,
    icon: Icon,
    iconBg,
    iconColor,
    label,
    subLabel,
    accept,
    parsing,
  }: {
    type: 'csv' | 'pdf'
    state: UploadZoneState
    setState: React.Dispatch<React.SetStateAction<UploadZoneState>>
    inputRef: React.RefObject<HTMLInputElement>
    icon: LucideIcon
    iconBg: string
    iconColor: string
    label: string
    subLabel: string
    accept: string
    parsing: string
  }) => (
    <div
      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
        state.status === 'parsing'
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
          : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) handleFile(file, type, setState)
      }}
      onClick={() => { if (state.status !== 'parsing') inputRef.current?.click() }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0], type, setState) }}
      />

      {state.status === 'parsing' ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-slate-600 dark:text-slate-400">{parsing}</p>
        </div>
      ) : state.status === 'done' ? (
        <div className="flex flex-col items-center gap-3">
          <CheckCircle className="text-green-500" size={32} />
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Import complete!</p>
          <p className="text-xs text-slate-400">Click to import another file</p>
        </div>
      ) : state.status === 'error' ? (
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="text-red-500" size={32} />
          <p className="text-sm text-red-600 dark:text-red-400 max-w-xs">{state.error}</p>
          <p className="text-xs text-slate-400">Click to try again</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon size={24} className={iconColor} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</p>
            <p className="text-xs text-slate-400 mt-1">{subLabel}</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">

      {/* Auto-categorization notice */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <Sparkles size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Auto-categorization on:</strong> transactions are matched to categories by merchant name (Tim Hortons → Food, Loblaws → Groceries, etc.). You can correct any before importing.
        </p>
      </div>

      {/* CSV */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Import Bank Statement — CSV</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Export a CSV from your online banking and drop it here.</p>
        <DropZone
          type="csv"
          state={csv}
          setState={setCsv}
          inputRef={csvRef}
          icon={FileText}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          label="Drop CSV here or click to browse"
          subLabel="TD, RBC, Scotia, BMO, CIBC, Tangerine, Simplii"
          accept=".csv"
          parsing="Reading and categorizing transactions…"
        />
      </section>

      {/* PDF */}
      <section>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Import Bank Statement — PDF</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Upload a PDF statement. Works best with text-based PDFs (not scanned images).</p>
        <DropZone
          type="pdf"
          state={pdf}
          setState={setPdf}
          inputRef={pdfRef}
          icon={FileType}
          iconBg="bg-rose-100 dark:bg-rose-900/30"
          iconColor="text-rose-600 dark:text-rose-400"
          label="Drop PDF here or click to browse"
          subLabel="Best results with TD, RBC, Scotia e-statements (text PDF)"
          accept=".pdf"
          parsing="Extracting transactions from PDF…"
        />
      </section>

      {/* Tips */}
      <section className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
            <Upload size={15} /> CSV Export Tips
          </h3>
          <ul className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
            <li>• <strong className="text-slate-700 dark:text-slate-300">TD:</strong> Account Activity → Download → CSV</li>
            <li>• <strong className="text-slate-700 dark:text-slate-300">RBC:</strong> Online Banking → Statement → Download Transactions → CSV</li>
            <li>• <strong className="text-slate-700 dark:text-slate-300">Scotia:</strong> Transactions → Export → CSV</li>
            <li>• <strong className="text-slate-700 dark:text-slate-300">Tangerine / Simplii:</strong> Account Activity → Export</li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">PDF Tips</h3>
          <ul className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
            <li>• Use <strong className="text-slate-700 dark:text-slate-300">e-statements</strong> (downloaded from online banking), not scanned paper</li>
            <li>• If PDF results are messy, use CSV instead — it's always more accurate</li>
          </ul>
        </div>
      </section>

      {/* Review modals */}
      <ImportReviewModal
        open={csv.reviewOpen}
        onClose={() => setCsv((s) => ({ ...s, reviewOpen: false }))}
        drafts={csv.drafts}
        onImported={() => setCsv((s) => ({ ...s, status: 'done', reviewOpen: false }))}
      />
      <ImportReviewModal
        open={pdf.reviewOpen}
        onClose={() => setPdf((s) => ({ ...s, reviewOpen: false }))}
        drafts={pdf.drafts}
        onImported={() => setPdf((s) => ({ ...s, status: 'done', reviewOpen: false }))}
      />
    </div>
  )
}
