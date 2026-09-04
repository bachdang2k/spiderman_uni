/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#080A12',
        navy: '#101426',
        inkblue: '#172554',
        webred: '#E63946',
        cream: '#F7F1E3',
        gold: '#D4A84F',
        petal: '#D96C75',
      },
      fontFamily: { display: ['Cormorant Garamond', 'serif'], body: ['Manrope', 'sans-serif'] },
    },
  },
  plugins: [],
}
