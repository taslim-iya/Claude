/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'] },
      colors: {
        bg:      { DEFAULT: 'var(--bg)',      2: 'var(--bg-2)' },
        surface: { DEFAULT: 'var(--surface)', 2: 'var(--surface-2)', 3: 'var(--surface-3)' },
        border:  { DEFAULT: 'var(--border)',  2: 'var(--border-2)' },
        accent:  { DEFAULT: '#5b6ef9',        hover: '#4a5de8' },
        text:    { DEFAULT: 'var(--text)',     2: 'var(--text-2)',   3: 'var(--text-3)' },
      },
      animation: {
        'fade-in':       'fadeIn 0.15s ease',
        'slide-up':      'slideUp 0.18s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-right':'slideRight 0.2s cubic-bezier(0.16,1,0.3,1)',
        'scale-in':      'scaleIn 0.15s cubic-bezier(0.16,1,0.3,1)',
        'toast-in':      'toastIn 0.22s cubic-bezier(0.16,1,0.3,1)',
        'pulse-slow':    'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight:{ from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:   { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        toastIn:   { from: { opacity: '0', transform: 'translateX(110%) scale(0.95)' }, to: { opacity: '1', transform: 'translateX(0) scale(1)' } },
      },
      boxShadow: {
        card:  'var(--shadow-card)',
        modal: 'var(--shadow-modal)',
        glow:  'var(--shadow-glow)',
        'glow-lg': '0 0 40px rgba(91,110,249,0.25)',
      },
    },
  },
  plugins: [],
}
