/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          DEFAULT: '#0a0a0a',
          900: '#0f0f0f',
          800: '#1a1a1a',
          700: '#252525',
        },
        gold: {
          DEFAULT: '#C9A24B',
          light: '#E8C97A',
          dark: '#A88630',
        },
        cream: '#F5F0E8',
      },
      fontFamily: {
        arabic: ['"Noto Naskh Arabic"', 'serif'],
        body: ['Rubik', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 4px 20px -3px rgba(201, 162, 75, 0.15)',
        'gold-hover': '0 8px 30px -3px rgba(201, 162, 75, 0.3)',
        'card': '0 4px 15px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.5)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A24B 0%, #E8C97A 50%, #C9A24B 100%)',
      },
    },
  },
  plugins: [],
}
