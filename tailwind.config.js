/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      width: {
        '128' : '32rem',
        '144' : '36rem',
        '160' : '40rem',
      },
      fontFamily: {
        body: ['Poppins']
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
