import plugin from "tailwindcss/plugin";
import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

const flattenColorPalette = (colors: Record<string, unknown>, prefix = ""): Record<string, string> => {
  const entries = Object.entries(colors ?? {});
  return entries.reduce<Record<string, string>>((acc, [key, value]) => {
    let normalizedKey: string;
    if (key === "DEFAULT") {
      normalizedKey = prefix;
    } else if (prefix) {
      normalizedKey = `${prefix}-${key}`;
    } else {
      normalizedKey = key;
    }
    
    if (!normalizedKey) {
      return acc;
    }
    if (typeof value === "string") {
      acc[normalizedKey] = value;
      return acc;
    }
    if (value && typeof value === "object") {
      Object.assign(acc, flattenColorPalette(value as Record<string, unknown>, normalizedKey));
    }
    return acc;
  }, {});
};

const addVariablesForColors = plugin(({ addBase, theme }) => {
  const colors = theme("colors") ?? {};
  const flattened = flattenColorPalette(colors as Record<string, unknown>);
  const cssVariables = Object.fromEntries(
    Object.entries(flattened).map(([name, value]) => [`--${name.replaceAll(/[./]/g, "-")}`, value])
  );
  addBase({ ":root": cssVariables });
});

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: '#f3f0ff',
          100: '#e9e5ff',
          200: '#d6cfff',
          300: '#c1a6ff', // ABACO Primary purple
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#5f4896', // ABACO Purple dark
          700: '#553c9a',
          800: '#4c1d95',
          900: '#3b0764',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      fontFamily: {
        'lato': ['Lato', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      }
    }
  },
  plugins: [addVariablesForColors, animatePlugin]
} satisfies Config;

export default config;
