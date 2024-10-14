/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      height: {
        content: 'calc(100vh - 9.5rem)',
      },
      minHeight: {
        content: 'calc(100vh - 9.5rem)',
      },
      maxHeight: {
        content: 'calc(100vh - 9.5rem)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
