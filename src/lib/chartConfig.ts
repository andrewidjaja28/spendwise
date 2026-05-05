// Shared chart configuration for Recharts components
// Centralizes colors that can't use Tailwind classes (Recharts requires inline styles)

export const CHART_COLORS = {
  accent: '#34d399',       // emerald-400
  accentDark: '#059669',   // emerald-600
  tickText: '#94a3b8',     // slate-400
  gridLine: '#e2e8f0',     // slate-200
  gridLineDark: '#1e293b', // slate-800
} as const
