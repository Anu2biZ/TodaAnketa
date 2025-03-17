/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'toda': {
          bg: '#252936',
          primary: '#DA2363',
          secondary: '#F83E5F',
          accent: '#FF7C68',
        }
      },
      fontFamily: {
        'raleway': ['Raleway', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
