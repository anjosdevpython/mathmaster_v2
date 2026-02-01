/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        // Cybernetic Flow Palette
        background: '#020617', // Slate 950 - Deep Space
        surface: '#0F172A',    // Slate 900 - Panel
        surfaceLight: '#1E293B', // Slate 800 - Component

        primary: {
          DEFAULT: '#10B981', // Emerald 500 - Success/Go
          hover: '#059669',
          glow: 'rgba(16, 185, 129, 0.4)'
        },

        secondary: {
          DEFAULT: '#F59E0B', // Amber 500 - Warning/Wait
          hover: '#D97706',
        },

        accent: {
          DEFAULT: '#0EA5E9', // Sky 500 - Info (NOT PURPLE)
          hover: '#0284C7',
        },

        danger: {
          DEFAULT: '#EF4444', // Red 500 - Error
          glow: 'rgba(239, 68, 68, 0.4)'
        }
      },
      borderRadius: {
        'tech': '12px', // Modern, slightly rounded
        'panel': '24px', // Friendly containers
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-danger': '0 0 20px rgba(239, 68, 68, 0.3)',
        'panel': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [],
}
