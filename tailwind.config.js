/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgBase: "#0a0a0c",
        surface: "rgba(255, 255, 255, 0.03)",
        surfaceHover: "rgba(255, 255, 255, 0.06)",
        surfaceActive: "rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(255, 255, 255, 0.08)",
        borderHighlight: "rgba(255, 255, 255, 0.15)",
        primary: "#8b5cf6",
        primaryHover: "#7c3aed",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        textMain: "#f8fafc",
        textMuted: "#94a3b8",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px rgba(139, 92, 246, 0.4)',
        glowHover: '0 0 25px rgba(139, 92, 246, 0.4)',
        successGlow: '0 0 15px rgba(16, 185, 129, 0.3)',
        cardHover: '0 10px 40px rgba(0,0,0,0.3)',
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out forwards',
        slideDown: 'slideDown 0.4s ease-out forwards',
        slideUp: 'slideUp 0.4s ease-out forwards',
        modalIn: 'modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
