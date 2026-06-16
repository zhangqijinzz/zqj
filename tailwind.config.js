/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'deep-ocean': '#0A1628',
        'ocean-dark': '#06101F',
        'neon-cyan': '#00F5FF',
        'neon-cyan-dim': '#00B8C2',
        'electric-purple': '#A855F7',
        'electric-purple-dim': '#7C3AED',
        'vibrant-orange': '#FF6B35',
        'vibrant-orange-dim': '#E55A2B',
        'neon-pink': '#FF00E5',
        'neon-green': '#39FF14',
        'moon-white': '#F0F4FF',
        'moon-dim': '#B8C0D0',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        body: ['"Noto Sans SC"', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 5px #00F5FF, 0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.3)',
        'neon-purple': '0 0 5px #A855F7, 0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)',
        'neon-orange': '0 0 5px #FF6B35, 0 0 20px rgba(255, 107, 53, 0.5), 0 0 40px rgba(255, 107, 53, 0.3)',
        'neon-pink': '0 0 5px #FF00E5, 0 0 20px rgba(255, 0, 229, 0.5), 0 0 40px rgba(255, 0, 229, 0.3)',
        'neon-green': '0 0 5px #39FF14, 0 0 20px rgba(57, 255, 20, 0.5), 0 0 40px rgba(57, 255, 20, 0.3)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan-line': 'scan-line 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.7', filter: 'brightness(1.3)' },
        },
        'wave': {
          '0%, 100%': { transform: 'scaleY(0.5)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(0, 245, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 255, 0.05) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
