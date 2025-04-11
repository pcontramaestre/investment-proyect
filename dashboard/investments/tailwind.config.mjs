/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5', // indigo-600
        'primary-light': '#818cf8', // indigo-400
        secondary: '#10b981', // emerald-500
        'secondary-light': '#34d399', // emerald-400
        accent: '#f59e0b', // amber-500
        'accent-light': '#fbbf24', // amber-400
        'dark-bg': '#0f172a', // slate-900
        'dark-card': '#1e293b', // slate-800
        'dark-border': '#334155', // slate-700
        'dark-text': '#f1f5f9', // slate-100
        'dark-text-secondary': '#94a3b8', // slate-400
      },
    },
  },
  plugins: [],
  // Habilitar características experimentales de Tailwind CSS v4
  future: {
    enableAllExperimentalFeatures: true
  },
  // Configuración específica para @theme
  experimental: {
    optimizeUniversalDefaults: true
  }
}
