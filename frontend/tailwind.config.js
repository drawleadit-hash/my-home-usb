/** @type {import('tailwindcss').Config} */

// ─── Drawlead design system ──────────────────────────────────────────────
// Brick red #B14E2F (brand-500) against warm stone greys — the warmth of
// brick, clay and stone. The "ink" neutral scale is a warm stone grey
// (text #171310, near-black #0D0B09), never a cool blue-grey.
// `gray`, `slate`, `zinc`, `neutral` and `stone` are re-pointed at the ink
// scale, and `green`/`emerald` at the brand scale, so every legacy utility in
// the app (text-gray-500, bg-green-600, …) renders in the new palette without
// touching page code. "Good" states therefore read brick: the brand colour
// stands for "handled". Red = missed, amber = pending, blue/violet = labels.
const brand = {
  50: '#FBF3EF',
  100: '#F6E2DA',
  200: '#EDC5B6',
  300: '#DF9E86',
  400: '#CD7051',
  500: '#B14E2F',
  600: '#923F26',
  700: '#773320',
  800: '#5D291A',
  900: '#461E14',
  950: '#2D120B',
};

const ink = {
  50: '#FAFAF9',
  100: '#F5F5F4',
  200: '#E7E5E4',
  300: '#D6D3D1',
  400: '#A8A29E',
  500: '#78716C',
  600: '#57534E',
  700: '#44403C',
  800: '#292524',
  900: '#171310',
  950: '#0D0B09',
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
        // Plus Jakarta Sans for the UI; Inter only fills glyphs it lacks.
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        // `font-mono` (used for amounts, codes and IDs) stays in the UI face
        // with tabular figures (see index.css).
        mono: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
        zinc: ink,
        neutral: ink,
        stone: ink,
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
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          hover: "hsl(var(--sidebar-hover))",
          strong: "hsl(var(--sidebar-strong))",
        },
      },
      // Rounded but not bubbly: buttons/inputs 12px (lg), cards 14–20px
      // (xl–2xl), pills and chips fully round.
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.5rem",
        lg: "var(--radius)",
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      // Soft shadows with a warm (brown-black) tint; `brand` is the brick glow
      // under primary buttons, `ring` the faint brick outline on focus.
      boxShadow: {
        xs: "0 1px 2px 0 rgb(45 30 20 / 0.04)",
        sm: "0 1px 2px 0 rgb(45 30 20 / 0.05), 0 1px 1px 0 rgb(45 30 20 / 0.03)",
        DEFAULT: "0 1px 3px 0 rgb(45 30 20 / 0.07), 0 1px 2px -1px rgb(45 30 20 / 0.05)",
        md: "0 8px 20px -6px rgb(45 30 20 / 0.10), 0 2px 4px -2px rgb(45 30 20 / 0.05)",
        lg: "0 16px 32px -10px rgb(45 30 20 / 0.14), 0 4px 10px -4px rgb(45 30 20 / 0.06)",
        xl: "0 24px 48px -12px rgb(45 30 20 / 0.20), 0 8px 16px -8px rgb(45 30 20 / 0.08)",
        "2xl": "0 36px 72px -18px rgb(45 30 20 / 0.30)",
        brand: "0 6px 16px -6px rgb(177 78 47 / 0.55)",
        "brand-lg": "0 10px 24px -8px rgb(177 78 47 / 0.6)",
        ring: "0 0 0 4px rgb(177 78 47 / 0.14)",
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
        // Cards and sections slide up into place.
        rise: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // `backwards`, not `both`: once finished the card drops the animated
        // transform, so the .card-lift hover can move it again.
        rise: "rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) backwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
