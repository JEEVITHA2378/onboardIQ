/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        surface: '#f8fafc',
        card: '#ffffff',
        border: '#e2e8f0',
        'border-strong': '#cbd5e1',
        'primary-dark': '#0f172a',
        'accent-blue': '#0ea5e9',
        green: '#10b981',
        amber: '#f59e0b',
        red: '#ef4444',
        muted: '#64748b'
      },
      fontFamily: {
        headline: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
      },
      borderRadius: {
        'card': '12px',
      }
    },
  },
  plugins: [],
}
