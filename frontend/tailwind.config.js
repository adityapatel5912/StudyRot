/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-900': 'var(--navy-900)',
        'navy-800': 'var(--navy-800)',
        'navy-700': 'var(--navy-700)',
        'navy-600': 'var(--navy-600)',
        'navy-400': 'var(--navy-400)',
        'navy-200': 'var(--navy-200)',
        'navy-100': 'var(--navy-100)',
        'off-white': 'var(--off-white)',
      },
    },
  },
  plugins: [],
};
