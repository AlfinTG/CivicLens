/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006948',
          container: '#00855d',
          fixed: '#85f8c4',
          'fixed-dim': '#68dba9',
        },
        'on-primary': '#ffffff',
        'on-primary-container': '#f5fff7',
        secondary: {
          DEFAULT: '#565e74',
          container: '#dae2fd',
          fixed: '#dae2fd',
          'fixed-dim': '#bec6e0',
        },
        'on-secondary': '#ffffff',
        'on-secondary-container': '#5c647a',
        'on-secondary-fixed': '#131b2e',
        tertiary: {
          DEFAULT: '#00685f',
          container: '#008378',
          fixed: '#89f5e7',
          'fixed-dim': '#6bd8cb',
        },
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#f4fffc',
        surface: {
          DEFAULT: '#f8f9ff',
          dim: '#cbdbf5',
          bright: '#f8f9ff',
          'container-lowest': '#ffffff',
          'container-low': '#eff4ff',
          container: '#e5eeff',
          'container-high': '#dce9ff',
          'container-highest': '#d3e4fe',
        },
        'on-surface': '#0b1c30',
        'on-surface-variant': '#3d4a42',
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        outline: {
          DEFAULT: '#6d7a72',
          variant: '#bccac0',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': '#ffffff',
        'on-error-container': '#93000a',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        DEFAULT: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(15, 23, 42, 0.03)',
        xs: '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
      },
    },
  },
  plugins: [],
};
