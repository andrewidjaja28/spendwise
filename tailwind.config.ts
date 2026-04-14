import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#34d399',
          light: '#6ee7b7',
          dark: '#059669',
        },
        vault: {
          50: '#f8fafc',
          100: '#f1f5f9',
          800: '#12121a',
          900: '#0a0a0f',
          950: '#050508',
        },
        // Category colors
        'cat-food': '#f97316',
        'cat-groceries': '#84cc16',
        'cat-transport': '#3b82f6',
        'cat-housing': '#8b5cf6',
        'cat-entertainment': '#ec4899',
        'cat-health': '#14b8a6',
        'cat-shopping': '#f59e0b',
        'cat-utilities': '#6366f1',
        'cat-travel': '#06b6d4',
        'cat-subscriptions': '#a855f7',
        'cat-savings': '#0ea5e9',
        'cat-investment': '#10b981',
        'cat-income': '#22c55e',
        'cat-other': '#94a3b8',
      },
    },
  },
  plugins: [],
} satisfies Config
