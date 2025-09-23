/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        // Light mode colors
        'light': {
          'primary': '#4F46E5',
          'secondary': '#6366F1', 
          'background': '#F9FAFB',
          'panel': '#FFFFFF',
          'text-primary': '#111827',
          'text-secondary': '#6B7280',
          'unread': '#EF4444',
          'hover': '#E0E7FF',
        },
        // Dark mode colors
        'dark': {
          'primary': '#818CF8',
          'secondary': '#A5B4FC',
          'background': '#1F2937',
          'panel': '#111827', 
          'text-primary': '#F9FAFB',
          'text-secondary': '#9CA3AF',
          'unread': '#F87171',
          'hover': '#374151',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}