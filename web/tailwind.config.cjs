/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f8f5ec',
        ink: '#1f2937',
        accent: {
          primary: '#d97706',
          secondary: '#0ea5a3',
          line: '#d1c7aa'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Space Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(0,0,0,0.04), 0 10px 20px -10px rgba(0,0,0,0.15)'
      }
    }
  },
  plugins: []
};
