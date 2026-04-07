/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'] },
      colors: {
        bg: { DEFAULT: '#0a0a0a', 2: '#0f0f0f' },
        surface: { DEFAULT: '#111111', 2: '#161616', 3: '#1c1c1c', 4: '#222222' },
        border: { DEFAULT: '#1e1e1e', 2: '#2a2a2a', 3: '#333333' },
        accent: { DEFAULT: '#5b6ef9', hover: '#4a5cf7' },
        dim: '#a1a1aa',
        muted: '#71717a',
        faint: '#52525b',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease',
        'slide-up': 'slideUp 0.18s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-right': 'slideRight 0.2s cubic-bezier(0.16,1,0.3,1)',
        'scale-in': 'scaleIn 0.15s cubic-bezier(0.16,1,0.3,1)',
        'toast-in': 'toastIn 0.22s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideRight: { from: { opacity: '0', transform: 'translateX(16px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn: { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        toastIn: { from: { opacity: '0', transform: 'translateX(110%) scale(0.95)' }, to: { opacity: '1', transform: 'translateX(0) scale(1)' } },
      },
      boxShadow: {
        glass: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.5)',
        modal: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.85)',
        glow: '0 0 20px rgba(91,110,249,0.3)',
      },
    },
  },
  plugins: [],
}
