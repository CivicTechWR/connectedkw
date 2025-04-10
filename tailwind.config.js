/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'red': '#FF4438',
        'yellow': '#FFB800',
        'blue': '#0066FF',
        'green': '#00B67F',
        'grey': '#F5F5F5',
        'black': '#1A1A1A',
      },
      fontFamily: {
        'title': ['var(--font-title)'],
        'sans': ['var(--font-sans)'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
