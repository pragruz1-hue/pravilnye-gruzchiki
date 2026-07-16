/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#2563eb',
          400: '#3b82f6',
          700: '#1d4ed8'
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
        'blue-glow': '0 8px 20px rgba(37, 99, 235, 0.4)'
      },
      backdropBlur: {
        glass: '20px'
      }
    }
  },
  plugins: []
};
