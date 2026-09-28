/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfbf7',
          100: '#faf5ee',
          200: '#f3ebde',
          300: '#ebe0cd',
          400: '#dccdac',
          500: '#c9b894',
        },
        blush: {
          50: '#fdf5f5',
          100: '#fbe8e8',
          200: '#f5d0d0',
          300: '#ebb0b0',
          400: '#d88a8a',
          500: '#c46e6e',
          600: '#a85555',
        },
        lavender: {
          50: '#f7f5fb',
          100: '#ece8f5',
          200: '#ddd5eb',
          300: '#c9bcdc',
          400: '#b39dcd',
          500: '#9a82c0',
          600: '#826aae',
        },
        sage: {
          50: '#f5f7f4',
          100: '#e8efe5',
          200: '#d4e0cf',
          300: '#b8cab0',
          400: '#9ab48d',
          500: '#7d9a6e',
          600: '#648057',
        },
        ink: {
          50: '#f8f7f5',
          100: '#efece8',
          200: '#e0dcd5',
          300: '#c9c3b8',
          400: '#a89f90',
          500: '#8a8170',
          600: '#6e6657',
          700: '#534c40',
          800: '#3a3530',
          900: '#2a2620',
          950: '#1a1814',
        },
      },
      fontFamily: {
        serif: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(58, 53, 48, 0.06), 0 4px 16px -4px rgba(58, 53, 48, 0.04)',
        card: '0 1px 3px rgba(58, 53, 48, 0.04), 0 6px 24px -8px rgba(58, 53, 48, 0.08)',
        hover: '0 4px 12px -2px rgba(58, 53, 48, 0.08), 0 12px 36px -6px rgba(58, 53, 48, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
