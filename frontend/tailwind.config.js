/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        brand:        '#00B4A0',
        'brand-light':'#2DD4BF',
        'brand-dim':  'rgba(0,180,160,0.10)',
        'brand-ring': 'rgba(0,180,160,0.25)',
        'd-base':     '#0D0F12',
        'd-surface':  '#141720',
        'd-elevated': '#1A1E2A',
        'd-card':     '#212633',
        'd-border':   '#2E3545',
        'd-line':     'rgba(255,255,255,0.06)',
        'd-primary':  '#FFFFFF',
        'd-secondary':'#A8B4C4',
        'd-muted':    '#7A8699',
        ok:           '#22D3A0',
        warn:         '#F4A72B',
        bad:          '#F45B5B',
        'ok-bg':      'rgba(34,211,160,0.10)',
        'warn-bg':    'rgba(244,167,43,0.10)',
        'bad-bg':     'rgba(244,91,91,0.10)',
        'ok-ring':    'rgba(34,211,160,0.25)',
        'warn-ring':  'rgba(244,167,43,0.25)',
        'bad-ring':   'rgba(244,91,91,0.25)',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'brand':    '0 0 24px rgba(0,180,160,0.25)',
        'brand-sm': '0 0 12px rgba(0,180,160,0.15)',
      },
    },
  },
  plugins: [],
}
