const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        border: '#d4e9d4',
        input: '#e8f5e9',
        ring: '#d85252',
        background: '#fcfff5',
        foreground: '#003300',
        primary: {
          DEFAULT: '#d85252',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#338533',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#d85252',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1f8e9',
          foreground: '#4caf50',
        },
        accent: {
          DEFAULT: '#e8f5e9',
          foreground: '#1b5e20',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#003300',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#003300',
        },
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    function ({ addUtilities, addVariant }) {
      addVariant('dark', '&:is(.dark *)')
      
      // Add dark mode color utilities
      addUtilities({
        '.dark': {
          '--color-border': '#2a3b32',
          '--color-input': '#2a3b32', 
          '--color-ring': '#d85252',
          '--color-background': '#0a140f',
          '--color-foreground': '#e0e0e0',
          '--color-primary': '#d85252',
          '--color-primary-foreground': '#ffffff',
          '--color-secondary': '#338533',
          '--color-secondary-foreground': '#ffffff',
          '--color-destructive': '#8b0000',
          '--color-destructive-foreground': '#ffffff',
          '--color-muted': '#1a2b22',
          '--color-muted-foreground': '#a0a0a0',
          '--color-accent': '#2a4035',
          '--color-accent-foreground': '#e0e0e0',
          '--color-popover': '#0a140f',
          '--color-popover-foreground': '#f0f0f0',
          '--color-card': '#102118',
          '--color-card-foreground': '#f0f0f0',
        }
      })
      
      // Add dark mode color classes
      addUtilities({
        '.dark .bg-background': { 'background-color': '#0a140f' },
        '.dark .bg-foreground': { 'background-color': '#e0e0e0' },
        '.dark .bg-card': { 'background-color': '#102118' },
        '.dark .bg-card-foreground': { 'background-color': '#f0f0f0' },
        '.dark .bg-popover': { 'background-color': '#0a140f' },
        '.dark .bg-popover-foreground': { 'background-color': '#f0f0f0' },
        '.dark .bg-primary': { 'background-color': '#d85252' },
        '.dark .bg-primary-foreground': { 'background-color': '#ffffff' },
        '.dark .bg-secondary': { 'background-color': '#338533' },
        '.dark .bg-secondary-foreground': { 'background-color': '#ffffff' },
        '.dark .bg-destructive': { 'background-color': '#8b0000' },
        '.dark .bg-destructive-foreground': { 'background-color': '#ffffff' },
        '.dark .bg-muted': { 'background-color': '#1a2b22' },
        '.dark .bg-muted-foreground': { 'background-color': '#a0a0a0' },
        '.dark .bg-accent': { 'background-color': '#2a4035' },
        '.dark .bg-accent-foreground': { 'background-color': '#e0e0e0' },
        '.dark .bg-border': { 'background-color': '#2a3b32' },
        '.dark .bg-input': { 'background-color': '#2a3b32' },
        '.dark .bg-ring': { 'background-color': '#d85252' },
        
        '.dark .text-background': { 'color': '#0a140f' },
        '.dark .text-foreground': { 'color': '#e0e0e0' },
        '.dark .text-card': { 'color': '#102118' },
        '.dark .text-card-foreground': { 'color': '#f0f0f0' },
        '.dark .text-popover': { 'color': '#0a140f' },
        '.dark .text-popover-foreground': { 'color': '#f0f0f0' },
        '.dark .text-primary': { 'color': '#d85252' },
        '.dark .text-primary-foreground': { 'color': '#ffffff' },
        '.dark .text-secondary': { 'color': '#338533' },
        '.dark .text-secondary-foreground': { 'color': '#ffffff' },
        '.dark .text-destructive': { 'color': '#8b0000' },
        '.dark .text-destructive-foreground': { 'color': '#ffffff' },
        '.dark .text-muted': { 'color': '#1a2b22' },
        '.dark .text-muted-foreground': { 'color': '#a0a0a0' },
        '.dark .text-accent': { 'color': '#2a4035' },
        '.dark .text-accent-foreground': { 'color': '#e0e0e0' },
        '.dark .text-border': { 'color': '#2a3b32' },
        '.dark .text-input': { 'color': '#2a3b32' },
        '.dark .text-ring': { 'color': '#d85252' },
        
        '.dark .border-background': { 'border-color': '#0a140f' },
        '.dark .border-foreground': { 'border-color': '#e0e0e0' },
        '.dark .border-card': { 'border-color': '#102118' },
        '.dark .border-card-foreground': { 'border-color': '#f0f0f0' },
        '.dark .border-popover': { 'border-color': '#0a140f' },
        '.dark .border-popover-foreground': { 'border-color': '#f0f0f0' },
        '.dark .border-primary': { 'border-color': '#d85252' },
        '.dark .border-primary-foreground': { 'border-color': '#ffffff' },
        '.dark .border-secondary': { 'border-color': '#338533' },
        '.dark .border-secondary-foreground': { 'border-color': '#ffffff' },
        '.dark .border-destructive': { 'border-color': '#8b0000' },
        '.dark .border-destructive-foreground': { 'border-color': '#ffffff' },
        '.dark .border-muted': { 'border-color': '#1a2b22' },
        '.dark .border-muted-foreground': { 'border-color': '#a0a0a0' },
        '.dark .border-accent': { 'border-color': '#2a4035' },
        '.dark .border-accent-foreground': { 'border-color': '#e0e0e0' },
        '.dark .border-border': { 'border-color': '#2a3b32' },
        '.dark .border-input': { 'border-color': '#2a3b32' },
        '.dark .border-ring': { 'border-color': '#d85252' },
      })
    }
  ],
};
