/** @type {import('tailwindcss').Config} */

// ─── Drawlead design system ──────────────────────────────────────────────
// Brand green #32B46F (brand-500) with a green-tinted "ink" neutral scale.
// `gray` and `slate` are re-pointed at the ink scale, and `green`/`emerald`
// at the brand scale, so every legacy utility in the app (text-gray-500,
// bg-green-600, …) renders in the new palette without touching page code.
const brand = {
  50: '#EEFBF3',
  100: '#D6F5E3',
  200: '#AFEAC9',
  300: '#7DD9A8',
  400: '#4FC686',
  500: '#32B46F',
  600: '#25945A',
  700: '#1E7649',
  800: '#1C5E3C',
  900: '#184D33',
  950: '#0A2B1B',
};

const ink = {
  50: '#F6F8F7',
  100: '#EEF2F0',
  200: '#E1E7E4',
  300: '#C9D2CD',
  400: '#96A39C',
  500: '#65736B',
  600: '#4B5851',
  700: '#37423C',
  800: '#222B26',
  900: '#121915',
  950: '#090E0B',
};

module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        // The whole ERP is set in Inter — `font-mono` (used for amounts,
        // codes and IDs) becomes Inter with tabular figures (see index.css).
        mono: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.011em' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.014em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.019em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.021em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.022em' }],
        '5xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.024em' }],
      },
      colors: {
        brand,
        ink,
        gray: ink,
        slate: ink,
        green: brand,
        emerald: brand,
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        canvas: "hsl(var(--canvas))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          soft: "hsl(var(--primary-soft))",
          strong: "hsl(var(--primary-strong))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          muted: "hsl(var(--sidebar-muted))",
          border: "hsl(var(--sidebar-border))",
          accent: "hsl(var(--sidebar-accent))",
        },
      },
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.5rem",
        lg: "var(--radius)",
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(18 25 21 / 0.04)",
        sm: "0 1px 2px 0 rgb(18 25 21 / 0.05), 0 1px 1px 0 rgb(18 25 21 / 0.03)",
        DEFAULT: "0 1px 3px 0 rgb(18 25 21 / 0.07), 0 1px 2px -1px rgb(18 25 21 / 0.05)",
        md: "0 6px 16px -4px rgb(18 25 21 / 0.08), 0 2px 4px -2px rgb(18 25 21 / 0.05)",
        lg: "0 14px 28px -8px rgb(18 25 21 / 0.12), 0 4px 10px -4px rgb(18 25 21 / 0.06)",
        xl: "0 24px 48px -12px rgb(18 25 21 / 0.18), 0 8px 16px -8px rgb(18 25 21 / 0.08)",
        "2xl": "0 36px 72px -18px rgb(18 25 21 / 0.28)",
        brand: "0 6px 16px -6px rgb(50 180 111 / 0.55)",
        ring: "0 0 0 4px rgb(50 180 111 / 0.16)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
