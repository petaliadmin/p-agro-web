/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  safelist: [
    'bg-purple-100', 'text-purple-800',
    'bg-blue-100', 'text-blue-800',
    'bg-green-100', 'text-green-800',
    'bg-gray-100', 'text-gray-700',
    'bg-orange-100', 'text-orange-800',
    'bg-red-100', 'text-red-800',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#E8F5EE',
          100: '#C5E6D3',
          200: '#8FCCA9',
          400: '#2D9E64',
          600: '#1A7A4A',
          800: '#0F4D2E',
          900: '#072918',
        },
        secondary: {
          400: '#0D6B5E',
          600: '#085048',
        },
        warning: {
          400: '#F5A623',
          100: '#FEF6E4',
        },
        danger: {
          400: '#DC2626',
          100: '#FEF2F2',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
