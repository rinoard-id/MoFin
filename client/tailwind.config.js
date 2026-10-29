/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bgMain: '#111014',
        surface: '#201C23',
        surfaceSecondary: '#29212B',
        borderCustom: '#403340',
        primaryPink: '#F044A5',
        lightPink: '#F9A8D4',
        textPrimary: '#FFFFFF',
        textSecondary: '#C4BAC5',
        textMuted: '#AFA4B1',
        successGreen: '#86EFAC',
        warningYellow: '#FCD34D',
        errorRed: '#FCA5A5',
        infoBlue: '#93C5FD',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
