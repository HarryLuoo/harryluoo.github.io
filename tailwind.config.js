/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'academic-black': '#0d0d0d',
        'academic-orange': '#be5d36', // Burnt orange
        'academic-cream': '#f2f0e9', // Off-white background
        'academic-gray': '#a3a3a3',
      },
      fontFamily: {
        // Mapping 'sans' to Palatino for body text as requested (overriding default sans)
        sans: ['"Palatino Linotype"', '"Book Antiqua"', 'Palatino', 'serif'],
        // Mapping 'serif' to Cinzel (Trajan alternative) for titles
        serif: ['Cinzel', 'serif'],
        // Chinese Serif font
        'serif-cn': ['"Noto Serif SC"', 'serif'],
      }
    },
  },
  plugins: [],
}
