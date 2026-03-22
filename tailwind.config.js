export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#07070B',
        room: '#0C0C14',
        surface: '#111119',
        'surface-raised': '#18182A',
        glass: '#1A2A3A',
        cooperate: '#2DB563',
        'cooperate-dim': '#1A5C38',
        defect: '#D94545',
        'defect-dim': '#6B2222',
        accent: '#5B5FE6',
        'accent-bright': '#7B7FFF',
        chungus: '#D4A843',
        'text-primary': '#E0E0EC',
        'text-secondary': '#6E6E8A',
        'text-ghost': '#3A3A52',
        border: '#222236',
        'border-light': '#2E2E48',
        win: '#2DB563',
        lose: '#D94545',
        neutral: '#6E6E8A',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        panel: '8px',
        button: '6px',
        mirror: '4px',
        clipboard: '2px',
      },
      fontSize: {
        '2xs': '10px',
        xs: '12px',
      },
    },
  },
  plugins: [],
};
