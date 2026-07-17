/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'sees-forest':  '#002D22',
        'sees-mint':    '#A7FFEB',
        'sees-mustard': '#E4A11B',
        'sees-teal':    '#004D40',
        'sees-void':    '#000F0D',
        'sees-glass':   'rgba(0,45,34,0.4)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-sees': 'linear-gradient(135deg, #000F0D 0%, #002D22 50%, #004D40 100%)',
        'gradient-card': 'linear-gradient(145deg, rgba(0,45,34,0.6) 0%, rgba(0,77,64,0.3) 100%)',
      },
      boxShadow: {
        'sees-glow':   '0 0 30px rgba(167,255,235,0.15)',
        'sees-card':   '0 8px 32px rgba(0,0,0,0.4)',
        'sees-active': '0 0 20px rgba(167,255,235,0.3)',
      },
      backdropBlur: {
        'sees': '20px',
      },
      keyframes: {
        'marquee-left': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-right': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'wave-pulse': {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(1.35)' },
        },
      },
      animation: {
        'marquee-left': 'marquee-left 22s linear infinite',
        'marquee-right': 'marquee-right 26s linear infinite',
        'wave-pulse': 'wave-pulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

