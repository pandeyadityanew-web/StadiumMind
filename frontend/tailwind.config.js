/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0D1117',
        cardBg: 'rgba(22, 27, 34, 0.75)',
        neonGreen: '#00FF7F',
        neonCyan: '#00F0FF',
        neonRed: '#FF4136',
        neonYellow: '#FFDC00',
      },
      fontFamily: {
        outfit: ['var(--font-outfit)', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
