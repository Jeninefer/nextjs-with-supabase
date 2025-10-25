import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        // Financial Intelligence Platform specific colors
        financial: {
          primary: "hsl(var(--financial-primary))",
          secondary: "hsl(var(--financial-secondary))",
          success: "hsl(var(--financial-success))",
          warning: "hsl(var(--financial-warning))",
          danger: "hsl(var(--financial-danger))",
        },
        // AI Toolkit integration colors
        agent: {
          active: "hsl(var(--agent-active))",
          inactive: "hsl(var(--agent-inactive))",
          processing: "hsl(var(--agent-processing))",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Financial dashboard specific spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Animation for AI agent status indicators
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'agent-thinking': 'pulse 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Plugin for financial dashboard components
    function({ addUtilities }: { addUtilities: (utilities: Record<string, unknown>, options?: unknown) => void }) {
      const newUtilities = {
        '.financial-card': {
          '@apply bg-card border border-border rounded-lg shadow-sm': {},
        },
        '.agent-status': {
          '@apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': {},
        },
        '.kpi-value': {
          '@apply text-2xl font-bold text-foreground': {},
        }
      };
      addUtilities(newUtilities);
    }
  ],
} satisfies Config;
