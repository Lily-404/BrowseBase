/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"JetBrains Mono"',
          'ui-monospace',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'monospace',
        ],
      },
      borderRadius: {
        sm: 'var(--radius-xs)',
        DEFAULT: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        '4xl': 'var(--radius-4xl)',
      },
    },
  },
  plugins: [],
};
