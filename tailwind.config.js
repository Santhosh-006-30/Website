/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '480px',
      },
      colors: {
        lia: {
          bg: "#07111F",
          dark: "#0B1728",
          surface: "#10233D",
          card: "rgba(16, 35, 61, 0.65)",
          glass: "rgba(11, 23, 40, 0.75)",
          border: "rgba(255, 255, 255, 0.08)",
          borderGold: "rgba(215, 182, 90, 0.25)",
          text: "#FFFFFF",
          textMuted: "#94A3B8",
          textSub: "#CBD5E1",
          gold: "#D7B65A",
          goldLight: "#E8D89A",
          goldDim: "#A68A38",
          accentCyan: "#06B6D4",
          accentEmerald: "#10B981",
          accentAmber: "#F59E0B",
          accentRose: "#F43F5E",
          accentViolet: "#8B5CF6",
        }
      },
      fontFamily: {
        heading: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "'Manrope'", "sans-serif"],
        display: ["'Outfit'", "'Space Grotesk'", "sans-serif"],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-gold': '0 8px 32px 0 rgba(215, 182, 90, 0.15)',
        'glow-gold': '0 0 25px rgba(215, 182, 90, 0.35)',
        'glow-cyan': '0 0 25px rgba(6, 182, 212, 0.35)',
      },
      animation: {
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        glowPulse: {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(215, 182, 90, 0.3))' },
          '50%': { filter: 'drop-shadow(0 0 22px rgba(215, 182, 90, 0.6))' },
        },
      }
    },
  },
  plugins: [],
}
