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
        // Enhanced color palette for light and dark modes
        'app': {
          // Light mode colors
          'light': {
            'primary': '#4F46E5',           // indigo-600
            'primary-hover': '#4338CA',     // indigo-700
            'secondary': '#6366F1',         // indigo-500
            'secondary-hover': '#4F46E5',   // indigo-600
            'background': '#F9FAFB',        // gray-50
            'background-alt': '#F3F4F6',    // gray-100
            'panel': '#FFFFFF',             // white
            'panel-border': '#E5E7EB',      // gray-200
            'text-main': '#111827',         // gray-900
            'text-secondary': '#6B7280',    // gray-500
            'text-muted': '#9CA3AF',        // gray-400
            'unread': '#EF4444',            // red-500
            'hover': '#E0E7FF',             // indigo-100
            'divider': '#E5E7EB',           // gray-200
          },
          // Dark mode colors
          'dark': {
            'primary': '#818CF8',           // indigo-400
            'primary-hover': '#6366F1',     // indigo-500
            'secondary': '#A5B4FC',         // indigo-300
            'secondary-hover': '#818CF8',   // indigo-400
            'background': '#1F2937',        // gray-800
            'background-alt': '#111827',    // gray-900
            'panel': '#111827',             // gray-900
            'panel-border': '#374151',      // gray-700
            'text-main': '#F9FAFB',         // gray-50
            'text-secondary': '#9CA3AF',    // gray-400
            'text-muted': '#6B7280',        // gray-500
            'unread': '#F87171',            // red-400
            'hover': '#374151',             // gray-700
            'divider': '#374151',           // gray-700
          }
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