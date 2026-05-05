// Shared chart configuration for Recharts components
// Centralizes colors that can't use Tailwind classes (Recharts requires inline styles)

export const CHART_COLORS = {
  accent: '#34d399',       // emerald-400
  accentDark: '#059669',   // emerald-600
  tickText: '#9a9088',     // warm gray (replaces cold slate-400)
  gridLine: '#e8e4df',     // warm grid line (replaces cold slate-200)
  gridLineDark: '#231f1b', // warm dark grid (replaces cold slate-800)
} as const
